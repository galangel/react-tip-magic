import type { TourPanelProps } from '../TourPanel';

/**
 * Holds the props of the tour panel on screen, for `useSyncExternalStore`
 *
 * The tooltip's state holds one panel element per step. The element reads its props
 * from here, so `useTour` can update a running step in place without going through the
 * provider's state - which would re-render the consumer, which would update again.
 */
export class TourPanelStore {
  private props: TourPanelProps | null = null;
  private readonly listeners = new Set<() => void>();

  /** The current props - the same object until `set` is called */
  getSnapshot = (): TourPanelProps | null => this.props;

  /**
   * Register a listener for `set`
   *
   * @returns A function that removes the listener
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Replace the props and notify every listener */
  set(props: TourPanelProps): void {
    this.props = props;
    this.listeners.forEach((listener) => listener());
  }
}

/**
 * Create a new TourPanelStore instance
 */
export function createTourPanelStore(): TourPanelStore {
  return new TourPanelStore();
}
