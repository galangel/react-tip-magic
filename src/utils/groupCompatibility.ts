/**
 * Group compatibility utilities for tooltip transitions
 *
 * These functions determine how tooltips transition between elements
 * based on their group assignments.
 */

/**
 * Determines if two tooltip groups are compatible for move transitions.
 *
 * Group compatibility rules:
 * - Same group → allow smooth move transition
 * - Different groups (both have groups but different) → force jump transition
 * - One has group, one doesn't → allow smooth move transition
 * - Both have no group → allow smooth move transition
 *
 * @param currentGroup - The group of the current tooltip target
 * @param previousGroup - The group of the previous tooltip target
 * @returns true if groups are compatible for move transitions
 *
 * @example
 * ```ts
 * areGroupsCompatible('nav', 'nav'); // true - same group
 * areGroupsCompatible('nav', 'sidebar'); // false - different groups
 * areGroupsCompatible('nav', undefined); // true - one has group
 * areGroupsCompatible(undefined, undefined); // true - both no group
 * ```
 */
export function areGroupsCompatible(
  currentGroup: string | undefined,
  previousGroup: string | undefined
): boolean {
  // Both have no group
  if (currentGroup === undefined && previousGroup === undefined) {
    return true;
  }

  // Same group
  if (currentGroup === previousGroup) {
    return true;
  }

  // One has group, one doesn't (treat as compatible)
  if (
    (currentGroup === undefined && previousGroup !== undefined) ||
    (currentGroup !== undefined && previousGroup === undefined)
  ) {
    return true;
  }

  // Different groups - not compatible
  return false;
}

/**
 * Determines if a tooltip should animate its position during a transition.
 *
 * @param hasBeenPositioned - Whether the tooltip has been positioned at least once
 * @param isTransitioning - Whether the tooltip is currently transitioning between targets
 * @param transitionBehavior - The configured transition behavior ('move' or 'jump')
 * @param areGroupsCompatible - Whether the current and previous groups are compatible
 * @returns true if the tooltip should animate its position
 */
export function shouldAnimatePosition(
  hasBeenPositioned: boolean,
  isTransitioning: boolean,
  transitionBehavior: 'move' | 'jump',
  groupsCompatible: boolean
): boolean {
  return hasBeenPositioned && isTransitioning && transitionBehavior === 'move' && groupsCompatible;
}
