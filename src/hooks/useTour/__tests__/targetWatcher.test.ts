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

/**
 * Cost characteristics. The point of the ancestor-chain design is that mutations which
 * cannot possibly detach the target produce no MutationRecords at all - record counts
 * are spec-defined, so these hold in a real browser too.
 */
describe('cost of watching', () => {
  let costWatcher: TargetWatcher;
  let costTarget: HTMLElement;

  beforeEach(() => {
    costWatcher = createTargetWatcher();
    document.body.innerHTML = '<div id="panel"><div id="target" class="css-abc"></div></div>';
    costTarget = document.getElementById('target') as HTMLElement;
  });

  afterEach(() => {
    costWatcher.destroy();
    document.body.innerHTML = '';
  });

  /** Churn rows in a branch that is not an ancestor of the target */
  function churnUnrelatedBranch(rows: number) {
    const busy = document.createElement('div');
    document.body.appendChild(busy);
    for (let i = 0; i < rows; i += 1) {
      const row = document.createElement('div');
      row.appendChild(document.createElement('span'));
      busy.appendChild(row);
    }
    while (busy.firstChild) busy.removeChild(busy.firstChild);
    busy.remove();
  }

  it('delivers no callbacks for mutations in an unrelated branch', async () => {
    const onDetached = vi.fn();
    const onClassRewritten = vi.fn();
    costWatcher.watch(costTarget, { onClassRewritten, onDetached });

    churnUnrelatedBranch(500);
    await flushMutations();

    expect(onDetached).not.toHaveBeenCalled();
    expect(onClassRewritten).not.toHaveBeenCalled();
  });

  it('registers no attribute observer when no class callback is supplied', () => {
    const observed: MutationObserverInit[] = [];
    const RealMO = globalThis.MutationObserver;
    class SpyMO extends RealMO {
      observe(node: Node, options?: MutationObserverInit) {
        observed.push(options ?? {});
        return super.observe(node, options);
      }
    }
    globalThis.MutationObserver = SpyMO as unknown as typeof MutationObserver;

    try {
      const bare = createTargetWatcher();
      bare.watch(costTarget, { onDetached: vi.fn() });
      bare.destroy();
    } finally {
      globalThis.MutationObserver = RealMO;
    }

    expect(observed.filter((o) => o.attributeFilter?.includes('class'))).toHaveLength(0);
    // ...and nothing observes a subtree, which would collect the whole document
    expect(observed.filter((o) => o.subtree)).toHaveLength(0);
    expect(observed.every((o) => o.childList)).toBe(true);
  });

  it('observes the ancestor chain rather than the document', () => {
    const observedNodes: Node[] = [];
    const RealMO = globalThis.MutationObserver;
    class SpyMO extends RealMO {
      observe(node: Node, options?: MutationObserverInit) {
        observedNodes.push(node);
        return super.observe(node, options);
      }
    }
    globalThis.MutationObserver = SpyMO as unknown as typeof MutationObserver;

    try {
      const bare = createTargetWatcher();
      bare.watch(costTarget, { onDetached: vi.fn() });
      bare.destroy();
    } finally {
      globalThis.MutationObserver = RealMO;
    }

    // #panel, body, html - depth, not app size
    expect(observedNodes).toEqual([
      document.getElementById('panel'),
      document.body,
      document.documentElement,
    ]);
  });
});
