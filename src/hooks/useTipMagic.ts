import { useCallback, useMemo } from 'react';
import { useTipMagicContext } from '../context/TipMagicContext';
import { parseDataAttributes } from '../utils/parseDataAttributes';
import type {
  UseTipMagicReturn,
  TooltipAPI,
  HelperAPI,
  HelperShowOptions,
  HelperState,
  FlowStep,
} from '../types';

/**
 * Main hook to interact with TipMagic programmatically
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { tooltip, helper } = useTipMagic();
 *
 *   const handleClick = () => {
 *     tooltip.show('#my-element', 'Custom tooltip content');
 *   };
 *
 *   return <button onClick={handleClick}>Show Tooltip</button>;
 * }
 * ```
 */
export function useTipMagic(): UseTipMagicReturn {
  const { state, dispatch } = useTipMagicContext();

  // Tooltip API
  const tooltipShow = useCallback(
    (target: Element | string, content?: string) => {
      // Resolve target element
      let element: Element | null = null;

      if (typeof target === 'string') {
        element = document.querySelector(target);
      } else {
        element = target;
      }

      if (!element) {
        console.warn(`TipMagic: Could not find target element: ${target}`);
        return;
      }

      const parsedData = parseDataAttributes(element);
      const tooltipContent = content ?? parsedData.content;

      if (!tooltipContent) {
        console.warn('TipMagic: No content provided for tooltip');
        return;
      }

      if (state.tooltip.visible) {
        dispatch({
          type: 'MOVE_TOOLTIP',
          payload: {
            target: element,
            content: tooltipContent,
            parsedData: { ...parsedData, content: tooltipContent },
          },
        });
      } else {
        dispatch({
          type: 'SHOW_TOOLTIP',
          payload: {
            target: element,
            content: tooltipContent,
            parsedData: { ...parsedData, content: tooltipContent },
          },
        });
      }
    },
    [state.tooltip.visible, dispatch]
  );

  const tooltipHide = useCallback(() => {
    dispatch({ type: 'HIDE_TOOLTIP' });
  }, [dispatch]);

  const tooltipUpdateContent = useCallback(
    (content: string) => {
      dispatch({ type: 'UPDATE_TOOLTIP_CONTENT', payload: content });
    },
    [dispatch]
  );

  const tooltip: TooltipAPI = useMemo(
    () => ({
      show: tooltipShow,
      hide: tooltipHide,
      isVisible: state.tooltip.visible,
      content: state.tooltip.content || null,
      target: state.tooltip.target,
      updateContent: tooltipUpdateContent,
    }),
    [
      tooltipShow,
      tooltipHide,
      tooltipUpdateContent,
      state.tooltip.visible,
      state.tooltip.content,
      state.tooltip.target,
    ]
  );

  // Helper API
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

  const helperHide = useCallback(() => {
    dispatch({ type: 'HIDE_HELPER' });
  }, [dispatch]);

  const helperSetState = useCallback(
    (helperState: HelperState) => {
      dispatch({ type: 'SET_HELPER_STATE', payload: helperState });
    },
    [dispatch]
  );

  const helperMoveTo = useCallback(
    (targetId: string) => {
      dispatch({ type: 'MOVE_HELPER', payload: targetId });
    },
    [dispatch]
  );

  const helperStartFlow = useCallback(
    (steps: FlowStep[]) => {
      dispatch({ type: 'START_FLOW', payload: steps });
    },
    [dispatch]
  );

  const helperNextStep = useCallback(() => {
    dispatch({ type: 'NEXT_FLOW_STEP' });
  }, [dispatch]);

  const helperEndFlow = useCallback(() => {
    dispatch({ type: 'END_FLOW' });
  }, [dispatch]);

  const helper: HelperAPI = useMemo(
    () => ({
      show: helperShow,
      hide: helperHide,
      setState: helperSetState,
      moveTo: helperMoveTo,
      startFlow: helperStartFlow,
      nextStep: helperNextStep,
      endFlow: helperEndFlow,
      currentStep: state.flow.currentIndex,
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
      state.flow.currentIndex,
      state.helper.visible,
      state.helper.state,
    ]
  );

  return {
    tooltip,
    helper,
    config: state.config,
  };
}
