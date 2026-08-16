/**
 * HighlightManager handles adding/removing highlight classes from tour targets
 */
export class HighlightManager {
  private currentElement: Element | null = null;
  private highlightClass: string | undefined;

  constructor(highlightClass?: string) {
    this.highlightClass = highlightClass;
  }

  /**
   * Update the highlight class (e.g., if config changes)
   */
  setHighlightClass(highlightClass: string | undefined): void {
    // If class changed and we have a highlighted element, update it
    if (this.currentElement && this.highlightClass !== highlightClass) {
      if (this.highlightClass) {
        this.currentElement.classList.remove(this.highlightClass);
      }
      if (highlightClass) {
        this.currentElement.classList.add(highlightClass);
      }
    }
    this.highlightClass = highlightClass;
  }

  /**
   * Get the current highlight class
   */
  getHighlightClass(): string | undefined {
    return this.highlightClass;
  }

  /**
   * Highlight a new element (removes highlight from previous element)
   *
   * @param element - The element to highlight
   */
  highlight(element: Element): void {
    if (!this.highlightClass) return;

    // Remove from previous
    if (this.currentElement) {
      this.currentElement.classList.remove(this.highlightClass);
    }

    // Add to new
    element.classList.add(this.highlightClass);
    this.currentElement = element;
  }

  /**
   * Re-apply the highlight class to the current element
   *
   * The class is the consumer's own styling hook, so it has to stay a class rather
   * than move to a data attribute. That leaves it exposed to React rewriting the
   * target's `class` attribute, which the tour's target watcher recovers from by
   * calling this.
   */
  reapply(): void {
    if (!this.currentElement || !this.highlightClass) {
      return;
    }

    // Only write when the class is actually missing. `DOMTokenList.add` re-sets the
    // `class` attribute even for a token that is already there, which would notify the
    // watcher that called this and loop.
    if (!this.currentElement.classList.contains(this.highlightClass)) {
      this.currentElement.classList.add(this.highlightClass);
    }
  }

  /**
   * Clear any current highlight
   */
  clear(): void {
    if (this.currentElement && this.highlightClass) {
      this.currentElement.classList.remove(this.highlightClass);
      this.currentElement = null;
    }
  }

  /**
   * Full cleanup - call on unmount
   */
  destroy(): void {
    this.clear();
  }
}

/**
 * Create a new HighlightManager instance
 */
export function createHighlightManager(highlightClass?: string): HighlightManager {
  return new HighlightManager(highlightClass);
}
