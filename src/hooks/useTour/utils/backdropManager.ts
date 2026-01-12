import { TOUR_CSS_CLASSES } from '../constants';

/**
 * BackdropManager handles the creation and cleanup of the tour backdrop
 * and focus target elements. It's designed as a class to encapsulate
 * the mutable DOM references.
 */
export class BackdropManager {
  private backdropElement: HTMLDivElement | null = null;
  private focusTargetElement: HTMLElement | null = null;

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
   */
  show(targetElement: HTMLElement): void {
    // Clean up previous focus target first
    this.cleanupFocusTarget();

    // Create backdrop if it doesn't exist
    if (!this.backdropElement) {
      const backdrop = document.createElement('div');
      backdrop.className = TOUR_CSS_CLASSES.BACKDROP;
      document.body.appendChild(backdrop);
      this.backdropElement = backdrop;
    }

    // Elevate target above backdrop
    targetElement.classList.add(TOUR_CSS_CLASSES.FOCUS_TARGET);
    this.focusTargetElement = targetElement;
  }

  /**
   * Hide the backdrop overlay and clean up focus target
   */
  hide(): void {
    // Remove backdrop element
    if (this.backdropElement) {
      this.backdropElement.remove();
      this.backdropElement = null;
    }

    // Clean up focus target
    this.cleanupFocusTarget();
  }

  /**
   * Clean up only the focus target (remove class)
   */
  cleanupFocusTarget(): void {
    if (this.focusTargetElement) {
      this.focusTargetElement.classList.remove(TOUR_CSS_CLASSES.FOCUS_TARGET);
      this.focusTargetElement = null;
    }
  }

  /**
   * Full cleanup - call on unmount
   */
  destroy(): void {
    this.hide();
  }
}

/**
 * Create a new BackdropManager instance
 */
export function createBackdropManager(): BackdropManager {
  return new BackdropManager();
}
