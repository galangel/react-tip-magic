import { useTipMagicContext } from '../context/TipMagicContext';
import type { UseTipMagicReturn } from '../types';
import { useHelperAPI } from './useHelperAPI';
import { useTooltipAPI } from './useTooltipAPI';

/**
 * Main hook to interact with TipMagic programmatically
 *
 * Provides access to both the Tooltip and Helper APIs for controlling
 * tooltips and guided tours/flows.
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
 *
 * @example
 * ```tsx
 * // Start a guided tour
 * helper.startFlow([
 *   { id: 'step-1', targetId: 'nav', message: 'Navigate here' },
 *   { id: 'step-2', targetId: 'search', message: 'Search for items' },
 * ]);
 * ```
 */
export function useTipMagic(): UseTipMagicReturn {
  const { state, dispatch } = useTipMagicContext();

  // Use composed hooks for tooltip and helper APIs
  const tooltip = useTooltipAPI(state, dispatch);
  const helper = useHelperAPI(state, dispatch);

  return {
    tooltip,
    helper,
    config: state.config,
  };
}
