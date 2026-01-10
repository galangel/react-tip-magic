import { useCallback, useMemo } from 'react';
import type { ParsedTooltipData } from '../context/TipMagicContext';
import { useTipMagicContext } from '../context/TipMagicContext';
import type {
  CurrentStepData,
  FlowStep,
  HelperAPI,
  HelperShowOptions,
  HelperState,
  TooltipAPI,
  TooltipShowOptions,
  UseTipMagicReturn,
} from '../types';
import { parseDataAttributes } from '../utils/parseDataAttributes';

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
 *
 * @example
 * ```tsx
 * // With options
 * tooltip.show('#my-element', {
 *   content: 'Tooltip with options',
 *   maxLines: 2,
 *   ellipsis: true,
 *   wordWrap: true,
 * });
 * ```
 */
export function useTipMagic(): UseTipMagicReturn {
  const { state, dispatch } = useTipMagicContext();

  // Tooltip API
  const tooltipShow = useCallback(
    (target: Element | string, contentOrOptions?: string | TooltipShowOptions) => {
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

      // Handle string content or options object
      let tooltipContent: string;
      let options: TooltipShowOptions = {};

      if (typeof contentOrOptions === 'string') {
        tooltipContent = contentOrOptions;
      } else if (contentOrOptions && typeof contentOrOptions === 'object') {
        options = contentOrOptions;
        tooltipContent = options.content ?? parsedData.content;
      } else {
        tooltipContent = parsedData.content;
      }

      if (!tooltipContent) {
        console.warn('TipMagic: No content provided for tooltip');
        return;
      }

      // Merge parsed data with options (options take precedence)
      const mergedData: ParsedTooltipData = {
        ...parsedData,
        content: tooltipContent,
        ...(options.placement !== undefined && { placement: options.placement }),
        ...(options.showDelay !== undefined && { delay: options.showDelay }),
        ...(options.hideDelay !== undefined && { hideDelay: options.hideDelay }),
        ...(options.ellipsis !== undefined && { ellipsis: options.ellipsis }),
        ...(options.maxLines !== undefined && { maxLines: options.maxLines }),
        ...(options.wordWrap !== undefined && { wordWrap: options.wordWrap }),
        ...(options.textBreak !== undefined && { textBreak: options.textBreak }),
        ...(options.maxWidth !== undefined && { maxWidth: options.maxWidth }),
        ...(options.html !== undefined && { html: options.html }),
        ...(options.interactive !== undefined && { interactive: options.interactive }),
        ...(options.transitionBehavior !== undefined && {
          transitionBehavior: options.transitionBehavior,
        }),
        ...(options.moveTransitionDuration !== undefined && {
          moveTransitionDuration: options.moveTransitionDuration,
        }),
        ...(options.showArrow !== undefined && { showArrow: options.showArrow }),
        ...(options.contentSeparator !== undefined && {
          contentSeparator: options.contentSeparator,
        }),
      };

      if (state.tooltip.visible) {
        // Check if we're updating the same target (content change, not position change)
        const isSameTarget = state.tooltip.target === element;

        if (isSameTarget) {
          // Same target - just update content without move transition
          dispatch({
            type: 'SHOW_TOOLTIP',
            payload: {
              target: element,
              content: tooltipContent,
              parsedData: mergedData,
            },
          });
        } else {
          // Different target - use move transition
          dispatch({
            type: 'MOVE_TOOLTIP',
            payload: {
              target: element,
              content: tooltipContent,
              parsedData: mergedData,
            },
          });
        }
      } else {
        dispatch({
          type: 'SHOW_TOOLTIP',
          payload: {
            target: element,
            content: tooltipContent,
            parsedData: mergedData,
          },
        });
      }
    },
    [state.tooltip.visible, state.tooltip.target, dispatch]
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

  // Compute current step data
  const currentStepData: CurrentStepData | null = useMemo(() => {
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

  const helper: HelperAPI = useMemo(
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

  return {
    tooltip,
    helper,
    config: state.config,
  };
}
