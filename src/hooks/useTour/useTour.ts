import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TooltipShowOptions } from '../../types';
import type {
  CurrentTourStep,
  TourDirection,
  TourOptions,
  TourProgress,
  UseTourReturn,
} from '../../types/tour';
import { useTipMagic } from '../useTipMagic';
import { TOUR_ACTIONS, TOUR_DATA_ATTRIBUTES } from './constants';
import {
  buildCurrentStep,
  buildTourContent,
  calculateProgress,
  createBackdropManager,
  createHighlightManager,
  filterVisibleSteps,
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  resolveStepContent,
  shouldShowFocus,
} from './utils';

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
 *   tooltipOptions: { placement: 'bottom', interactive: true },
 *   autoScroll: true,
 * });
 * ```
 */
export function useTour(options: TourOptions): UseTourReturn {
  const {
    steps,
    onStart,
    onEnd,
    onStepChange,
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

  // Keep a ref of currentIndex that's always up to date (for use in callbacks)
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  // DOM managers (created once and reused)
  const backdropManagerRef = useRef(createBackdropManager());
  const highlightManagerRef = useRef(
    createHighlightManager(highlightClass ?? config.tourHighlightClass)
  );

  // Refs for navigation handlers to avoid stale closures
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});
  const endRef = useRef<() => void>(() => {});

  // Compute visible steps (filter out steps with condition returning false)
  const visibleSteps = useMemo(() => filterVisibleSteps(steps), [steps]);

  // Get the effective highlight class (from options or provider config)
  const effectiveHighlightClass = highlightClass ?? config.tourHighlightClass;

  // Update highlight manager when class changes
  useEffect(() => {
    highlightManagerRef.current.setHighlightClass(effectiveHighlightClass);
  }, [effectiveHighlightClass]);

  /**
   * Show tooltip for a step
   */
  const showStepTooltip = useCallback(
    (stepIndex: number) => {
      const step = visibleSteps[stepIndex];
      if (!step) return;

      const currentStepData = buildCurrentStep(visibleSteps, stepIndex);
      if (!currentStepData) return;

      // Find target element
      const targetSelector = `[${TOUR_DATA_ATTRIBUTES.TIP_ID}="${step.target}"]`;
      const targetElement = document.querySelector(targetSelector) as HTMLElement | null;

      if (!targetElement) {
        console.warn(`useTour: Could not find target element with data-tip-id="${step.target}"`);
        return;
      }

      // Highlight element
      highlightManagerRef.current.highlight(targetElement);

      // Handle focus/backdrop
      const useFocus = shouldShowFocus(tourFocus, step);
      if (useFocus) {
        backdropManagerRef.current.show(targetElement);
      } else {
        backdropManagerRef.current.hide();
      }

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
            showProgress ? progressOptions : null
          )
        : resolvedContent;

      // Merge tooltip options: tour defaults < step overrides
      const mergedOptions: TooltipShowOptions = {
        ...tooltipOptions,
        ...step.tooltipOptions,
        content: finalContent,
        placement: step.placement ?? tooltipOptions?.placement,
        // Enable html and interactive when using navigation features
        ...(hasNavFeatures && {
          html: true,
          interactive: true,
        }),
      };

      // Show the tooltip
      tooltip.show(targetElement, mergedOptions);
    },
    [visibleSteps, tooltip, tooltipOptions, autoScroll, tourFocus, tourProgress, navigation]
  );

  /**
   * Clean up highlight, backdrop, and hide tooltip
   */
  const cleanup = useCallback(() => {
    tooltip.hide();
    backdropManagerRef.current.hide();
    highlightManagerRef.current.clear();
  }, [tooltip]);

  /**
   * Navigate to a specific step
   */
  const navigateToStep = useCallback(
    (newIndex: number, direction: TourDirection) => {
      if (newIndex < 0 || newIndex >= visibleSteps.length) {
        return;
      }

      // Use ref for current index to get the previous step
      const prevIdx = currentIndexRef.current;
      const previousStep = visibleSteps[prevIdx];
      const nextStep = visibleSteps[newIndex];

      // Call onExit for previous step
      if (previousStep?.onExit) {
        previousStep.onExit();
      }

      // Update state
      setCurrentIndex(newIndex);

      // Show tooltip for new step
      showStepTooltip(newIndex);

      // Call onEnter for new step
      if (nextStep?.onEnter) {
        nextStep.onEnter();
      }

      // Call onStepChange callback
      const currentStepData = buildCurrentStep(visibleSteps, newIndex);
      if (currentStepData && onStepChange) {
        onStepChange(currentStepData, direction);
      }
    },
    [visibleSteps, showStepTooltip, onStepChange]
  );

  /**
   * Start the tour
   */
  const start = useCallback(() => {
    if (visibleSteps.length === 0) {
      console.warn('useTour: No steps available to start the tour');
      return;
    }

    setIsActive(true);
    setCurrentIndex(0);

    // Sync with helper flow state
    const flowSteps = visibleSteps.map((step, index) => ({
      id: `tour-step-${index}`,
      targetId: step.target,
      message: typeof step.content === 'string' ? step.content : '',
    }));
    helper.startFlow(flowSteps);

    // Show first step tooltip
    showStepTooltip(0);

    // Call onEnter for first step
    const firstStep = visibleSteps[0];
    if (firstStep?.onEnter) {
      firstStep.onEnter();
    }

    // Call onStart callback
    if (onStart) {
      onStart();
    }

    // Call onStepChange for initial step
    const currentStepData = buildCurrentStep(visibleSteps, 0);
    if (currentStepData && onStepChange) {
      onStepChange(currentStepData, 'next');
    }
  }, [visibleSteps, helper, showStepTooltip, onStart, onStepChange]);

  /**
   * End the tour (incomplete)
   */
  const end = useCallback(() => {
    if (!isActive) return;

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
    setCurrentIndex(-1);

    // Call onEnd callback with completed=false
    if (onEnd) {
      onEnd(false);
    }
  }, [isActive, visibleSteps, cleanup, helper, onEnd]);

  /**
   * Go to next step
   */
  const next = useCallback(() => {
    if (!isActive) return;

    // Use ref for current index to always get latest value
    const idx = currentIndexRef.current;
    const isLastStep = idx === visibleSteps.length - 1;

    if (isLastStep) {
      // Call onExit for current step
      const currentStep = visibleSteps[idx];
      if (currentStep?.onExit) {
        currentStep.onExit();
      }

      // End tour as complete
      cleanup();
      helper.endFlow();
      setIsActive(false);
      setCurrentIndex(-1);

      // Call onEnd callback with completed=true
      if (onEnd) {
        onEnd(true);
      }
    } else {
      helper.nextStep();
      navigateToStep(idx + 1, 'next');
    }
  }, [isActive, visibleSteps, cleanup, helper, navigateToStep, onEnd]);

  /**
   * Go to previous step
   */
  const prev = useCallback(() => {
    // Use ref for current index to always get latest value
    const idx = currentIndexRef.current;
    if (!isActive || idx === 0) return;

    navigateToStep(idx - 1, 'prev');
  }, [isActive, navigateToStep]);

  // Update refs synchronously during render (before any effects run)
  nextRef.current = next;
  prevRef.current = prev;
  endRef.current = end;

  /**
   * Jump to a specific step
   */
  const goTo = useCallback(
    (index: number) => {
      if (!isActive) return;

      if (index < 0 || index >= visibleSteps.length) {
        console.warn(
          `useTour: Invalid step index ${index}. Valid range: 0-${visibleSteps.length - 1}`
        );
        return;
      }

      // Use ref for current index to always get latest value
      if (index === currentIndexRef.current) return;

      navigateToStep(index, 'jump');
    },
    [isActive, visibleSteps.length, navigateToStep]
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

  // Handle navigation button clicks via data-tour-action attributes
  // Using mousedown for more reliable event handling
  useEffect(() => {
    if (!isActive) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Find the closest element with data-tour-action (handles clicks on child elements)
      const actionElement = target.closest(
        `[${TOUR_DATA_ATTRIBUTES.ACTION}]`
      ) as HTMLElement | null;
      if (!actionElement) return;

      const action = actionElement.getAttribute(TOUR_DATA_ATTRIBUTES.ACTION);
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

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
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
    return () => {
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
