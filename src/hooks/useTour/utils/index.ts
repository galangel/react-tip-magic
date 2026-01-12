// Tour step utilities
export {
  buildCurrentStep,
  calculateProgress,
  filterVisibleSteps,
  resolveStepContent,
} from './tourSteps';

// Navigation utilities
export {
  DEFAULT_PROGRESS,
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  shouldShowFocus,
} from './tourNavigation';
export type { ResolvedProgressOptions } from './tourNavigation';

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
export { createHighlightManager, HighlightManager } from './highlightManager';
