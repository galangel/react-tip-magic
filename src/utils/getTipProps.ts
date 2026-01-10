import type { Placement, TextBreak, TooltipTransitionBehavior } from '../types';

/**
 * Options for configuring a tooltip via data attributes
 */
export interface TipPropsOptions {
  /** Tooltip content (required) */
  tip: string;
  /** Unique identifier for the tooltip target */
  id?: string;
  /** Tooltip placement relative to target */
  placement?: Placement;
  /** Delay before showing tooltip (ms) */
  showDelay?: number;
  /** Delay before hiding tooltip (ms) */
  hideDelay?: number;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Enable text truncation with ellipsis */
  ellipsis?: boolean;
  /** Maximum lines before truncation */
  maxLines?: number;
  /** Enable word wrapping */
  wordWrap?: boolean;
  /**
   * Text break behavior - controls where words can break
   * - 'normal': Break at word boundaries (default)
   * - 'break-all': Can break in middle of words (for long URLs, codes)
   * - 'keep-all': Don't break CJK characters (for Asian languages)
   */
  textBreak?: TextBreak;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Parse content as HTML */
  html?: boolean;
  /** Keep tooltip visible when hovering over it */
  interactive?: boolean;
  /** Transition behavior when moving between targets */
  transitionBehavior?: TooltipTransitionBehavior;
  /** Duration of move transition animation (ms) */
  moveTransitionDuration?: number;
  /** Show or hide the arrow (default: true) */
  showArrow?: boolean;
}

/**
 * Return type of getTipProps - data attributes for tooltip
 */
export interface TipPropsResult {
  'data-tip': string;
  'data-tip-id'?: string;
  'data-tip-placement'?: Placement;
  'data-tip-delay'?: string;
  'data-tip-hide-delay'?: string;
  'data-tip-disabled'?: '';
  'data-tip-ellipsis'?: '';
  'data-tip-max-lines'?: string;
  'data-tip-word-wrap'?: '';
  'data-tip-text-break'?: TextBreak;
  'data-tip-max-width'?: string;
  'data-tip-html'?: '';
  'data-tip-interactive'?: '';
  'data-tip-move'?: '';
  'data-tip-jump'?: '';
  'data-tip-move-duration'?: string;
  'data-tip-no-arrow'?: '';
}

/**
 * Creates data attribute props for a tooltip.
 * Use this to configure tooltips with TypeScript support and spread onto elements.
 *
 * @example
 * ```tsx
 * const tipProps = getTipProps({
 *   tip: 'Save changes',
 *   placement: 'bottom',
 *   showDelay: 100,
 * });
 *
 * <button {...tipProps}>Save</button>
 * ```
 *
 * @example
 * ```tsx
 * // With keyboard shortcut
 * const tipProps = getTipProps({
 *   tip: 'Copy; ⌘C',
 *   hideDelay: 500,
 * });
 *
 * <button {...tipProps}>Copy</button>
 * ```
 */
export function getTipProps(options: TipPropsOptions): TipPropsResult {
  const result: TipPropsResult = {
    'data-tip': options.tip,
  };

  if (options.id !== undefined) {
    result['data-tip-id'] = options.id;
  }

  if (options.placement !== undefined) {
    result['data-tip-placement'] = options.placement;
  }

  if (options.showDelay !== undefined) {
    result['data-tip-delay'] = String(options.showDelay);
  }

  if (options.hideDelay !== undefined) {
    result['data-tip-hide-delay'] = String(options.hideDelay);
  }

  if (options.disabled) {
    result['data-tip-disabled'] = '';
  }

  if (options.ellipsis) {
    result['data-tip-ellipsis'] = '';
  }

  if (options.maxLines !== undefined) {
    result['data-tip-max-lines'] = String(options.maxLines);
  }

  if (options.wordWrap) {
    result['data-tip-word-wrap'] = '';
  }

  if (options.textBreak !== undefined && options.textBreak !== 'normal') {
    result['data-tip-text-break'] = options.textBreak;
  }

  if (options.maxWidth !== undefined) {
    result['data-tip-max-width'] = String(options.maxWidth);
  }

  if (options.html) {
    result['data-tip-html'] = '';
  }

  if (options.interactive) {
    result['data-tip-interactive'] = '';
  }

  if (options.transitionBehavior === 'move') {
    result['data-tip-move'] = '';
  } else if (options.transitionBehavior === 'jump') {
    result['data-tip-jump'] = '';
  }

  if (options.moveTransitionDuration !== undefined) {
    result['data-tip-move-duration'] = String(options.moveTransitionDuration);
  }

  if (options.showArrow === false) {
    result['data-tip-no-arrow'] = '';
  }

  return result;
}
