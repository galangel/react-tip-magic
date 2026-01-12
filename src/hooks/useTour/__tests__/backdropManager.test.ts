import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BackdropManager, createBackdropManager } from '../utils/backdropManager';
import { TOUR_CSS_CLASSES } from '../constants';

describe('BackdropManager', () => {
  let manager: BackdropManager;
  let targetElement: HTMLElement;

  beforeEach(() => {
    manager = createBackdropManager();
    targetElement = document.createElement('div');
    targetElement.id = 'test-target';
    document.body.appendChild(targetElement);
  });

  afterEach(() => {
    manager.destroy();
    targetElement.remove();
    // Clean up any leftover backdrop elements
    document.querySelectorAll(`.${TOUR_CSS_CLASSES.BACKDROP}`).forEach((el) => el.remove());
  });

  describe('initial state', () => {
    it('should not be visible initially', () => {
      expect(manager.isVisible).toBe(false);
    });

    it('should have no focus target initially', () => {
      expect(manager.currentFocusTarget).toBeNull();
    });
  });

  describe('show', () => {
    it('should create backdrop element in DOM', () => {
      manager.show(targetElement);

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`);
      expect(backdrop).not.toBeNull();
      expect(manager.isVisible).toBe(true);
    });

    it('should add focus class to target element', () => {
      manager.show(targetElement);

      expect(targetElement.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(true);
      expect(manager.currentFocusTarget).toBe(targetElement);
    });

    it('should reuse existing backdrop element', () => {
      manager.show(targetElement);
      manager.show(targetElement);

      const backdrops = document.querySelectorAll(`.${TOUR_CSS_CLASSES.BACKDROP}`);
      expect(backdrops.length).toBe(1);
    });

    it('should clean up previous focus target when showing new one', () => {
      const target1 = document.createElement('div');
      const target2 = document.createElement('div');
      document.body.appendChild(target1);
      document.body.appendChild(target2);

      manager.show(target1);
      expect(target1.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(true);

      manager.show(target2);
      expect(target1.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(false);
      expect(target2.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(true);

      target1.remove();
      target2.remove();
    });
  });

  describe('hide', () => {
    it('should remove backdrop element from DOM', () => {
      manager.show(targetElement);
      manager.hide();

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`);
      expect(backdrop).toBeNull();
      expect(manager.isVisible).toBe(false);
    });

    it('should remove focus class from target element', () => {
      manager.show(targetElement);
      manager.hide();

      expect(targetElement.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(false);
      expect(manager.currentFocusTarget).toBeNull();
    });

    it('should be safe to call multiple times', () => {
      manager.show(targetElement);
      manager.hide();
      manager.hide();
      manager.hide();

      expect(manager.isVisible).toBe(false);
    });
  });

  describe('cleanupFocusTarget', () => {
    it('should only remove focus class without removing backdrop', () => {
      manager.show(targetElement);
      manager.cleanupFocusTarget();

      expect(targetElement.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(false);
      expect(manager.currentFocusTarget).toBeNull();
      expect(manager.isVisible).toBe(true); // backdrop still exists
    });
  });

  describe('destroy', () => {
    it('should clean up everything', () => {
      manager.show(targetElement);
      manager.destroy();

      expect(manager.isVisible).toBe(false);
      expect(manager.currentFocusTarget).toBeNull();
      expect(targetElement.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(false);
    });
  });
});
