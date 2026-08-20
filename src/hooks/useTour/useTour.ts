import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TooltipShowOptions } from '../../types';
import type {
  CurrentTourStep,
  TourDirection,
  TourOptions,
  TourProgress,
  TourTargetMissingAction,
  UseTourReturn,
} from '../../types/tour';
import { generateTooltipId } from '../../utils/parseDataAttributes';
import { useTipMagic } from '../useTipMagic';
import { TOUR_ACTIONS, TOUR_DATA_ATTRIBUTES } from './constants';
import {
  buildCurrentStep,
  buildTourContent,
  calculateProgress,
  createBackdropManager,
  createHighlightManager,
  createTargetWatcher,
  filterVisibleSteps,
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  resolveFocus,
  resolveStepContent,
  resolveTargetElement,
} from './utils';

/**
 * A step that can render, and the element it renders against
 */
interface ResolvedStep {
  index: number;
  element: HTMLElement;
}

/**
 * How each entry point recovers when a step's target is not in the DOM.
 *
 * The distinction matters: forward motion has nowhere to fall back to, so an
 * unresolvable run ends the tour, but going back or jumping happens while the current
 * step is still rendering fine, so failing there should leave it untouched. An explicit
 * jump additionally never skips - landing on a step the caller did not ask for is worse
 * than not moving.
 */
const TOUR_RECOVERY: Record<
  TourDirection,
  { delta: 1 | -1; allowSkip: boolean; onExhausted: 'end' | 'stay' }
> = {
  next: { delta: 1, allowSkip: true, onExhausted: 'end' },
  prev: { delta: -1, allowSkip: true, onExhausted: 'stay' },
  jump: { delta: 1, allowSkip: false, onExhausted: 'stay' },
};

/**
 * Simplified hook for creating guided tours
 *
 * Combines step management, tooltip integration, and navigation into a single,
 * headless API. Users define steps and get back ready-to-use state and controls.
 *
 * @example
 * ```tsx
 * // Simple usage
 * const tour = useTour({
 *   steps: [
 *     { target: 'sidebar', content: 'Navigate from here' },
 *     { target: 'search', content: 'Search for items' },
 *     { target: 'profile', content: 'Your account settings' },
 *   ],
 * });
 *
 * return (
 *   <>
 *     <button onClick={tour.start}>Start Tour</button>
 *
 *     {tour.isActive && (
 *       <div className="tour-controls">
 *         <span>{tour.progress.current} of {tour.progress.total}</span>
 *         <button onClick={tour.prev} disabled={tour.currentStep?.isFirst}>Back</button>
 *         <button onClick={tour.next}>
 *           {tour.currentStep?.isLast ? 'Finish' : 'Next'}
 *         </button>
 *         <button onClick={tour.end}>Exit</button>
 *       </div>
 *     )}
 *
 *     <Dashboard />
 *   </>
 * );
 * ```
 *
 * @example
 * ```tsx
 * // Built-in controls instead of your own
 * const tour = useTour({
 *   steps: [
 *     { target: 'sidebar', content: 'Navigate from here' },
 *     { target: 'search', content: 'Search for items' },
 *   ],
 *   navigation: { showControls: true },
 *   progress: { show: true },
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Advanced usage with callbacks
 * const tour = useTour({
 *   steps: [
 *     {
 *       target: 'sidebar',
 *       title: 'Navigation',
 *       content: 'Access all sections here',
 *       placement: 'right',
 *       onEnter: () => analytics.track('tour_step_1'),
 *     },
 *     {
 *       target: 'search',
 *       content: (step) => `Step ${step.index + 1}: Search here`,
 *       condition: () => hasSearchFeature,
 *     },
 *   ],
 *   onStart: () => console.log('Tour started'),
 *   onEnd: (completed) => console.log(completed ? 'Completed!' : 'Skipped'),
 *   onStepChange: (step, direction) => trackStep(step),
 *   onTargetMissing: (step) => logger.warn('missing target', step.target),
 *   tooltipOptions: { placement: 'bottom', interactive: true },
 *   autoScroll: true,
 * });
 *
 * // start() reports whether the tour actually opened
 * if (tour.start()) {
 *   markTourAsSeen();
 * }
 * ```
 */
export function useTour(options: TourOptions): UseTourReturn {
  const {
    steps,
    onStart,
    onEnd,
    onStepChange,
    onTargetMissing,
    tooltipOptions,
    autoScroll = true,
    highlightClass,
    navigation,
    focus: tourFocus = false,
    progress: tourProgress,
  } = options;

  const { tooltip, helper, config } = useTipMagic();

  // Internal state
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Keep refs of the state that's read from callbacks and observers, always up to date
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  // DOM managers (created once and reused)
  const backdropManagerRef = useRef(createBackdropManager());
  const highlightManagerRef = useRef(
    createHighlightManager(highlightClass ?? config.tourHighlightClass)
  );
  const targetWatcherRef = useRef(createTargetWatcher());

  // One id per tour instance for the panel's aria-labelledby. Generated rather than
  // hardcoded so it cannot collide with an id the host page already owns, and held for
  // the instance rather than per step so the label does not churn between steps.
  const titleIdRef = useRef('');
  if (!titleIdRef.current) {
    titleIdRef.current = `${generateTooltipId()}-title`;
  }

  // Refs for navigation handlers to avoid stale closures
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});
  const endRef = useRef<() => void>(() => {});
  const targetLostRef = useRef<() => void>(() => {});

  // Compute visible steps (filter out steps with condition returning false)
  const visibleSteps = useMemo(() => filterVisibleSteps(steps), [steps]);

  // Get the effective highlight class (from options or provider config)
  const effectiveHighlightClass = highlightClass ?? config.tourHighlightClass;

  // Update highlight manager when class changes
  useEffect(() => {
    highlightManagerRef.current.setHighlightClass(effectiveHighlightClass);
  }, [effectiveHighlightClass]);

  /**
   * Report a target that could not be resolved, and ask how to recover
   *
   * The console warning is the fallback for consumers who have not supplied a handler;
   * hosts that ban `console.*` provide `onTargetMissing` and route it themselves.
   */
  const notifyTargetMissing = useCallback(
    (step: CurrentTourStep): TourTargetMissingAction | void => {
      if (onTargetMissing) {
        return onTargetMissing(step);
      }
      console.warn(`useTour: Could not find target element with data-tip-id="${step.target}"`);
    },
    [onTargetMissing]
  );

  /**
   * Find a step that can actually render, starting at an index
   *
   * Returns the element alongside the index so callers do not have to query the document
   * a second time for the target this just proved exists.
   *
   * @param fromIndex - Where to start looking
   * @param delta - Direction to walk (1 forward, -1 backward)
   * @param allowSkip - Whether `onTargetMissing` may move past an unresolvable step.
   *   False for an explicit jump, which should land where it was asked to or nowhere.
   * @returns The step and its element, or null if there is none to continue with
   */
  const findResolvableStep = useCallback(
    (fromIndex: number, delta: 1 | -1, allowSkip: boolean): ResolvedStep | null => {
      for (let index = fromIndex; index >= 0 && index < visibleSteps.length; index += delta) {
        const element = resolveTargetElement(visibleSteps[index].target);
        if (element) {
          return { index, element };
        }

        const stepData = buildCurrentStep(visibleSteps, index);
        if (!stepData) {
          return null;
        }

        const action = notifyTargetMissing(stepData);
        if (!allowSkip || action !== 'skip') {
          return null;
        }
      }

      return null;
    },
    [visibleSteps, notifyTargetMissing]
  );

  /**
   * Show tooltip for a step
   *
   * The target element is resolved by the caller, so this is only ever reached for a
   * step that can actually render.
   */
  const showStepTooltip = useCallback(
    (stepIndex: number, targetElement: HTMLElement) => {
      const step = visibleSteps[stepIndex];
      const currentStepData = buildCurrentStep(visibleSteps, stepIndex);
      if (!step || !currentStepData) return;

      // Highlight element
      highlightManagerRef.current.highlight(targetElement);

      // Handle focus/backdrop
      const focusOptions = resolveFocus(tourFocus, step);
      if (focusOptions.enabled) {
        backdropManagerRef.current.show(targetElement, {
          blockInteraction: focusOptions.block,
          onClick: focusOptions.dismissOnClick ? () => endRef.current() : undefined,
        });
      } else {
        backdropManagerRef.current.hide();
      }

      // Notice when the target is unmounted, and - only when there is a consumer class
      // that would be lost - when the host app rewrites its className
      targetWatcherRef.current.watch(targetElement, {
        onDetached: () => targetLostRef.current(),
        ...(effectiveHighlightClass && {
          onClassRewritten: () => {
            highlightManagerRef.current.reapply();
            backdropManagerRef.current.reapplyFocusTarget();
          },
        }),
      });

      // Scroll into view if enabled
      if (autoScroll) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }

      // Get merged navigation config
      const mergedNav = getMergedNavigation(navigation, step);

      // Get merged progress options for this step
      const progressOptions = getMergedProgress(tourProgress, step);
      const showProgress = progressOptions.show;

      // Resolve content
      const resolvedContent = resolveStepContent(step, currentStepData);

      // Build tour content with navigation if needed
      const hasNavFeatures = hasNavigationFeatures(mergedNav, step, showProgress);
      const finalContent = hasNavFeatures
        ? buildTourContent(
            step,
            currentStepData,
            mergedNav,
            resolvedContent,
            showProgress ? progressOptions : null,
            titleIdRef.current
          )
        : resolvedContent;

      // Merge tooltip options: tour panel defaults < tour options < step overrides <
      // the values the tour panel cannot function without
      const mergedOptions: TooltipShowOptions = {
        // The panel holds prose, a header row and a nav row - it has to be able to wrap.
        // Overridable, unlike the forced values below.
        ...(hasNavFeatures && { wordWrap: true }),
        ...tooltipOptions,
        ...step.tooltipOptions,
        content: finalContent,
        placement: step.placement ?? tooltipOptions?.placement,
        // Enable html and interactive when using navigation features, and present the
        // panel as a dialog - role="tooltip" is a description, so screen readers would
        // not expose the buttons inside it
        ...(hasNavFeatures && {
          html: true,
          interactive: true,
          role: 'dialog' as const,
          ariaLabelledBy: step.title ? titleIdRef.current : undefined,
          autoFocus: mergedNav.autoFocus,
        }),
      };

      // Show the tooltip
      tooltip.show(targetElement, mergedOptions);
    },
    [
      visibleSteps,
      tooltip,
      tooltipOptions,
      autoScroll,
      tourFocus,
      tourProgress,
      navigation,
      effectiveHighlightClass,
    ]
  );

  /**
   * Clean up highlight, backdrop, watcher, and hide tooltip
   */
  const cleanup = useCallback(() => {
    tooltip.hide();
    targetWatcherRef.current.unwatch();
    backdropManagerRef.current.hide();
    highlightManagerRef.current.clear();
  }, [tooltip]);

  /**
   * Tear the tour down and report the outcome
   */
  const finishTour = useCallback(
    (completed: boolean) => {
      // Use ref for current index to always get latest value
      const idx = currentIndexRef.current;

      // Call onExit for current step
      const currentStep = visibleSteps[idx];
      if (currentStep?.onExit) {
        currentStep.onExit();
      }

      cleanup();
      helper.endFlow();
      setIsActive(false);
      isActiveRef.current = false;
      setCurrentIndex(-1);
      currentIndexRef.current = -1;

      if (onEnd) {
        onEnd(completed);
      }
    },
    [visibleSteps, cleanup, helper, onEnd]
  );

  /**
   * Navigate to a specific step
   *
   * @returns Whether the tour moved
   */
  const navigateToStep = useCallback(
    (newIndex: number, direction: TourDirection): boolean => {
      if (newIndex < 0 || newIndex >= visibleSteps.length) {
        return false;
      }

      // A step whose target has gone missing must not leave the previous step's
      // highlight, backdrop and content on screen while the index moves on
      const recovery = TOUR_RECOVERY[direction];
      const resolved = findResolvableStep(newIndex, recovery.delta, recovery.allowSkip);

      if (!resolved) {
        // Only forward motion ends the tour. Going back or jumping while the current
        // step is still rendering fine should leave it alone.
        if (recovery.onExhausted === 'end') {
          finishTour(false);
        }
        return false;
      }

      const { index: targetIndex, element: targetElement } = resolved;

      // Use ref for current index to get the previous step
      const prevIdx = currentIndexRef.current;
      const previousStep = visibleSteps[prevIdx];
      const nextStep = visibleSteps[targetIndex];

      // Call onExit for previous step
      if (previousStep?.onExit) {
        previousStep.onExit();
      }

      // Update state
      setCurrentIndex(targetIndex);
      currentIndexRef.current = targetIndex;

      // Keep the helper flow on the same step, even when steps were skipped
      helper.goToStep(targetIndex);

      // Show tooltip for new step
      showStepTooltip(targetIndex, targetElement);

      // Call onEnter for new step
      if (nextStep?.onEnter) {
        nextStep.onEnter();
      }

      // Call onStepChange callback
      const currentStepData = buildCurrentStep(visibleSteps, targetIndex);
      if (currentStepData && onStepChange) {
        onStepChange(currentStepData, direction);
      }

      return true;
    },
    [visibleSteps, showStepTooltip, onStepChange, findResolvableStep, finishTour, helper]
  );

  /**
   * Start the tour
   */
  const start = useCallback((): boolean => {
    if (visibleSteps.length === 0) {
      console.warn('useTour: No steps available to start the tour');
      return false;
    }

    // Resolve before mutating anything: a tour that cannot render must not report
    // itself as started, or consumers using onStart to mark it seen retire a tour the
    // user never saw
    const resolved = findResolvableStep(0, 1, true);
    if (!resolved) {
      return false;
    }

    const { index: startIndex, element: targetElement } = resolved;

    setIsActive(true);
    isActiveRef.current = true;
    setCurrentIndex(startIndex);
    currentIndexRef.current = startIndex;

    // Sync with helper flow state
    const flowSteps = visibleSteps.map((step, index) => ({
      id: `tour-step-${index}`,
      targetId: step.target,
      message: step.text ?? (typeof step.content === 'string' ? step.content : ''),
    }));
    helper.startFlow(flowSteps);
    // startFlow always opens at 0; a skipped first step means we are elsewhere
    if (startIndex !== 0) {
      helper.goToStep(startIndex);
    }

    // Show first step tooltip
    showStepTooltip(startIndex, targetElement);

    // Call onEnter for first step
    const firstStep = visibleSteps[startIndex];
    if (firstStep?.onEnter) {
      firstStep.onEnter();
    }

    // Call onStart callback
    if (onStart) {
      onStart();
    }

    // Call onStepChange for initial step
    const currentStepData = buildCurrentStep(visibleSteps, startIndex);
    if (currentStepData && onStepChange) {
      onStepChange(currentStepData, 'next');
    }

    return true;
  }, [visibleSteps, helper, showStepTooltip, onStart, onStepChange, findResolvableStep]);

  /**
   * End the tour (incomplete)
   */
  const end = useCallback(() => {
    if (!isActiveRef.current) return;

    finishTour(false);
  }, [finishTour]);

  /**
   * Go to next step
   */
  const next = useCallback(() => {
    if (!isActiveRef.current) return;

    // Use ref for current index to always get latest value
    const idx = currentIndexRef.current;
    const isLastStep = idx === visibleSteps.length - 1;

    if (isLastStep) {
      // End tour as complete
      finishTour(true);
    } else {
      navigateToStep(idx + 1, 'next');
    }
  }, [visibleSteps.length, navigateToStep, finishTour]);

  /**
   * Go to previous step
   *
   * A no-op if the previous step cannot render - the tour stays where it is rather than
   * ending, since the current step is still fine.
   */
  const prev = useCallback(() => {
    // Use ref for current index to always get latest value
    const idx = currentIndexRef.current;
    if (!isActiveRef.current || idx === 0) return;

    navigateToStep(idx - 1, 'prev');
  }, [navigateToStep]);

  /**
   * Recover from the current step's target leaving the DOM
   */
  const handleTargetLost = useCallback(() => {
    if (!isActiveRef.current) return;

    const idx = currentIndexRef.current;
    const stepData = buildCurrentStep(visibleSteps, idx);
    const action = stepData ? notifyTargetMissing(stepData) : undefined;

    if (action === 'skip' && idx + 1 < visibleSteps.length) {
      navigateToStep(idx + 1, 'next');
      return;
    }

    finishTour(false);
  }, [visibleSteps, notifyTargetMissing, navigateToStep, finishTour]);

  // Update refs synchronously during render (before any effects run)
  nextRef.current = next;
  prevRef.current = prev;
  endRef.current = end;
  targetLostRef.current = handleTargetLost;

  /**
   * Jump to a specific step
   *
   * Never lands anywhere other than the requested index: an explicit jump that quietly
   * arrives somewhere else is worse than one that does nothing and reports it.
   *
   * @returns Whether the tour moved to the requested step
   */
  const goTo = useCallback(
    (index: number): boolean => {
      if (!isActiveRef.current) return false;

      if (index < 0 || index >= visibleSteps.length) {
        console.warn(
          `useTour: Invalid step index ${index}. Valid range: 0-${visibleSteps.length - 1}`
        );
        return false;
      }

      // Use ref for current index to always get latest value
      if (index === currentIndexRef.current) return true;

      return navigateToStep(index, 'jump');
    },
    [visibleSteps.length, navigateToStep]
  );

  // Build current step data
  const currentStep = useMemo((): CurrentTourStep | null => {
    if (!isActive || currentIndex < 0) {
      return null;
    }
    return buildCurrentStep(visibleSteps, currentIndex);
  }, [isActive, currentIndex, visibleSteps]);

  // Progress info
  const progress = useMemo(
    (): TourProgress => calculateProgress(isActive, currentIndex, visibleSteps.length),
    [isActive, currentIndex, visibleSteps.length]
  );

  // Handle navigation button activation via data-tour-action attributes
  useEffect(() => {
    if (!isActive) return;

    /**
     * Run the data-tour-action carried by the event's target, if any
     */
    const runAction = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;

      // Find the closest element with data-tour-action (handles clicks on child elements)
      const actionElement = target?.closest(`[${TOUR_DATA_ATTRIBUTES.ACTION}]`);
      const action = actionElement?.getAttribute(TOUR_DATA_ATTRIBUTES.ACTION);
      if (!action) return;

      // Prevent default and stop propagation
      e.preventDefault();
      e.stopPropagation();

      // Call the action handler directly (refs are updated during render)
      switch (action) {
        case TOUR_ACTIONS.NEXT:
        case TOUR_ACTIONS.FINISH:
          nextRef.current();
          break;
        case TOUR_ACTIONS.PREV:
          prevRef.current();
          break;
        case TOUR_ACTIONS.CLOSE:
          endRef.current();
          break;
      }
    };

    /**
     * Keyboard activation.
     *
     * Enter or Space on a focused button fires `click` and never `mousedown`, so the
     * pointer listener alone leaves the panel's controls announced but inert. A click
     * produced by keyboard activation reports `detail === 0`; a pointer click reports
     * `>= 1` and has already been handled on mousedown, so this cannot double-fire.
     */
    const handleClick = (e: MouseEvent) => {
      if (e.detail !== 0) return;
      runAction(e);
    };

    // Pointer activation stays on mousedown, which reacts before the press can move focus
    document.addEventListener('mousedown', runAction);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('mousedown', runAction);
      document.removeEventListener('click', handleClick);
    };
  }, [isActive]);

  // Handle ESC key to end the tour
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        endRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    const backdropManager = backdropManagerRef.current;
    const highlightManager = highlightManagerRef.current;
    const targetWatcher = targetWatcherRef.current;
    return () => {
      targetWatcher.destroy();
      backdropManager.destroy();
      highlightManager.destroy();
    };
  }, []);

  return useMemo(
    () => ({
      start,
      end,
      next,
      prev,
      goTo,
      isActive,
      currentStep,
      totalSteps: visibleSteps.length,
      progress,
    }),
    [start, end, next, prev, goTo, isActive, currentStep, visibleSteps.length, progress]
  );
}
