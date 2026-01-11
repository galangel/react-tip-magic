import { useMemo } from 'react';
import type { CurrentStepData, TipMagicState } from '../types';

/**
 * Hook that computes the current flow step data
 *
 * This hook derives the current step information including:
 * - The step itself (id, targetId, message, etc.)
 * - Navigation metadata (index, total, isFirst, isLast)
 *
 * @internal This hook is used internally by useHelperAPI
 */
export function useFlowState(state: TipMagicState): CurrentStepData | null {
  return useMemo(() => {
    if (!state.flow.active || state.flow.currentIndex < 0) {
      return null;
    }

    const step = state.flow.steps[state.flow.currentIndex];
    if (!step) {
      return null;
    }

    return {
      ...step,
      index: state.flow.currentIndex,
      total: state.flow.steps.length,
      isFirst: state.flow.currentIndex === 0,
      isLast: state.flow.currentIndex === state.flow.steps.length - 1,
    };
  }, [state.flow.active, state.flow.currentIndex, state.flow.steps]);
}
