/**
 * React Tip Magic
 * A sophisticated, elegant, and performant tooltip library for React
 */

// Components
export { TipMagicProvider } from './components/TipMagicProvider';
export type { TipMagicProviderProps } from './components/TipMagicProvider';

// Hooks
export { useTipMagic } from './hooks/useTipMagic';

// Context (for advanced usage)
export { TipMagicContext, useTipMagicContext } from './context/TipMagicContext';
export type {
  ParsedTooltipData,
  TipMagicAction,
  TipMagicContextValue,
  TipMagicState,
  TooltipState,
} from './context/TipMagicContext';

// Types
export type {
  FlowStep,
  FlowStepAction,
  HelperAPI,
  HelperAction,
  HelperPosition,
  HelperShowOptions,
  HelperState,
  Placement,
  TextBreak,
  TipMagicOptions,
  TooltipAPI,
  TooltipShowOptions,
  TooltipTransitionBehavior,
  UseTipMagicReturn,
} from './types';

// Constants (for customization)
export { ANIMATION, CSS_CLASSES, DEFAULT_OPTIONS } from './constants';

// Utilities
export { getTipProps } from './utils/getTipProps';
export type { TipPropsOptions, TipPropsResult } from './utils/getTipProps';
export { generateTooltipId, parseContent, parseDataAttributes } from './utils/parseDataAttributes';
export type { ParsedContent } from './utils/parseDataAttributes';

// Version
export const VERSION = '0.0.1';
