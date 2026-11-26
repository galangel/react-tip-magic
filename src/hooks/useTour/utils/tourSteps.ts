import { Fragment, isValidElement, type ReactNode } from 'react';
import type { FlowStep } from '../../../types';
import type { CurrentTourStep, TourStep } from '../../../types/tour';
import { escapeHtml } from '../../../utils/escapeHtml';
import { TOUR_DATA_ATTRIBUTES } from '../constants';

/**
 * Filter steps based on their condition functions
 * Returns only steps where condition() returns true (or condition is undefined)
 *
 * @param steps - Array of tour steps
 * @returns Filtered array of visible steps
 */
export function filterVisibleSteps(steps: TourStep[]): TourStep[] {
  return steps.filter((step) => !step.condition || step.condition());
}

/**
 * Find a step's target element in the document
 *
 * @param target - The target's data-tip-id value
 * @returns The element, or null if it is not in the DOM
 */
export function resolveTargetElement(target: string): HTMLElement | null {
  // Quote and backslash would otherwise break out of the attribute selector
  const escaped = target.replace(/["\\]/g, '\\$&');
  return document.querySelector(`[${TOUR_DATA_ATTRIBUTES.TIP_ID}="${escaped}"]`);
}

/**
 * Resolve a step's body to its HTML form, for `CurrentTourStep.content`
 *
 * `text` takes precedence and is HTML-escaped; `content` is passed through as the raw
 * HTML it is documented to be. A `body` step has no HTML form and resolves to `''`.
 *
 * @param step - The tour step
 * @param stepInfo - Current step metadata (without content)
 * @returns Resolved content string
 */
export function resolveStepContent(
  step: TourStep,
  stepInfo: Omit<CurrentTourStep, 'content'>
): string {
  if (step.text !== undefined) {
    return escapeHtml(step.text);
  }

  if (step.body !== undefined || step.content === undefined) {
    return '';
  }

  return typeof step.content === 'function'
    ? step.content(stepInfo as CurrentTourStep)
    : step.content;
}

/**
 * A step's body, resolved for rendering, tagged with how it must be rendered
 */
export type ResolvedStepBody =
  | { kind: 'text'; value: string }
  | { kind: 'node'; value: ReactNode }
  | { kind: 'html'; value: string };

/**
 * Whether React renders no nodes for a node - null, undefined, a boolean, '', or a
 * fragment or array of only those
 */
export function rendersNothing(node: ReactNode): boolean {
  if (node === null || node === undefined || typeof node === 'boolean' || node === '') {
    return true;
  }
  if (Array.isArray(node)) {
    return node.every(rendersNothing);
  }
  if (isValidElement<{ children?: ReactNode }>(node) && node.type === Fragment) {
    return rendersNothing(node.props.children);
  }
  return false;
}

/**
 * Resolve a step's body for rendering
 *
 * Precedence for JS callers who bypass the types is `text`, then `body`, then `content`.
 * A `body` that renders nothing (see `rendersNothing`) resolves as a step with no body: an
 * empty HTML string.
 *
 * @param step - The tour step
 * @param stepInfo - Current step data, passed to a function `body` or `content`
 * @returns The body and how to render it
 */
export function resolveStepBody(step: TourStep, stepInfo: CurrentTourStep): ResolvedStepBody {
  if (step.text !== undefined) {
    return { kind: 'text', value: step.text };
  }

  if (step.body !== undefined) {
    const value = typeof step.body === 'function' ? step.body(stepInfo) : step.body;
    // A body that renders nothing is no body - not an empty, focus-taking dialog
    if (!rendersNothing(value)) {
      return { kind: 'node', value };
    }
  }

  return { kind: 'html', value: resolveStepContent(step, stepInfo) };
}

/**
 * Build CurrentTourStep data for a given index
 *
 * @param visibleSteps - Array of visible (filtered) steps
 * @param index - Index of the step to build
 * @returns CurrentTourStep data or null if index is invalid
 */
export function buildCurrentStep(visibleSteps: TourStep[], index: number): CurrentTourStep | null {
  if (index < 0 || index >= visibleSteps.length) {
    return null;
  }

  const step = visibleSteps[index];
  const stepInfo: Omit<CurrentTourStep, 'content'> = {
    index,
    target: step.target,
    title: step.title,
    isFirst: index === 0,
    isLast: index === visibleSteps.length - 1,
    total: visibleSteps.length,
  };

  return {
    ...stepInfo,
    content: resolveStepContent(step, stepInfo),
  };
}

/**
 * Whether two lists hold the same steps in the same order, judged by `id` and `target`
 *
 * @param previous - The steps a running step was found in
 * @param next - The steps now
 * @returns Whether nothing was added, removed or reordered
 */
export function haveSameStepOrder(previous: TourStep[], next: TourStep[]): boolean {
  return (
    previous.length === next.length &&
    previous.every(
      (step, index) => step.id === next[index].id && step.target === next[index].target
    )
  );
}

/**
 * Find a step in a new list of steps
 *
 * By `id` when it has one; otherwise by `target`, but only when no other step shares it -
 * two steps on one element cannot be told apart, and guessing would show the wrong one. A
 * centered step without an `id` has nothing to go by but its position: it is found only
 * if a centered step without an `id` still holds it.
 *
 * @param steps - The steps now
 * @param step - The step to find
 * @param index - Where the step was
 * @returns Its index; -1 when it is gone; null when it cannot be told apart
 */
export function findStep(steps: TourStep[], step: TourStep, index: number): number | null {
  if (step.id !== undefined) {
    return steps.findIndex((candidate) => candidate.id === step.id);
  }

  if (step.target === undefined) {
    const atIndex = steps[index];
    return atIndex && atIndex.target === undefined && atIndex.id === undefined ? index : null;
  }

  const matches = steps.flatMap((candidate, index) =>
    candidate.target === step.target ? [index] : []
  );
  if (matches.length > 1) {
    return null;
  }
  return matches.length === 1 ? matches[0] : -1;
}

/**
 * The helper flow's copy of the tour's steps
 *
 * @param steps - The visible steps
 * @returns One flow step per tour step
 */
export function buildFlowSteps(steps: TourStep[]): FlowStep[] {
  return steps.map((step, index) => ({
    id: `tour-step-${index}`,
    targetId: step.target ?? '',
    message: step.text ?? (typeof step.content === 'string' ? step.content : ''),
  }));
}

/**
 * Whether two flows hold the same steps, by value
 *
 * @param a - One flow's steps
 * @param b - The other's, or null when there is no flow
 * @returns Whether every step has the same id, target and message
 */
export function haveSameFlowSteps(a: FlowStep[], b: FlowStep[] | null): boolean {
  return (
    !!b &&
    a.length === b.length &&
    a.every(
      (step, index) =>
        step.id === b[index].id &&
        step.targetId === b[index].targetId &&
        step.message === b[index].message
    )
  );
}

/**
 * Calculate progress info for the tour
 *
 * @param isActive - Whether the tour is active
 * @param currentIndex - Current step index (0-based)
 * @param totalSteps - Total number of visible steps
 * @returns Progress object with current (1-based) and total
 */
export function calculateProgress(
  isActive: boolean,
  currentIndex: number,
  totalSteps: number
): { current: number; total: number } {
  return {
    current: isActive ? currentIndex + 1 : 0,
    total: totalSteps,
  };
}
