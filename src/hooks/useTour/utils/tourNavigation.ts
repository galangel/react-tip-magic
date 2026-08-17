import type {
  ProgressOptions,
  ProgressType,
  TourFocus,
  TourNavigation,
  TourStep,
} from '../../../types/tour';
import { DEFAULT_NAVIGATION } from '../constants';

/**
 * Default progress options
 */
export const DEFAULT_PROGRESS: Required<Omit<ProgressOptions, 'render'>> = {
  show: false,
  type: 'steps',
};

/**
 * Merge navigation config: defaults < tour-level < step-level
 *
 * @param tourNavigation - Tour-level navigation config
 * @param step - Current step (may have step-level overrides)
 * @returns Fully resolved navigation config
 */
export function getMergedNavigation(
  tourNavigation: TourNavigation | undefined,
  step: TourStep
): Required<TourNavigation> {
  return {
    ...DEFAULT_NAVIGATION,
    ...tourNavigation,
    ...step.navigation,
  };
}

/**
 * Fully resolved focus/backdrop configuration for a step
 */
export interface ResolvedTourFocus {
  /** Whether the backdrop should be shown at all */
  enabled: boolean;
  /** Whether the backdrop should swallow clicks aimed at the app behind it */
  block: boolean;
  /** Whether clicking the backdrop ends the tour */
  dismissOnClick: boolean;
}

/**
 * Resolve focus/backdrop options for a step: tour-level < step-level
 *
 * @param tourFocus - Tour-level focus setting
 * @param step - Current step (may have step-level override)
 * @returns Resolved focus configuration
 */
export function resolveFocus(tourFocus: TourFocus, step: TourStep): ResolvedTourFocus {
  const value = step.focus !== undefined ? step.focus : tourFocus;

  if (typeof value === 'boolean') {
    return { enabled: value, block: false, dismissOnClick: false };
  }

  return {
    enabled: true,
    block: value.block ?? false,
    dismissOnClick: value.dismissOnClick ?? false,
  };
}

/**
 * Resolved progress options for a step
 */
export interface ResolvedProgressOptions {
  show: boolean;
  type: ProgressType;
  render?: (props: { currentStep: number; totalSteps: number }) => string;
}

/**
 * Get merged progress options for a step
 *
 * @param tourProgress - Tour-level progress options
 * @param step - Current step (may have step-level overrides)
 * @returns Resolved progress options
 */
export function getMergedProgress(
  tourProgress: ProgressOptions | undefined,
  step: TourStep
): ResolvedProgressOptions {
  const base: ResolvedProgressOptions = {
    ...DEFAULT_PROGRESS,
    ...tourProgress,
  };

  // Step-level overrides
  if (step.progress) {
    if (step.progress.show !== undefined) {
      base.show = step.progress.show;
    }
    if (step.progress.type !== undefined) {
      base.type = step.progress.type;
    }
    if (step.progress.render !== undefined) {
      base.render = step.progress.render;
    }
  }

  return base;
}

/**
 * Check if a step has any navigation-related features enabled
 * (navigation controls, close button, media, or progress)
 *
 * @param nav - Merged navigation config
 * @param step - Current step
 * @param showProgress - Whether progress is enabled for this step
 * @returns Whether any navigation features are enabled
 */
export function hasNavigationFeatures(
  nav: Required<TourNavigation>,
  step: TourStep,
  showProgress: boolean = false
): boolean {
  return nav.showControls || nav.showClose || !!step.image || !!step.video || showProgress;
}
