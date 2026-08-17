/**
 * Callbacks invoked by a {@link TargetWatcher}
 */
export interface TargetWatcherCallbacks {
  /**
   * The watched element's class attribute was rewritten by the host app.
   *
   * Optional: leave it out and no attribute observer is registered at all. Only supply
   * it when there is a class whose loss has a visible effect - a consumer's
   * `highlightClass`. The library's own elevation rides on a data attribute, which
   * React cannot clobber, so it needs no repair.
   */
  onClassRewritten?: () => void;
  /** The watched element left the document */
  onDetached: () => void;
}

/**
 * TargetWatcher observes the current tour target for the ways a running tour loses it.
 *
 * **Detachment.** Without this, the backdrop stays up over an app with nothing
 * highlighted and the panel collapses into the viewport corner. Watching the target's
 * parent is not enough: removing an ancestor several levels up never mutates the
 * target's own parent. But it does mutate *that ancestor's* parent, so observing the
 * whole ancestor chain with `childList` catches every removal that can detach the
 * target - and, because no `subtree` is used, nothing else.
 *
 * That distinction is the reason for the chain walk rather than a single
 * `observe(document.body, { subtree: true })`. A document-wide subtree observer makes
 * the browser allocate and queue a MutationRecord for every DOM change anywhere in the
 * host app for the life of the tour; in a data-heavy app that is continuous garbage for
 * records that are read once and discarded. The chain costs one observer registration
 * per ancestor - depth, not app size - and zero records for mutations that cannot
 * possibly affect the target.
 *
 * The chain stops at the light-DOM boundary, which is not a limitation in practice:
 * `document.querySelector` cannot resolve a target inside a shadow root either, so a
 * tour target is always in the light DOM.
 */
export class TargetWatcher {
  private classObserver: MutationObserver | null = null;
  private chainObserver: MutationObserver | null = null;
  private element: Element | null = null;

  /**
   * Start watching an element, replacing any previous subject
   *
   * @param element - The element to watch
   * @param callbacks - Handlers for the loss modes
   */
  watch(element: Element, callbacks: TargetWatcherCallbacks): void {
    this.unwatch();

    // Not available in every non-browser environment the library may be rendered in
    if (typeof MutationObserver === 'undefined') {
      return;
    }

    this.element = element;

    const { onClassRewritten } = callbacks;
    if (onClassRewritten) {
      this.classObserver = new MutationObserver(() => onClassRewritten());
      this.classObserver.observe(element, {
        attributes: true,
        attributeFilter: ['class'],
      });
    }

    this.chainObserver = new MutationObserver(() => {
      if (!element.isConnected) {
        // Stop before notifying - the handler ends or advances the tour
        this.unwatch();
        callbacks.onDetached();
        return;
      }
      // Still attached, so the element was moved rather than removed: follow it
      this.observeChain();
    });
    this.observeChain();
  }

  /**
   * Stop watching the current element
   */
  unwatch(): void {
    this.classObserver?.disconnect();
    this.classObserver = null;
    this.chainObserver?.disconnect();
    this.chainObserver = null;
    this.element = null;
  }

  /**
   * Full cleanup - call on unmount
   */
  destroy(): void {
    this.unwatch();
  }

  /**
   * (Re)register the chain observer against every ancestor of the target
   */
  private observeChain(): void {
    const observer = this.chainObserver;
    const element = this.element;
    if (!observer || !element) {
      return;
    }

    observer.disconnect();
    for (let node = element.parentElement; node; node = node.parentElement) {
      observer.observe(node, { childList: true });
    }
  }
}

/**
 * Create a new TargetWatcher instance
 */
export function createTargetWatcher(): TargetWatcher {
  return new TargetWatcher();
}
