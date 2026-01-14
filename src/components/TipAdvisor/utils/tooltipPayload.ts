import type { ParsedTooltipData } from '../../../types';
import type { TipAdvisorItem } from '../../../types/tipAdvisor';
import { parseDataAttributes } from '../../../utils/parseDataAttributes';

/**
 * Payload structure for showing a tooltip
 */
export interface TooltipPayload {
  target: Element;
  content: string;
  parsedData: ParsedTooltipData;
}

/**
 * Builds the tooltip payload for a TipAdvisor item.
 *
 * When previewing an item in the advisor, we show the shortcut as the tooltip
 * content (since the main content is already visible in the menu).
 *
 * @param item - The TipAdvisor item to build a payload for (must have an element)
 * @returns The tooltip payload ready for dispatch, or null if item has no element
 */
export function buildTooltipPayload(item: TipAdvisorItem): TooltipPayload | null {
  if (!item.element) {
    return null;
  }

  const parsedData = parseDataAttributes(item.element);

  return {
    target: item.element,
    content: item.shortcut || '',
    parsedData: {
      ...parsedData,
      content: item.shortcut || '',
      shortcut: undefined,
    },
  };
}
