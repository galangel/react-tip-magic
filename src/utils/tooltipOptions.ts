import type { TooltipShowOptions } from '../types';

/**
 * Whether two sets of show options would display the same way, apart from their content
 *
 * `content` and `owner` are left out: callers compare content themselves, and an owner is
 * an identity, not a display option.
 *
 * @param a - One set of options
 * @param b - The other
 * @returns Whether every other option is the same value
 *
 * @example
 * ```ts
 * haveSameTooltipOptions({ placement: 'top' }, { placement: 'top', content: 'x' }); // true
 * ```
 */
export function haveSameTooltipOptions(a: TooltipShowOptions, b: TooltipShowOptions): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]) as Set<keyof TooltipShowOptions>;
  for (const key of keys) {
    if (key !== 'content' && key !== 'owner' && a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}
