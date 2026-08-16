// Tour step utilities
export {
  buildCurrentStep,
  calculateProgress,
  filterVisibleSteps,
  resolveStepContent,
  resolveTargetElement,
} from './tourSteps';

// Navigation utilities
export {
  DEFAULT_PROGRESS,
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  resolveFocus,
} from './tourNavigation';
export type { ResolvedProgressOptions, ResolvedTourFocus } from './tourNavigation';

// Content building utilities
export {
  buildFooterHtml,
  buildHeaderHtml,
  buildMediaHtml,
  buildNavHtml,
  buildProgressHtml,
  buildRingProgressHtml,
  buildStepsProgressHtml,
  buildTourContent,
} from './buildTourContent';

// DOM managers
export { BackdropManager, createBackdropManager } from './backdropManager';
export type { BackdropShowOptions } from './backdropManager';
export { createHighlightManager, HighlightManager } from './highlightManager';
export { createTargetWatcher, TargetWatcher } from './targetWatcher';
export type { TargetWatcherCallbacks } from './targetWatcher';
