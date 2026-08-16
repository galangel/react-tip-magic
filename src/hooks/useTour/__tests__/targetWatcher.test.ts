import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTargetWatcher, TargetWatcher } from '../utils/targetWatcher';

/**
 * MutationObserver callbacks are delivered on the microtask queue, so every assertion
 * has to wait a tick after the mutation.
 */
const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('TargetWatcher', () => {
  let watcher: TargetWatcher;
  let target: HTMLElement;

  beforeEach(() => {
    watcher = createTargetWatcher();
    document.body.innerHTML = '<div id="panel"><div id="target" class="css-abc"></div></div>';
    target = document.getElementById('target') as HTMLElement;
  });

  afterEach(() => {
    watcher.destroy();
    document.body.innerHTML = '';
  });

  describe('class rewrites', () => {
    it('should notify when the class attribute is rewritten', async () => {
      const onClassRewritten = vi.fn();
      watcher.watch(target, { onClassRewritten, onDetached: vi.fn() });

      // What React does when a CSS-in-JS theme change produces a new generated hash
      target.className = 'css-xyz';
      await flushMutations();

      expect(onClassRewritten).toHaveBeenCalled();
    });

    it('should not notify for unrelated attribute changes', async () => {
      const onClassRewritten = vi.fn();
      watcher.watch(target, { onClassRewritten, onDetached: vi.fn() });

      target.setAttribute('data-something', 'else');
      await flushMutations();

      expect(onClassRewritten).not.toHaveBeenCalled();
    });
  });

  describe('detachment', () => {
    it('should notify when the element itself is removed', async () => {
      const onDetached = vi.fn();
      watcher.watch(target, { onClassRewritten: vi.fn(), onDetached });

      target.remove();
      await flushMutations();

      expect(onDetached).toHaveBeenCalledTimes(1);
    });

    it('should notify when an ancestor is removed', async () => {
      const onDetached = vi.fn();
      watcher.watch(target, { onClassRewritten: vi.fn(), onDetached });

      // The parent never reports a mutation of its own here
      document.getElementById('panel')?.remove();
      await flushMutations();

      expect(onDetached).toHaveBeenCalledTimes(1);
    });

    it('should not notify while the element is still connected', async () => {
      const onDetached = vi.fn();
      watcher.watch(target, { onClassRewritten: vi.fn(), onDetached });

      document.body.appendChild(document.createElement('span'));
      await flushMutations();

      expect(onDetached).not.toHaveBeenCalled();
    });

    it('should notify only once', async () => {
      const onDetached = vi.fn();
      watcher.watch(target, { onClassRewritten: vi.fn(), onDetached });

      target.remove();
      await flushMutations();
      document.body.appendChild(document.createElement('span'));
      await flushMutations();

      expect(onDetached).toHaveBeenCalledTimes(1);
    });
  });

  describe('lifecycle', () => {
    it('should stop notifying after unwatch', async () => {
      const onClassRewritten = vi.fn();
      const onDetached = vi.fn();
      watcher.watch(target, { onClassRewritten, onDetached });
      watcher.unwatch();

      target.className = 'css-xyz';
      target.remove();
      await flushMutations();

      expect(onClassRewritten).not.toHaveBeenCalled();
      expect(onDetached).not.toHaveBeenCalled();
    });

    it('should release the previous subject when watching a new one', async () => {
      const first = vi.fn();
      const second = vi.fn();
      const other = document.createElement('div');
      document.body.appendChild(other);

      watcher.watch(target, { onClassRewritten: first, onDetached: vi.fn() });
      watcher.watch(other, { onClassRewritten: second, onDetached: vi.fn() });

      target.className = 'css-xyz';
      other.className = 'css-xyz';
      await flushMutations();

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalled();
    });

    it('should be safe to unwatch without watching', () => {
      expect(() => watcher.unwatch()).not.toThrow();
    });
  });
});
