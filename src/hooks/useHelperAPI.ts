import { useCallback, useMemo } from 'react';
import type { TipMagicAction } from '../context/TipMagicContext';
import type {
  CurrentStepData,
  FlowStep,
  HelperAPI,
  HelperShowOptions,
  HelperState,
  TipMagicState,
} from '../types';
import { useFlowState } from './useFlowState';

/**
 * Hook that provides the Helper API for programmatic helper/flow control
 *
 * @internal This hook is used internally by useTipMagic
 */
export function useHelperAPI(
  state: TipMagicState,
  dispatch: React.Dispatch<TipMagicAction>
): HelperAPI {
  // Show the helper with options
  const helperShow = useCallback(
    (options: HelperShowOptions) => {
      dispatch({
        type: 'SHOW_HELPER',
        payload: {
          state: options.state ?? 'informative',
          message: options.message,
          actions: options.actions,
          targetId: options.targetId,
          position: options.position ?? state.config.helperPosition,
          autoHide: options.autoHide,
        },
      });
    },
    [dispatch, state.config.helperPosition]
  );

  // Hide the helper
  const helperHide = useCallback(() => {
    dispatch({ type: 'HIDE_HELPER' });
  }, [dispatch]);

  // Set helper state
  const helperSetState = useCallback(
    (helperState: HelperState) => {
      dispatch({ type: 'SET_HELPER_STATE', payload: helperState });
    },
    [dispatch]
  );

  // Move helper to a target
  const helperMoveTo = useCallback(
    (targetId: string) => {
      dispatch({ type: 'MOVE_HELPER', payload: targetId });
    },
    [dispatch]
  );

  // Start an automated flow
  const helperStartFlow = useCallback(
    (steps: FlowStep[]) => {
      dispatch({ type: 'START_FLOW', payload: steps });
    },
    [dispatch]
  );

  // Move to next flow step
  const helperNextStep = useCallback(() => {
    dispatch({ type: 'NEXT_FLOW_STEP' });
  }, [dispatch]);

  // End current flow
  const helperEndFlow = useCallback(() => {
    dispatch({ type: 'END_FLOW' });
  }, [dispatch]);

  // Get computed flow state
  const currentStepData: CurrentStepData | null = useFlowState(state);

  // Memoize the API object
  return useMemo(
    () => ({
      show: helperShow,
      hide: helperHide,
      setState: helperSetState,
      moveTo: helperMoveTo,
      startFlow: helperStartFlow,
      nextStep: helperNextStep,
      endFlow: helperEndFlow,
      currentStep: currentStepData,
      currentStepIndex: state.flow.currentIndex,
      steps: state.flow.steps,
      isFlowActive: state.flow.active,
      isVisible: state.helper.visible,
      state: state.helper.state,
    }),
    [
      helperShow,
      helperHide,
      helperSetState,
      helperMoveTo,
      helperStartFlow,
      helperNextStep,
      helperEndFlow,
      currentStepData,
      state.flow.currentIndex,
      state.flow.steps,
      state.flow.active,
      state.helper.visible,
      state.helper.state,
    ]
  );
}
