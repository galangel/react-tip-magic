import { DEFAULT_SELECTOR } from '../constants';

/**
 * Event handling utilities for tooltip interactions
 *
 * Pure functions for determining tooltip behavior based on DOM events.
 */

/**
 * Result of checking if tooltip should hide on mouseout
 */
export interface ShouldHideResult {
  /** Whether the tooltip should hide */
  shouldHide: boolean;
  /** Whether the show timeout should be cleared */
  shouldClearShowTimeout: boolean;
}

/**
 * Determines if the tooltip should hide based on mouseout event details.
 *
 * The tooltip should NOT hide when:
 * - Moving to the tooltip itself (for interactive tooltips)
 * - Moving to the helper element
 * - Moving to another tooltip target
 * - Moving from tooltip back to the original target
 *
 * @param relatedTarget - The element the mouse is moving to
 * @param isLeavingTooltip - Whether leaving the tooltip element
 * @param isLeavingTarget - Whether leaving a tooltip target element
 * @param currentTarget - The current tooltip target element
 * @param isVisible - Whether the tooltip is currently visible
 * @returns Object indicating whether to hide and clear timeouts
 *
 * @example
 * ```ts
 * const result = shouldHideTooltip(
 *   event.relatedTarget,
 *   target.closest('.tip-magic-tooltip'),
 *   target.closest('[data-tip]'),
 *   currentTargetRef.current,
 *   isVisibleRef.current
 * );
 * if (result.shouldHide) {
 *   // Schedule hide with delay
 * }
 * ```
 */
export function shouldHideTooltip(
  relatedTarget: Element | null,
  isLeavingTooltip: Element | null,
  isLeavingTarget: Element | null,
  currentTarget: Element | null,
  isVisible: boolean
): ShouldHideResult {
  // Always clear show timeout if checking hide conditions
  const shouldClearShowTimeout = true;

  // Don't hide if moving to the tooltip itself (for interactive tooltips)
  if (relatedTarget?.closest('.tip-magic-tooltip')) {
    return { shouldHide: false, shouldClearShowTimeout };
  }

  // Don't hide if moving to the helper
  if (relatedTarget?.closest('.tip-magic-helper')) {
    return { shouldHide: false, shouldClearShowTimeout };
  }

  // Don't hide if moving to another tooltip target
  if (relatedTarget?.closest(DEFAULT_SELECTOR)) {
    return { shouldHide: false, shouldClearShowTimeout };
  }

  // Don't hide if moving from tooltip back to the original target
  if (isLeavingTooltip && relatedTarget === currentTarget) {
    return { shouldHide: false, shouldClearShowTimeout };
  }

  // Should hide if visible and leaving a tooltip target or the tooltip itself
  const shouldHide = isVisible && Boolean(isLeavingTarget || isLeavingTooltip);

  return { shouldHide, shouldClearShowTimeout };
}

/**
 * Finds the tooltip target element from an event target.
 *
 * @param eventTarget - The event.target element
 * @returns The closest tooltip target element or null
 */
export function findTooltipTarget(eventTarget: Element): Element | null {
  return eventTarget.closest(DEFAULT_SELECTOR);
}

/**
 * Checks if an element is the tooltip itself.
 *
 * @param element - The element to check
 * @returns true if the element is within the tooltip
 */
export function isTooltipElement(element: Element): boolean {
  return element.closest('.tip-magic-tooltip') !== null;
}
