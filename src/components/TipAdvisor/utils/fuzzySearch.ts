import fuzzysort from 'fuzzysort';
import type { TipAdvisorItem } from '../../../types/tipAdvisor';

/**
 * Result of a fuzzy search on TipAdvisor items
 */
export interface FuzzySearchResult {
  item: TipAdvisorItem;
  contentResult: Fuzzysort.Result | null;
  shortcutResult: Fuzzysort.Result | null;
}

/**
 * Filters TipAdvisor items using fuzzy search.
 *
 * When query is empty, returns all items with null results (no highlighting).
 * When query is provided, searches in both 'content' and 'shortcut' fields.
 *
 * @param items - Array of TipAdvisorItem to search
 * @param query - Search query string
 * @returns Array of FuzzySearchResult with matched items and highlight data
 */
export function filterItemsWithFuzzy(items: TipAdvisorItem[], query: string): FuzzySearchResult[] {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    // Return all items with null results (no highlighting needed)
    return items.map((item) => ({
      item,
      contentResult: null,
      shortcutResult: null,
    }));
  }

  // Search in both content and shortcut
  const results = fuzzysort.go(trimmedQuery, items, {
    keys: ['content', 'shortcut'],
    threshold: -10000, // Include more results
  });

  return results.map((result) => ({
    item: result.obj,
    contentResult: result[0],
    shortcutResult: result[1],
  }));
}

/**
 * Highlights matching parts of text using fuzzysort result.
 *
 * @param text - Original text to display
 * @param result - Fuzzysort result containing match information
 * @returns HTML string with <mark> tags around matched characters, or original text if no result
 */
export function highlightFuzzyMatch(text: string, result: Fuzzysort.Result | null): string {
  if (!result) {
    return text;
  }

  const highlighted = result.highlight('<mark>', '</mark>');
  return highlighted || text;
}
