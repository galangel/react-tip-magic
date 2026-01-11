import { CSS_CLASSES } from '../constants';
import type { TextBreak } from '../types';

/**
 * Tooltip styling utilities
 *
 * Pure functions for computing tooltip styles and class names.
 */

/**
 * Options for building tooltip class names
 */
export interface TooltipClassNameOptions {
  /** Whether the tooltip should be visible */
  shouldShow: boolean;
  /** Whether the tooltip is transitioning between targets */
  isTransitioning: boolean;
  /** Whether the tooltip should animate its position */
  shouldAnimatePosition: boolean;
  /** Whether the tooltip is interactive (hoverable) */
  isInteractive: boolean;
  /** Whether word wrapping is enabled */
  wordWrap: boolean;
  /** Whether ellipsis truncation is enabled */
  ellipsis: boolean;
  /** Text break behavior */
  textBreak: TextBreak;
}

/**
 * Builds the CSS class name string for a tooltip.
 *
 * @param options - The options for building class names
 * @returns The combined class name string
 *
 * @example
 * ```ts
 * buildTooltipClassNames({
 *   shouldShow: true,
 *   isTransitioning: false,
 *   shouldAnimatePosition: false,
 *   isInteractive: true,
 *   wordWrap: true,
 *   ellipsis: false,
 *   textBreak: 'normal',
 * });
 * // Returns: "tip-magic-tooltip tip-magic-visible tip-magic-interactive tip-magic-word-wrap"
 * ```
 */
export function buildTooltipClassNames(options: TooltipClassNameOptions): string {
  const {
    shouldShow,
    isTransitioning,
    shouldAnimatePosition,
    isInteractive,
    wordWrap,
    ellipsis,
    textBreak,
  } = options;

  const classes = [
    CSS_CLASSES.TOOLTIP,
    shouldShow ? CSS_CLASSES.TOOLTIP_VISIBLE : CSS_CLASSES.TOOLTIP_HIDDEN,
    isTransitioning ? CSS_CLASSES.TOOLTIP_TRANSITIONING : '',
    shouldAnimatePosition ? 'tip-magic-moving' : '',
    isInteractive ? 'tip-magic-interactive' : '',
    wordWrap ? 'tip-magic-word-wrap' : '',
    ellipsis ? 'tip-magic-ellipsis' : '',
    textBreak !== 'normal' ? `tip-magic-text-break-${textBreak}` : '',
  ];

  return classes.filter(Boolean).join(' ');
}

/**
 * Arrow position sides mapped to their opposite static side.
 * Used for positioning the arrow on the correct edge of the tooltip.
 */
const STATIC_SIDE_MAP: Record<string, string> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

/**
 * Gets the static side for arrow positioning based on tooltip placement.
 *
 * @param placement - The current tooltip placement (e.g., 'top', 'bottom-start')
 * @returns The static side for CSS positioning ('top', 'right', 'bottom', or 'left')
 *
 * @example
 * ```ts
 * getArrowStaticSide('top'); // Returns: 'bottom'
 * getArrowStaticSide('bottom-start'); // Returns: 'top'
 * getArrowStaticSide('left-end'); // Returns: 'right'
 * ```
 */
export function getArrowStaticSide(placement: string): string {
  const basePlacement = placement.split('-')[0];
  return STATIC_SIDE_MAP[basePlacement] ?? 'bottom';
}

/**
 * Computes the arrow style object for positioning.
 *
 * @param arrowX - The X coordinate from floating-ui middleware
 * @param arrowY - The Y coordinate from floating-ui middleware
 * @param staticSide - The static side for positioning
 * @returns A CSS style object for the arrow element
 */
export function getArrowStyles(
  arrowX: number | undefined,
  arrowY: number | undefined,
  staticSide: string
): React.CSSProperties {
  return {
    left: arrowX != null ? `${arrowX}px` : '',
    top: arrowY != null ? `${arrowY}px` : '',
    [staticSide]: '-4px',
  };
}
