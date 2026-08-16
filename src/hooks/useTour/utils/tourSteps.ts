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
 * Resolve step content - handles `text`, string content and function content
 *
 * `text` takes precedence and is HTML-escaped; `content` is passed through as the raw
 * HTML it is documented to be.
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

  if (step.content === undefined) {
    return '';
  }

  return typeof step.content === 'function'
    ? step.content(stepInfo as CurrentTourStep)
    : step.content;
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
