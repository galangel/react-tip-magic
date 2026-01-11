import { useCallback, useMemo } from 'react';
import type { TipMagicAction } from '../context/TipMagicContext';
import type { ParsedTooltipData, TipMagicState, TooltipAPI, TooltipShowOptions } from '../types';
import { parseDataAttributes } from '../utils/parseDataAttributes';

/**
 * Hook that provides the Tooltip API for programmatic tooltip control
 *
 * @internal This hook is used internally by useTipMagic
 */
export function useTooltipAPI(
  state: TipMagicState,
  dispatch: React.Dispatch<TipMagicAction>
): TooltipAPI {
  // Show tooltip for a target element
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

  // Hide the tooltip
  const tooltipHide = useCallback(() => {
    dispatch({ type: 'HIDE_TOOLTIP' });
  }, [dispatch]);

  // Update tooltip content dynamically
  const tooltipUpdateContent = useCallback(
    (content: string) => {
      dispatch({ type: 'UPDATE_TOOLTIP_CONTENT', payload: content });
    },
    [dispatch]
  );

  // Memoize the API object
  return useMemo(
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
}
