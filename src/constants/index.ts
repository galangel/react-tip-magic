import type {
  HelperPosition,
  Placement,
  TipMagicOptions,
  TooltipTransitionBehavior,
} from '../types';

/**
 * Animation timing
 */
export const ANIMATION = {
  TOOLTIP_SHOW: 150,
  TOOLTIP_HIDE: 100,
  POSITION_MOVE: 100,
  CONTENT_CHANGE: 150,
  HELPER_STATE: 300,
} as const;

/**
 * Data attribute selectors, unused currently but kept for future use
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
  TIP_GROUP: 'data-tip-group',
  TIP_NO_ARROW: 'data-tip-no-arrow',
  /**
   * Keyboard shortcut to display alongside the tooltip content.
   * @example <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
   */
  TIP_SHORTCUT: 'data-tip-shortcut',
  TIP_SHOW_ON_FOCUS: 'data-tip-show-on-focus',
  /**
   * Elements with this attribute will remain visible (not masked) during tour focus.
   * Useful for headers, sidebars, and other persistent UI elements.
   * @example <header data-tip-always-visible>...</header>
   */
  TIP_ALWAYS_VISIBLE: 'data-tip-always-visible',
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
 * Attribute a tooltip's content uses to mark its primary action.
 *
 * `autoFocus: 'primary'` focuses the element carrying it, which keeps the tooltip
 * component from having to know which surfaces render buttons and what they mean.
 */
export const PRIMARY_ACTION_ATTRIBUTE = 'data-tip-magic-primary';

/**
 * Default selector for tooltip targets
 */
export const DEFAULT_SELECTOR = '[data-tip]';

/**
 * Default configuration values
 */
export const DEFAULT_OPTIONS: Required<TipMagicOptions> = {
  showDelay: 200,
  hideDelay: 700,
  animationDuration: ANIMATION.TOOLTIP_SHOW,
  placement: 'top' as Placement,
  offset: 8,
  enableHelper: true,
  helperPosition: 'bottom-right' as HelperPosition,
  zIndex: 9999,
  disabled: false,
  portalContainer: null as unknown as HTMLElement,
  enableShortcutStyle: true,
  respectReducedMotion: true,
  transitionBehavior: 'jump' as TooltipTransitionBehavior,
  moveTransitionDuration: ANIMATION.POSITION_MOVE,
  tourHighlightClass: '',
  showOnFocus: false,
};
