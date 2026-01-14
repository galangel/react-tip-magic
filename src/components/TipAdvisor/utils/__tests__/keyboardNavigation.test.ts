import { describe, expect, it } from 'vitest';
import { getNextFocusedIndex, isNavigationKey } from '../keyboardNavigation';

describe('getNextFocusedIndex', () => {
  describe('navigating down', () => {
    it('should increment index when not at end', () => {
      expect(getNextFocusedIndex(0, 5, 'down')).toBe(1);
      expect(getNextFocusedIndex(1, 5, 'down')).toBe(2);
      expect(getNextFocusedIndex(2, 5, 'down')).toBe(3);
    });

    it('should wrap to start when at end', () => {
      expect(getNextFocusedIndex(4, 5, 'down')).toBe(0);
    });

    it('should handle single item', () => {
      expect(getNextFocusedIndex(0, 1, 'down')).toBe(0);
    });

    it('should return 0 when item count is 0', () => {
      expect(getNextFocusedIndex(0, 0, 'down')).toBe(0);
    });
  });

  describe('navigating up', () => {
    it('should decrement index when not at start', () => {
      expect(getNextFocusedIndex(4, 5, 'up')).toBe(3);
      expect(getNextFocusedIndex(3, 5, 'up')).toBe(2);
      expect(getNextFocusedIndex(1, 5, 'up')).toBe(0);
    });

    it('should wrap to end when at start', () => {
      expect(getNextFocusedIndex(0, 5, 'up')).toBe(4);
    });

    it('should handle single item', () => {
      expect(getNextFocusedIndex(0, 1, 'up')).toBe(0);
    });

    it('should return 0 when item count is 0', () => {
      expect(getNextFocusedIndex(0, 0, 'up')).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle two items', () => {
      expect(getNextFocusedIndex(0, 2, 'down')).toBe(1);
      expect(getNextFocusedIndex(1, 2, 'down')).toBe(0);
      expect(getNextFocusedIndex(0, 2, 'up')).toBe(1);
      expect(getNextFocusedIndex(1, 2, 'up')).toBe(0);
    });
  });
});

describe('isNavigationKey', () => {
  it('should return true for Escape', () => {
    expect(isNavigationKey('Escape')).toBe(true);
  });

  it('should return true for ArrowDown', () => {
    expect(isNavigationKey('ArrowDown')).toBe(true);
  });

  it('should return true for ArrowUp', () => {
    expect(isNavigationKey('ArrowUp')).toBe(true);
  });

  it('should return true for Enter', () => {
    expect(isNavigationKey('Enter')).toBe(true);
  });

  it('should return false for other keys', () => {
    expect(isNavigationKey('a')).toBe(false);
    expect(isNavigationKey('Tab')).toBe(false);
    expect(isNavigationKey('Space')).toBe(false);
    expect(isNavigationKey('ArrowLeft')).toBe(false);
    expect(isNavigationKey('ArrowRight')).toBe(false);
  });
});
