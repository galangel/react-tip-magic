import { TOUR_CSS_CLASSES, TOUR_DATA_ATTRIBUTES } from '../constants';

/**
 * Options for showing the backdrop
 */
export interface BackdropShowOptions {
  /** Whether the backdrop should capture pointer events instead of letting them through */
  blockInteraction?: boolean;
  /** Called when the backdrop itself is clicked (only reachable when blockInteraction is set) */
  onClick?: () => void;
}

/**
 * BackdropManager handles the creation and cleanup of the tour backdrop
 * and focus target elements. It's designed as a class to encapsulate
 * the mutable DOM references.
 *
 * Elevation is applied as both a class and a data attribute. The stylesheet keys off
 * the attribute: React rewrites the whole `class` attribute when a component
 * re-renders, which would otherwise drop the elevation and leave the target masked by
 * the backdrop while the tour keeps running.
 */
export class BackdropManager {
  private backdropElement: HTMLDivElement | null = null;
  private focusTargetElement: HTMLElement | null = null;
  private alwaysVisibleElements: Element[] = [];
  private clickHandler: (() => void) | null = null;

  /**
   * Check if backdrop is currently visible
   */
  get isVisible(): boolean {
    return this.backdropElement !== null;
  }

  /**
   * Get the current focus target element
   */
  get currentFocusTarget(): HTMLElement | null {
    return this.focusTargetElement;
  }

  /**
   * Show the backdrop overlay and elevate the target element
   *
   * @param targetElement - The element to elevate above the backdrop
   * @param options - Pointer interaction options
   */
  show(targetElement: HTMLElement, options: BackdropShowOptions = {}): void {
    // Clean up previous focus target first
    this.cleanupFocusTarget();

    // Create backdrop if it doesn't exist
    if (!this.backdropElement) {
      const backdrop = document.createElement('div');
      backdrop.className = TOUR_CSS_CLASSES.BACKDROP;
      backdrop.addEventListener('click', this.handleBackdropClick);
      document.body.appendChild(backdrop);
      this.backdropElement = backdrop;
    }

    // A dismissible backdrop has to receive the click in order to act on it
    const shouldBlock = Boolean(options.blockInteraction || options.onClick);
    if (shouldBlock) {
      this.backdropElement.setAttribute(TOUR_DATA_ATTRIBUTES.BACKDROP_INTERACTIVE, '');
    } else {
      this.backdropElement.removeAttribute(TOUR_DATA_ATTRIBUTES.BACKDROP_INTERACTIVE);
    }
    this.clickHandler = options.onClick ?? null;

    // Elevate target above backdrop
    elevate(targetElement, TOUR_CSS_CLASSES.FOCUS_TARGET, TOUR_DATA_ATTRIBUTES.FOCUS);
    this.focusTargetElement = targetElement;

    // Find and elevate all elements with data-tip-always-visible
    this.elevateAlwaysVisibleElements();
  }

  /**
   * Hide the backdrop overlay and clean up focus target
   */
  hide(): void {
    // Remove backdrop element
    if (this.backdropElement) {
      this.backdropElement.removeEventListener('click', this.handleBackdropClick);
      this.backdropElement.remove();
      this.backdropElement = null;
    }
    this.clickHandler = null;

    // Clean up focus target
    this.cleanupFocusTarget();

    // Clean up always-visible elements
    this.cleanupAlwaysVisibleElements();
  }

  /**
   * Clean up only the focus target (remove class and attribute)
   */
  cleanupFocusTarget(): void {
    if (this.focusTargetElement) {
      unelevate(this.focusTargetElement, TOUR_CSS_CLASSES.FOCUS_TARGET, TOUR_DATA_ATTRIBUTES.FOCUS);
      this.focusTargetElement = null;
    }
  }

  /**
   * Re-apply elevation to the focus target
   *
   * Called when the host app rewrites the target's `class` attribute, which drops the
   * library's class alongside its own. Deliberately does not touch the always-visible
   * set: those elements are unrelated to the target's class changes, whose frequency the
   * host app controls.
   */
  reapplyFocusTarget(): void {
    if (this.focusTargetElement) {
      elevate(this.focusTargetElement, TOUR_CSS_CLASSES.FOCUS_TARGET, TOUR_DATA_ATTRIBUTES.FOCUS);
    }
  }

  /**
   * Re-apply elevation to every tracked always-visible element
   */
  reapplyAlwaysVisible(): void {
    this.alwaysVisibleElements.forEach((element) => {
      elevate(element, TOUR_CSS_CLASSES.ALWAYS_VISIBLE, TOUR_DATA_ATTRIBUTES.ELEVATED);
    });
  }

  /**
   * Handle a click on the backdrop itself
   */
  private handleBackdropClick = (): void => {
    this.clickHandler?.();
  };

  /**
   * Find and elevate all elements with data-tip-always-visible attribute
   */
  private elevateAlwaysVisibleElements(): void {
    // Clean up any previously elevated elements first
    this.cleanupAlwaysVisibleElements();

    // Find all elements with the always-visible attribute
    const elements = document.querySelectorAll(`[${TOUR_DATA_ATTRIBUTES.ALWAYS_VISIBLE}]`);

    elements.forEach((element) => {
      elevate(element, TOUR_CSS_CLASSES.ALWAYS_VISIBLE, TOUR_DATA_ATTRIBUTES.ELEVATED);
      this.alwaysVisibleElements.push(element);
    });
  }

  /**
   * Remove the always-visible class and attribute from all tracked elements
   */
  private cleanupAlwaysVisibleElements(): void {
    this.alwaysVisibleElements.forEach((element) => {
      unelevate(element, TOUR_CSS_CLASSES.ALWAYS_VISIBLE, TOUR_DATA_ATTRIBUTES.ELEVATED);
    });
    this.alwaysVisibleElements = [];
  }

  /**
   * Full cleanup - call on unmount
   */
  destroy(): void {
    this.hide();
  }
}

/**
 * Mark an element as elevated above the backdrop
 *
 * Writes only when something is actually missing. `DOMTokenList.add` re-sets the
 * `class` attribute even when the token is already present, which would notify the
 * tour's target watcher, which would call back into here - an unbroken loop of
 * mutation records.
 */
function elevate(element: Element, className: string, attribute: string): void {
  if (!element.classList.contains(className)) {
    element.classList.add(className);
  }
  if (!element.hasAttribute(attribute)) {
    element.setAttribute(attribute, '');
  }
}

/**
 * Remove the elevation markers from an element
 */
function unelevate(element: Element, className: string, attribute: string): void {
  element.classList.remove(className);
  element.removeAttribute(attribute);
}

/**
 * Create a new BackdropManager instance
 */
export function createBackdropManager(): BackdropManager {
  return new BackdropManager();
}
