import type { TipAdvisorItem, TipAdvisorPresetItem } from '../../../types/tipAdvisor';
import { parseDataAttributes } from '../../../utils/parseDataAttributes';

/**
 * Collects all elements matching the selector that have both tooltip content and a shortcut.
 *
 * @param selector - CSS selector to find elements, or null/empty to skip DOM scanning
 * @returns Array of TipAdvisorItem objects from DOM
 */
export function collectElementItems(selector: string | null | undefined): TipAdvisorItem[] {
  if (!selector) {
    return [];
  }

  const elements = document.querySelectorAll(selector);
  const items: TipAdvisorItem[] = [];

  elements.forEach((element, index) => {
    const parsedData = parseDataAttributes(element);

    if (parsedData.content && parsedData.shortcut) {
      items.push({
        id: parsedData.id || `tip-advisor-element-${index}`,
        element,
        content: parsedData.content,
        shortcut: parsedData.shortcut,
      });
    }
  });

  return items;
}

/**
 * Converts preset items to TipAdvisorItem format.
 *
 * @param presetItems - Array of preset items from props
 * @returns Array of TipAdvisorItem objects
 */
export function convertPresetItems(
  presetItems: TipAdvisorPresetItem[] | undefined
): TipAdvisorItem[] {
  if (!presetItems || presetItems.length === 0) {
    return [];
  }

  return presetItems.map((preset) => ({
    id: preset.id,
    content: preset.label,
    shortcut: preset.shortcut,
    onSelect: preset.onSelect,
  }));
}

/**
 * Collects all TipAdvisor items from both DOM elements and preset items.
 *
 * @param selector - CSS selector to find elements, or null/empty to skip DOM scanning
 * @param presetItems - Optional preset items to include
 * @returns Combined array of TipAdvisorItem objects
 */
export function collectTipAdvisorItems(
  selector: string | null | undefined,
  presetItems?: TipAdvisorPresetItem[]
): TipAdvisorItem[] {
  const elementItems = collectElementItems(selector);
  const convertedPresets = convertPresetItems(presetItems);

  return [...elementItems, ...convertedPresets];
}
