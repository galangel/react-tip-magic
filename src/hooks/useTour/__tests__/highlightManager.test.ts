import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HighlightManager, createHighlightManager } from '../utils/highlightManager';

describe('HighlightManager', () => {
  let manager: HighlightManager;
  let element1: HTMLElement;
  let element2: HTMLElement;
  const highlightClass = 'test-highlight';

  beforeEach(() => {
    manager = createHighlightManager(highlightClass);
    element1 = document.createElement('div');
    element2 = document.createElement('div');
    document.body.appendChild(element1);
    document.body.appendChild(element2);
  });

  afterEach(() => {
    manager.destroy();
    element1.remove();
    element2.remove();
  });

  describe('highlight', () => {
    it('should add highlight class to element', () => {
      manager.highlight(element1);
      expect(element1.classList.contains(highlightClass)).toBe(true);
    });

    it('should remove highlight from previous element when highlighting new one', () => {
      manager.highlight(element1);
      manager.highlight(element2);

      expect(element1.classList.contains(highlightClass)).toBe(false);
      expect(element2.classList.contains(highlightClass)).toBe(true);
    });

    it('should do nothing if no highlight class is set', () => {
      const noClassManager = createHighlightManager();
      noClassManager.highlight(element1);

      expect(element1.classList.contains(highlightClass)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove highlight class from current element', () => {
      manager.highlight(element1);
      manager.clear();

      expect(element1.classList.contains(highlightClass)).toBe(false);
    });

    it('should be safe to call when nothing is highlighted', () => {
      expect(() => manager.clear()).not.toThrow();
    });
  });

  describe('setHighlightClass', () => {
    it('should update highlight class', () => {
      manager.setHighlightClass('new-highlight');
      expect(manager.getHighlightClass()).toBe('new-highlight');
    });

    it('should update existing highlighted element when class changes', () => {
      manager.highlight(element1);
      expect(element1.classList.contains(highlightClass)).toBe(true);

      manager.setHighlightClass('new-highlight');

      expect(element1.classList.contains(highlightClass)).toBe(false);
      expect(element1.classList.contains('new-highlight')).toBe(true);
    });

    it('should handle changing to undefined', () => {
      manager.highlight(element1);
      manager.setHighlightClass(undefined);

      expect(element1.classList.contains(highlightClass)).toBe(false);
      expect(manager.getHighlightClass()).toBeUndefined();
    });
  });

  describe('getHighlightClass', () => {
    it('should return current highlight class', () => {
      expect(manager.getHighlightClass()).toBe(highlightClass);
    });

    it('should return undefined when no class set', () => {
      const noClassManager = createHighlightManager();
      expect(noClassManager.getHighlightClass()).toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('should clear any highlight', () => {
      manager.highlight(element1);
      manager.destroy();

      expect(element1.classList.contains(highlightClass)).toBe(false);
    });
  });
});
