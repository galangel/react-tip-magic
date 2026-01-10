import type {
  HelperPosition,
  Placement,
  TipMagicOptions,
  TooltipTransitionBehavior,
} from '../types';

/**
 * Default configuration values
 */
export const DEFAULT_OPTIONS: Required<TipMagicOptions> = {
  showDelay: 200,
  hideDelay: 700,
  animationDuration: 150,
  placement: 'top' as Placement,
  offset: 8,
  enableHelper: true,
  helperPosition: 'bottom-right' as HelperPosition,
  theme: 'auto',
  zIndex: 9999,
  disabled: false,
  portalContainer: null as unknown as HTMLElement,
  contentSeparator: ';',
  enableShortcutStyle: true,
  respectReducedMotion: true,
  transitionBehavior: 'move' as TooltipTransitionBehavior,
  moveTransitionDuration: 200,
};

/**
 * Data attribute selectors
 */
export const DATA_ATTRIBUTES = {
  TIP: 'data-tip',
  TIP_ID: 'data-tip-id',
  TIP_PLACEMENT: 'data-tip-placement',
  TIP_DELAY: 'data-tip-delay',
  TIP_HIDE_DELAY: 'data-tip-hide-delay',
  TIP_DISABLED: 'data-tip-disabled',
  TIP_ELLIPSIS: 'data-tip-ellipsis',
  TIP_MAX_LINES: 'data-tip-max-lines',
  TIP_WORD_WRAP: 'data-tip-word-wrap',
  TIP_MAX_WIDTH: 'data-tip-max-width',
  TIP_HTML: 'data-tip-html',
  TIP_INTERACTIVE: 'data-tip-interactive',
  TIP_TEXT_BREAK: 'data-tip-text-break',
  TIP_MOVE: 'data-tip-move',
  TIP_JUMP: 'data-tip-jump',
  TIP_MOVE_DURATION: 'data-tip-move-duration',
  TIP_NO_ARROW: 'data-tip-no-arrow',
} as const;

/**
 * CSS class names
 */
export const CSS_CLASSES = {
  TOOLTIP: 'tip-magic-tooltip',
  TOOLTIP_CONTENT: 'tip-magic-content',
  TOOLTIP_ARROW: 'tip-magic-arrow',
  TOOLTIP_SHORTCUT: 'tip-magic-shortcut',
  TOOLTIP_VISIBLE: 'tip-magic-visible',
  TOOLTIP_HIDDEN: 'tip-magic-hidden',
  TOOLTIP_TRANSITIONING: 'tip-magic-transitioning',
  HELPER: 'tip-magic-helper',
  HIGHLIGHT: 'tip-magic-highlight',
} as const;

/**
 * Animation timing
 */
export const ANIMATION = {
  TOOLTIP_SHOW: 150,
  TOOLTIP_HIDE: 100,
  POSITION_MOVE: 200,
  CONTENT_CHANGE: 150,
  HELPER_STATE: 300,
} as const;

/**
 * Default selector for tooltip targets
 */
export const DEFAULT_SELECTOR = '[data-tip]';
