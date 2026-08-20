import { PRIMARY_ACTION_ATTRIBUTE } from '../constants';
import type { TooltipAutoFocus } from '../types';

/**
 * Focus target resolution for dialog tooltips
 */

/**
 * Determines which element a dialog tooltip should focus.
 *
 * Resolution rules:
 * - `false` → never focus anything
 * - `'primary'` → the first element marked `data-tip-magic-primary`, unless it already
 *   has focus. Content that marks nothing falls through to the `'panel'` rules.
 * - `'panel'` → the tooltip element, unless focus is already somewhere inside it, so a
 *   control the user tabbed to is not stolen back.
 *
 * @param panel - The tooltip element
 * @param mode - The resolved `autoFocus` setting
 * @param activeElement - What currently holds focus
 * @returns The element to focus, or null to leave focus where it is
 *
 * @example
 * ```ts
 * resolveAutoFocusTarget(panel, 'primary', panel); // the Next button
 * resolveAutoFocusTarget(panel, 'panel', backButton); // null - already inside
 * ```
 */
export function resolveAutoFocusTarget(
  panel: HTMLElement,
  mode: TooltipAutoFocus,
  activeElement: Element | null
): HTMLElement | null {
  if (mode === false) {
    return null;
  }

  if (mode === 'primary') {
    const primary = panel.querySelector<HTMLElement>(`[${PRIMARY_ACTION_ATTRIBUTE}]`);
    if (primary) {
      return primary === activeElement ? null : primary;
    }
  }

  return panel.contains(activeElement) ? null : panel;
}
