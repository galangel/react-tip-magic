import fuzzysort from 'fuzzysort';
import { describe, expect, it } from 'vitest';
import type { TipAdvisorItem } from '../../../../types/tipAdvisor';
import { filterItemsWithFuzzy, highlightFuzzyMatch } from '../fuzzySearch';

// Helper to create mock items
function createMockItem(content: string, shortcut: string): TipAdvisorItem {
  return {
    id: `item-${content.toLowerCase().replace(/\s+/g, '-')}`,
    element: document.createElement('button'),
    content,
    shortcut,
  };
}

describe('filterItemsWithFuzzy', () => {
  const mockItems: TipAdvisorItem[] = [
    createMockItem('Copy', '⌘C'),
    createMockItem('Paste', '⌘V'),
    createMockItem('Cut', '⌘X'),
    createMockItem('Save', '⌘S'),
    createMockItem('Undo', '⌘Z'),
  ];

  describe('with empty query', () => {
    it('should return all items when query is empty', () => {
      const result = filterItemsWithFuzzy(mockItems, '');
      expect(result).toHaveLength(5);
    });

    it('should return all items when query is whitespace', () => {
      const result = filterItemsWithFuzzy(mockItems, '   ');
      expect(result).toHaveLength(5);
    });

    it('should have null results for all items (no highlighting)', () => {
      const result = filterItemsWithFuzzy(mockItems, '');

      result.forEach((r) => {
        expect(r.contentResult).toBeNull();
        expect(r.shortcutResult).toBeNull();
      });
    });

    it('should preserve original item order', () => {
      const result = filterItemsWithFuzzy(mockItems, '');

      expect(result[0].item.content).toBe('Copy');
      expect(result[1].item.content).toBe('Paste');
      expect(result[2].item.content).toBe('Cut');
    });
  });

  describe('with search query', () => {
    it('should filter items by content', () => {
      const result = filterItemsWithFuzzy(mockItems, 'copy');

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].item.content).toBe('Copy');
    });

    it('should filter items by shortcut', () => {
      const result = filterItemsWithFuzzy(mockItems, '⌘C');

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].item.shortcut).toBe('⌘C');
    });

    it('should support fuzzy matching', () => {
      const result = filterItemsWithFuzzy(mockItems, 'cpy');

      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].item.content).toBe('Copy');
    });

    it('should return empty array when no matches', () => {
      const result = filterItemsWithFuzzy(mockItems, 'zzzzzzz');
      expect(result).toHaveLength(0);
    });

    it('should include fuzzy results for highlighting', () => {
      const result = filterItemsWithFuzzy(mockItems, 'copy');

      expect(result.length).toBeGreaterThanOrEqual(1);
      // At least one of the results should not be null
      const hasResult = result[0].contentResult !== null || result[0].shortcutResult !== null;
      expect(hasResult).toBe(true);
    });
  });

  describe('with empty items array', () => {
    it('should return empty array', () => {
      const result = filterItemsWithFuzzy([], 'copy');
      expect(result).toHaveLength(0);
    });

    it('should return empty array even with empty query', () => {
      const result = filterItemsWithFuzzy([], '');
      expect(result).toHaveLength(0);
    });
  });
});

describe('highlightFuzzyMatch', () => {
  it('should return original text when result is null', () => {
    const result = highlightFuzzyMatch('Copy', null);
    expect(result).toBe('Copy');
  });

  it('should return highlighted text when result has matches', () => {
    // Create a real fuzzy search result
    const items = [{ content: 'Copy' }];
    const searchResult = fuzzysort.go('cop', items, { key: 'content' });

    if (searchResult.length > 0) {
      const highlighted = highlightFuzzyMatch('Copy', searchResult[0]);
      expect(highlighted).toContain('<mark>');
      expect(highlighted).toContain('</mark>');
    }
  });

  it('should return original text when highlight returns null', () => {
    // Mock a result where highlight returns null
    const mockResult = {
      highlight: () => null,
    } as unknown as Fuzzysort.Result;

    const result = highlightFuzzyMatch('Copy', mockResult);
    expect(result).toBe('Copy');
  });
});
