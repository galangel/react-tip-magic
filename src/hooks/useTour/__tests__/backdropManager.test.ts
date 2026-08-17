import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOUR_CSS_CLASSES, TOUR_DATA_ATTRIBUTES } from '../constants';
import { BackdropManager, createBackdropManager } from '../utils/backdropManager';

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
    // Clean up any always-visible test elements
    document
      .querySelectorAll(`[${TOUR_DATA_ATTRIBUTES.ALWAYS_VISIBLE}]`)
      .forEach((el) => el.remove());
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

  describe('always-visible elements', () => {
    let headerElement: HTMLElement;
    let sidebarElement: HTMLElement;

    beforeEach(() => {
      headerElement = document.createElement('header');
      headerElement.setAttribute(TOUR_DATA_ATTRIBUTES.ALWAYS_VISIBLE, '');
      document.body.appendChild(headerElement);

      sidebarElement = document.createElement('nav');
      sidebarElement.setAttribute(TOUR_DATA_ATTRIBUTES.ALWAYS_VISIBLE, '');
      document.body.appendChild(sidebarElement);
    });

    afterEach(() => {
      headerElement.remove();
      sidebarElement.remove();
    });

    it('should add always-visible class to elements with data-tip-always-visible', () => {
      manager.show(targetElement);

      expect(headerElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(true);
      expect(sidebarElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(true);
    });

    it('should remove always-visible class when backdrop is hidden', () => {
      manager.show(targetElement);
      manager.hide();

      expect(headerElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(false);
      expect(sidebarElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(false);
    });

    it('should handle dynamically added always-visible elements', () => {
      manager.show(targetElement);

      // Add a new element after backdrop is shown
      const newElement = document.createElement('footer');
      newElement.setAttribute(TOUR_DATA_ATTRIBUTES.ALWAYS_VISIBLE, '');
      document.body.appendChild(newElement);

      // Clean up previous always-visible elements and re-elevate
      // When show is called again (e.g., when switching steps), the new element should be found
      manager.show(targetElement);

      expect(newElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(true);
      expect(headerElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(true);

      newElement.remove();
    });

    it('should clean up always-visible elements when destroyed', () => {
      manager.show(targetElement);
      manager.destroy();

      expect(headerElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(false);
      expect(sidebarElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(false);
    });

    it('should not affect elements without data-tip-always-visible', () => {
      const regularElement = document.createElement('div');
      document.body.appendChild(regularElement);

      manager.show(targetElement);

      expect(regularElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(false);

      regularElement.remove();
    });

    it('should work with nested elements', () => {
      // Create a container with nested elements
      const container = document.createElement('div');
      container.setAttribute(TOUR_DATA_ATTRIBUTES.ALWAYS_VISIBLE, '');
      const nestedElement = document.createElement('span');
      container.appendChild(nestedElement);
      document.body.appendChild(container);

      manager.show(targetElement);

      // Only the element with the attribute should get the class
      expect(container.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(true);
      expect(nestedElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(false);

      container.remove();
    });

    it('should update always-visible elements when switching focus targets', () => {
      const target2 = document.createElement('div');
      document.body.appendChild(target2);

      manager.show(targetElement);
      expect(headerElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(true);

      manager.show(target2);
      expect(headerElement.classList.contains(TOUR_CSS_CLASSES.ALWAYS_VISIBLE)).toBe(true);

      target2.remove();
    });
  });

  describe('attribute-based elevation', () => {
    it('should mark the focus target with the elevation attribute', () => {
      manager.show(targetElement);

      expect(targetElement.hasAttribute(TOUR_DATA_ATTRIBUTES.FOCUS)).toBe(true);
    });

    it('should mark always-visible elements with the elevation attribute', () => {
      const header = document.createElement('header');
      header.setAttribute(TOUR_DATA_ATTRIBUTES.ALWAYS_VISIBLE, '');
      document.body.appendChild(header);

      manager.show(targetElement);

      expect(header.hasAttribute(TOUR_DATA_ATTRIBUTES.ELEVATED)).toBe(true);

      header.remove();
    });

    it('should remove the elevation attribute on hide', () => {
      manager.show(targetElement);
      manager.hide();

      expect(targetElement.hasAttribute(TOUR_DATA_ATTRIBUTES.FOCUS)).toBe(false);
    });

    it('should restore the class after the host app rewrites className', () => {
      manager.show(targetElement);

      // React writes the whole class attribute on re-render
      targetElement.className = 'css-generated-hash';
      expect(targetElement.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(false);
      // The attribute the stylesheet keys off was never React's to remove
      expect(targetElement.hasAttribute(TOUR_DATA_ATTRIBUTES.FOCUS)).toBe(true);

      manager.reapplyFocusTarget();

      expect(targetElement.classList.contains(TOUR_CSS_CLASSES.FOCUS_TARGET)).toBe(true);
    });

    it('should not touch the DOM when reapply has nothing to restore', () => {
      manager.show(targetElement);

      // A no-op reapply must not write the class attribute - the tour's target watcher
      // observes it, and a write would notify the watcher that called reapply
      const setAttributeSpy = vi.spyOn(targetElement, 'setAttribute');
      const addSpy = vi.spyOn(targetElement.classList, 'add');

      manager.reapplyFocusTarget();

      expect(setAttributeSpy).not.toHaveBeenCalled();
      expect(addSpy).not.toHaveBeenCalled();

      setAttributeSpy.mockRestore();
      addSpy.mockRestore();
    });
  });

  describe('pointer interaction', () => {
    it('should leave the backdrop non-interactive by default', () => {
      manager.show(targetElement);

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`);
      expect(backdrop?.hasAttribute(TOUR_DATA_ATTRIBUTES.BACKDROP_INTERACTIVE)).toBe(false);
    });

    it('should mark the backdrop interactive when blocking', () => {
      manager.show(targetElement, { blockInteraction: true });

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`);
      expect(backdrop?.hasAttribute(TOUR_DATA_ATTRIBUTES.BACKDROP_INTERACTIVE)).toBe(true);
    });

    it('should mark the backdrop interactive when a click handler is supplied', () => {
      manager.show(targetElement, { onClick: () => {} });

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`);
      expect(backdrop?.hasAttribute(TOUR_DATA_ATTRIBUTES.BACKDROP_INTERACTIVE)).toBe(true);
    });

    it('should invoke the click handler when the backdrop is clicked', () => {
      const onClick = vi.fn();
      manager.show(targetElement, { onClick });

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`) as HTMLElement;
      backdrop.click();

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should use the handler from the most recent show call', () => {
      const first = vi.fn();
      const second = vi.fn();
      manager.show(targetElement, { onClick: first });
      manager.show(targetElement, { onClick: second });

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`) as HTMLElement;
      backdrop.click();

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('should drop the interactive marker when a later step does not need it', () => {
      manager.show(targetElement, { blockInteraction: true });
      manager.show(targetElement);

      const backdrop = document.querySelector(`.${TOUR_CSS_CLASSES.BACKDROP}`);
      expect(backdrop?.hasAttribute(TOUR_DATA_ATTRIBUTES.BACKDROP_INTERACTIVE)).toBe(false);
    });
  });
});
