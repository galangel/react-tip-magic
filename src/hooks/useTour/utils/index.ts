// Tour step utilities
export {
  buildCurrentStep,
  calculateProgress,
  filterVisibleSteps,
  resolveStepBody,
  resolveStepContent,
  resolveTargetElement,
} from './tourSteps';
export type { ResolvedStepBody } from './tourSteps';

// Navigation utilities
export {
  DEFAULT_PROGRESS,
  getMergedNavigation,
  getMergedProgress,
  hasNavigationFeatures,
  resolveFocus,
} from './tourNavigation';
export type { ResolvedProgressOptions, ResolvedTourFocus } from './tourNavigation';

// Progress ring geometry
export { getProgressRingGeometry } from './progressRing';
export type { ProgressRingGeometry } from './progressRing';

// DOM managers
export { BackdropManager, createBackdropManager } from './backdropManager';
export type { BackdropShowOptions } from './backdropManager';
export { createHighlightManager, HighlightManager } from './highlightManager';
export { createTargetWatcher, TargetWatcher } from './targetWatcher';
export type { TargetWatcherCallbacks } from './targetWatcher';
