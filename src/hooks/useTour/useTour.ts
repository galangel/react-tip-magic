import {
  createElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { TooltipShowOptions } from '../../types';
import type {
  CurrentTourStep,
  TourDirection,
  TourOptions,
  TourProgress,
  TourStep,
  TourTargetMissingAction,
  UseTourReturn,
} from '../../types/tour';
import { generateTooltipId } from '../../utils/parseDataAttributes';
import { useTipMagicContext } from '../../context/TipMagicContext';
import type { FlowStep } from '../../types';
import { useTipMagic } from '../useTipMagic';
import { TOUR_ACTIONS, TOUR_DATA_ATTRIBUTES } from './constants';
import { LiveTourPanel, type TourPanelProps } from './TourPanel';
import {
  buildCurrentStep,
  calculateProgress,
  createBackdropManager,
  createHighlightManager,
  createTargetWatcher,
  createTourPanelStore,
  filterVisibleSteps,
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  resolveFocus,
  resolveStepBody,
  resolveTargetElement,
  type ResolvedStepBody,
  type TourPanelStore,
} from './utils';

/** useLayoutEffect, without React 18's warning when rendered on the server */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * A step that can render, and the element it renders against
 */
interface ResolvedStep {
  index: number;
  element: HTMLElement;
}

/**
 * What a step shows
 */
interface StepView {
  step: TourStep;
  body: ResolvedStepBody;
  /** The panel's props, or null when the step is a plain tooltip */
  panel: TourPanelProps | null;
}

/**
 * The step on screen
 */
interface ShownStep {
  index: number;
  step: TourStep;
  element: HTMLElement;
  /** The store its panel reads from, or null when it is a plain tooltip */
  store: TourPanelStore | null;
  /** What the tooltip was given as content */
  content: ReactNode;
  /** The panel-derived tooltip options it was shown with */
  ariaLabelledBy?: string;
  autoFocus?: TooltipShowOptions['autoFocus'];
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
  const { dispatch } = useTipMagicContext();

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
  // The step on screen, null when there is none
  const shownRef = useRef<ShownStep | null>(null);
  // Counts presented steps, to key each panel uniquely
  const presentCountRef = useRef(0);
  // The steps handed to the helper flow, which identify it as this tour's
  const flowStepsRef = useRef<FlowStep[] | null>(null);

  // One id per tour instance for the panel's aria-labelledby. Generated rather than
  // hardcoded so it cannot collide with an id the host page already owns, and held for
  // the instance rather than per step so the label does not churn between steps.
  const titleIdRef = useRef('');
  if (!titleIdRef.current) {
    titleIdRef.current = `${generateTooltipId()}-title`;
  }

  // Whether the hook is mounted, cleared during the unmount commit
  const mountedRef = useRef(false);

  // Refs for navigation handlers to avoid stale closures
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});
  const endRef = useRef<() => void>(() => {});
  const targetLostRef = useRef<() => void>(() => {});
  const abandonRef = useRef<() => void>(() => {});
  const followStepsRef = useRef<() => void>(() => {});

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
   * Resolve what a step shows: its body, and the panel's props if it renders the panel
   */
  const describeStep = useCallback(
    (stepIndex: number): StepView | null => {
      const step = visibleSteps[stepIndex];
      const stepInfo = buildCurrentStep(visibleSteps, stepIndex);
      if (!step || !stepInfo) return null;

      const mergedNav = getMergedNavigation(navigation, step);
      const progressOptions = getMergedProgress(tourProgress, step);
      const body = resolveStepBody(step, stepInfo);

      const panel = hasNavigationFeatures(mergedNav, step, progressOptions.show, body)
        ? {
            step,
            stepInfo,
            navigation: mergedNav,
            body,
            progress: progressOptions,
            titleId: titleIdRef.current,
          }
        : null;

      return { step, body, panel };
    },
    [visibleSteps, navigation, tourProgress]
  );

  /**
   * Tooltip options for a step: tour panel defaults < tour options < step overrides <
   * the values the step cannot function without
   */
  const buildTooltipOptions = useCallback(
    ({ step, body, panel }: StepView, content: ReactNode): TooltipShowOptions => ({
      // The panel holds prose, a header row and a nav row - it has to be able to wrap.
      // Overridable, unlike the forced values below.
      ...(panel && { wordWrap: true }),
      ...tooltipOptions,
      ...step.tooltipOptions,
      content,
      placement: step.placement ?? tooltipOptions?.placement,
      // A step with no panel hands its body to the tooltip as-is: `content` is HTML and
      // `text` never is, whatever the consumer's options say
      ...(body.kind === 'html' && { html: true }),
      ...(body.kind === 'text' && { html: false }),
      // Make the panel interactive and present it as a dialog - role="tooltip" is a
      // description, so screen readers would not expose the buttons inside it
      ...(panel && {
        interactive: true,
        role: 'dialog' as const,
        ariaLabelledBy: step.title ? titleIdRef.current : undefined,
        autoFocus: panel.navigation.autoFocus,
      }),
    }),
    [tooltipOptions]
  );

  /**
   * Put a step's content in the tooltip, and record it as the step on screen
   */
  const present = useCallback(
    (view: StepView, stepIndex: number, element: HTMLElement) => {
      // A store of its own, and a key of its own, so every step mounts a fresh panel that
      // never renders another step's props - see CLAUDE.md, "Each tour step mounts a new
      // panel"
      const store = view.panel ? createTourPanelStore() : null;
      if (store && view.panel) {
        store.set(view.panel);
      }
      presentCountRef.current += 1;
      const content = store
        ? createElement(LiveTourPanel, { key: presentCountRef.current, store })
        : view.body.value;

      const options = buildTooltipOptions(view, content);
      shownRef.current = {
        index: stepIndex,
        step: view.step,
        element,
        store,
        content,
        ariaLabelledBy: options.ariaLabelledBy,
        autoFocus: options.autoFocus,
      };
      tooltip.show(element, options);
    },
    [buildTooltipOptions, tooltip]
  );

  /**
   * Show tooltip for a step
   *
   * The target element is resolved by the caller, so this is only ever reached for a
   * step that can actually render.
   */
  const showStepTooltip = useCallback(
    (stepIndex: number, targetElement: HTMLElement) => {
      const view = describeStep(stepIndex);
      if (!view) return;
      const { step } = view;

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

      present(view, stepIndex, targetElement);
    },
    [describeStep, present, autoScroll, tourFocus, effectiveHighlightClass]
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
   * Forget the running tour
   */
  const resetTourState = useCallback(() => {
    shownRef.current = null;
    flowStepsRef.current = null;
    setIsActive(false);
    isActiveRef.current = false;
    setCurrentIndex(-1);
    currentIndexRef.current = -1;
  }, []);

  /**
   * Take the tour off screen and reset its state, without calling any consumer callback
   */
  const teardown = useCallback(() => {
    cleanup();
    helper.endFlow();
    resetTourState();
  }, [cleanup, helper, resetTourState]);

  /**
   * Teardown for a tour whose component has unmounted: the tooltip and the helper flow
   * are released only if this tour still owns them, since the component that replaced
   * it may already have started a tour of its own
   */
  const abandon = useCallback(() => {
    const shown = shownRef.current;
    if (shown) {
      dispatch({ type: 'HIDE_TOOLTIP', payload: { onlyIfContent: shown.content } });
    }
    if (flowStepsRef.current) {
      dispatch({ type: 'END_FLOW', payload: { onlyIfSteps: flowStepsRef.current } });
    }
    resetTourState();
  }, [dispatch, resetTourState]);

  /**
   * Tear the tour down and report the outcome
   */
  const finishTour = useCallback(
    (completed: boolean) => {
      // The step on screen, which `steps` may no longer hold
      shownRef.current?.step.onExit?.();

      teardown();

      if (onEnd) {
        onEnd(completed);
      }
    },
    [teardown, onEnd]
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

      // The step on screen, which `steps` may no longer hold
      const previousStep = shownRef.current?.step;
      const nextStep = visibleSteps[targetIndex];

      // Call onExit for previous step
      previousStep?.onExit?.();

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
    flowStepsRef.current = flowSteps;
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
    // A target that left with this component is not a missing target: the unmount
    // cleanup ends the tour silently
    if (!isActiveRef.current || !mountedRef.current) return;

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
  abandonRef.current = abandon;

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

  /**
   * Bring the step on screen in line with new `steps` or options
   *
   * Follows the step by its target, so a step filtered out ahead of it does not swap in
   * another step's content. A shown step that is gone is replaced by whatever now holds
   * its place, as a navigation; past the end, the tour ends.
   */
  const followSteps = () => {
    const shown = shownRef.current;
    if (!isActiveRef.current || !shown) return;

    let index = shown.index;
    if (visibleSteps[index]?.target !== shown.step.target) {
      const moved = visibleSteps.findIndex((step) => step.target === shown.step.target);
      if (moved < 0) {
        if (index < visibleSteps.length) {
          navigateToStep(index, 'next');
        } else {
          finishTour(false);
        }
        return;
      }

      index = moved;
      setCurrentIndex(index);
      currentIndexRef.current = index;
      helper.goToStep(index);
    }

    const view = describeStep(index);
    if (!view) return;

    // Gaining or losing the panel changes what the tooltip holds, so show it again
    if (!view.panel !== !shown.store) {
      present(view, index, shown.element);
      return;
    }

    shownRef.current = { ...shown, index, step: view.step };
    if (!shown.store || !view.panel) return;

    shown.store.set(view.panel);

    // Re-show only when a panel-derived option changed: showing re-renders every
    // useTipMagic consumer, this one included
    const options = buildTooltipOptions(view, shown.content);
    if (options.ariaLabelledBy !== shown.ariaLabelledBy || options.autoFocus !== shown.autoFocus) {
      shownRef.current = {
        ...shownRef.current,
        ariaLabelledBy: options.ariaLabelledBy,
        autoFocus: options.autoFocus,
      };
      tooltip.show(shown.element, options);
    }
  };
  followStepsRef.current = followSteps;

  // A running step follows changes to `steps` - a body whose data arrived after start(),
  // say - in place: the tooltip is not shown again, so focus, scroll and the step
  // callbacks are left alone
  useEffect(() => {
    followStepsRef.current();
  }, [describeStep]);

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

  // Cleanup on unmount. A layout effect, so `mountedRef` is cleared before the
  // MutationObserver reports a target that unmounted in the same commit - see
  // handleTargetLost.
  useIsomorphicLayoutEffect(() => {
    mountedRef.current = true;
    const backdropManager = backdropManagerRef.current;
    const highlightManager = highlightManagerRef.current;
    const targetWatcher = targetWatcherRef.current;
    return () => {
      mountedRef.current = false;
      // Deferred, and skipped if the hook has mounted again: StrictMode's simulated
      // unmount remounts within the same task, and must not end a running tour
      queueMicrotask(() => {
        if (mountedRef.current) return;

        // A running tour must not outlive its component as a panel with dead buttons.
        // No onEnd: the consumer that would hear it has unmounted too.
        if (isActiveRef.current) {
          abandonRef.current();
        }
        targetWatcher.destroy();
        backdropManager.destroy();
        highlightManager.destroy();
      });
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
