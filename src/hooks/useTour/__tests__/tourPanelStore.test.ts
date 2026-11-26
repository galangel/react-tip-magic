import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_NAVIGATION } from '../constants';
import type { TourPanelProps } from '../TourPanel';
import { DEFAULT_PROGRESS } from '../utils';
import { createTourPanelStore } from '../utils/tourPanelStore';

const props = (text: string): TourPanelProps => ({
  step: { target: 'one', text },
  stepInfo: { index: 0, target: 'one', content: text, isFirst: true, isLast: true, total: 1 },
  navigation: DEFAULT_NAVIGATION,
  body: { kind: 'text', value: text },
  progress: DEFAULT_PROGRESS,
});

describe('TourPanelStore', () => {
  it('starts empty', () => {
    expect(createTourPanelStore().getSnapshot()).toBeNull();
  });

  it('returns the same props object until they are replaced', () => {
    const store = createTourPanelStore();
    const first = props('A');
    store.set(first);

    expect(store.getSnapshot()).toBe(first);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
  });

  it('notifies listeners on set, until they unsubscribe', () => {
    const store = createTourPanelStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.set(props('A'));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    store.set(props('B'));
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.getSnapshot()?.body.value).toBe('B');
  });
});
