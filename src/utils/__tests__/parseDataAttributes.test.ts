import { describe, expect, it } from 'vitest';
import { generateTooltipId, parseContent } from '../parseDataAttributes';

describe('parseContent', () => {
  describe('with default separator (;)', () => {
    it('should return main content when no shortcut is present', () => {
      const result = parseContent('Save changes');
      expect(result).toEqual({ main: 'Save changes' });
    });

    it('should extract shortcut after separator', () => {
      const result = parseContent('Copy; ⌘C');
      expect(result).toEqual({ main: 'Copy', shortcut: '⌘C' });
    });

    it('should trim whitespace from main and shortcut', () => {
      const result = parseContent('  Save  ;  ⌘S  ');
      expect(result).toEqual({ main: 'Save', shortcut: '⌘S' });
    });

    it('should handle multiple separators by joining remaining parts', () => {
      const result = parseContent('Info; Part 1; Part 2');
      // Note: parts are trimmed individually, then joined with separator (no spaces added)
      expect(result).toEqual({ main: 'Info', shortcut: 'Part 1;Part 2' });
    });

    it('should handle empty content', () => {
      const result = parseContent('');
      expect(result).toEqual({ main: '' });
    });

    it('should handle content with only separator', () => {
      const result = parseContent(';');
      expect(result).toEqual({ main: '', shortcut: '' });
    });
  });

  describe('with custom separator', () => {
    it('should use custom separator for splitting', () => {
      const result = parseContent('Copy | ⌘C', '|');
      expect(result).toEqual({ main: 'Copy', shortcut: '⌘C' });
    });

    it('should handle multi-character separators', () => {
      const result = parseContent('Copy :: ⌘C', '::');
      expect(result).toEqual({ main: 'Copy', shortcut: '⌘C' });
    });

    it('should not split on default separator when custom is provided', () => {
      const result = parseContent('Save; ⌘S', '|');
      expect(result).toEqual({ main: 'Save; ⌘S' });
    });
  });
});

describe('generateTooltipId', () => {
  it('should generate unique IDs', () => {
    const id1 = generateTooltipId();
    const id2 = generateTooltipId();
    const id3 = generateTooltipId();

    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);
  });

  it('should generate IDs with tip-magic prefix', () => {
    const id = generateTooltipId();
    expect(id).toMatch(/^tip-magic-\d+$/);
  });
});
