/**
 * Callbacks invoked by a {@link TargetWatcher}
 */
export interface TargetWatcherCallbacks {
  /** The watched element's class attribute was rewritten by the host app */
  onClassRewritten: () => void;
  /** The watched element left the document */
  onDetached: () => void;
}

/**
 * TargetWatcher observes the current tour target for the two ways a running tour
 * loses it.
 *
 * 1. **The class attribute is rewritten.** React writes `class` wholesale on update, so
 *    a CSS-in-JS theme switch (new generated hash, new className) silently drops the
 *    library's highlight and elevation classes while the tour keeps running.
 * 2. **The element leaves the DOM.** Without this, the backdrop stays up over an app
 *    with nothing highlighted and the tooltip collapses into the viewport corner.
 *
 * Detachment is detected by watching the document for structural changes and testing
 * `isConnected`, rather than by observing the target's parent - an ancestor several
 * levels up can be removed without the parent ever reporting a mutation.
 */
export class TargetWatcher {
  private classObserver: MutationObserver | null = null;
  private treeObserver: MutationObserver | null = null;

  /**
   * Start watching an element, replacing any previous subject
   *
   * @param element - The element to watch
   * @param callbacks - Handlers for the two loss modes
   */
  watch(element: Element, callbacks: TargetWatcherCallbacks): void {
    this.unwatch();

    // Not available in every non-browser environment the library may be rendered in
    if (typeof MutationObserver === 'undefined') {
      return;
    }

    this.classObserver = new MutationObserver(() => {
      callbacks.onClassRewritten();
    });
    this.classObserver.observe(element, {
      attributes: true,
      attributeFilter: ['class'],
    });

    this.treeObserver = new MutationObserver(() => {
      if (element.isConnected) {
        return;
      }
      // Stop before notifying - the handler ends or advances the tour
      this.unwatch();
      callbacks.onDetached();
    });
    this.treeObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Stop watching the current element
   */
  unwatch(): void {
    this.classObserver?.disconnect();
    this.classObserver = null;
    this.treeObserver?.disconnect();
    this.treeObserver = null;
  }

  /**
   * Full cleanup - call on unmount
   */
  destroy(): void {
    this.unwatch();
  }
}

/**
 * Create a new TargetWatcher instance
 */
export function createTargetWatcher(): TargetWatcher {
  return new TargetWatcher();
}
