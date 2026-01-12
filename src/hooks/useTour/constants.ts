import type { TourNavigation } from '../../types/tour';

/**
 * Default navigation configuration for tours
 */
export const DEFAULT_NAVIGATION: Required<TourNavigation> = {
  showControls: false,
  nextLabel: 'Next',
  backLabel: 'Back',
  finishLabel: 'Finish',
  showClose: true,
};

/**
 * CSS class names used by the tour
 */
export const TOUR_CSS_CLASSES = {
  BACKDROP: 'tip-magic-tour-backdrop',
  FOCUS_TARGET: 'tip-magic-tour-focus-target',
  CONTENT: 'tip-magic-tour-content',
  HEADER: 'tip-magic-tour-header',
  TITLE: 'tip-magic-tour-title',
  CLOSE: 'tip-magic-tour-close',
  IMAGE: 'tip-magic-tour-image',
  VIDEO: 'tip-magic-tour-video',
  VIDEO_EMBED: 'tip-magic-tour-video-embed',
  BODY: 'tip-magic-tour-body',
  MESSAGE: 'tip-magic-tour-message',
  FOOTER: 'tip-magic-tour-footer',
  PROGRESS: 'tip-magic-tour-progress',
  PROGRESS_RING: 'tip-magic-tour-progress-ring',
  PROGRESS_RING_BG: 'tip-magic-tour-progress-ring-bg',
  PROGRESS_RING_FILL: 'tip-magic-tour-progress-ring-fill',
  PROGRESS_RING_TEXT: 'tip-magic-tour-progress-ring-text',
  NAV: 'tip-magic-tour-nav',
  BTN: 'tip-magic-tour-btn',
  BTN_BACK: 'tip-magic-tour-btn-back',
  BTN_NEXT: 'tip-magic-tour-btn-next',
} as const;

/**
 * Data attributes used for tour actions
 */
export const TOUR_DATA_ATTRIBUTES = {
  ACTION: 'data-tour-action',
  TIP_ID: 'data-tip-id',
} as const;

/**
 * Tour action values
 */
export const TOUR_ACTIONS = {
  NEXT: 'next',
  PREV: 'prev',
  FINISH: 'finish',
  CLOSE: 'close',
} as const;
