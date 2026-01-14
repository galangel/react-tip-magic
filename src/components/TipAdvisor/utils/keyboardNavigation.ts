/**
 * Navigation direction for keyboard control
 */
export type NavigationDirection = 'up' | 'down';

/**
 * Calculates the next focused index for circular navigation.
 *
 * @param currentIndex - Current focused index
 * @param itemCount - Total number of items
 * @param direction - Navigation direction ('up' or 'down')
 * @returns The new focused index with circular wrapping
 */
export function getNextFocusedIndex(
  currentIndex: number,
  itemCount: number,
  direction: NavigationDirection
): number {
  if (itemCount === 0) {
    return 0;
  }

  if (direction === 'down') {
    return currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
  }

  // direction === 'up'
  return currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
}

/**
 * Determines if a key is a navigation key that should be handled.
 *
 * @param key - The keyboard event key
 * @returns True if the key is a navigation key
 */
export function isNavigationKey(key: string): key is 'Escape' | 'ArrowDown' | 'ArrowUp' | 'Enter' {
  return key === 'Escape' || key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter';
}
