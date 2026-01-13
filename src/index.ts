/**
 * React Tip Magic
 * A sophisticated, elegant, and performant tooltip library for React
 */

// Components
export { TipMagicProvider } from './components/TipMagicProvider';
export type { TipMagicProviderProps } from './components/TipMagicProvider';

// Hooks
export { useTipMagic } from './hooks/useTipMagic';
export { useTour } from './hooks/useTour';

// Context (for advanced usage)
export { TipMagicContext, useTipMagicContext } from './context/TipMagicContext';
export type { TipMagicAction, TipMagicContextValue } from './context/TipMagicContext';

// Types
export type {
  CurrentStepData,
  CurrentTourStep,
  FlowState,
  FlowStep,
  HelperAction,
  HelperAPI,
  HelperInternalState,
  HelperPosition,
  HelperShowOptions,
  HelperState,
  ParsedTooltipData,
  Placement,
  TextBreak,
  TipMagicOptions,
  TipMagicState,
  TooltipAPI,
  TooltipShowOptions,
  TooltipState,
  TooltipTransitionBehavior,
  TourDirection,
  TourNavigation,
  TourOptions,
  TourProgress,
  TourStep,
  UseTipMagicReturn,
  UseTourReturn,
} from './types';

// Constants (for customization)
export { ANIMATION, CSS_CLASSES, DEFAULT_OPTIONS } from './constants';

// Utilities
export { getTipProps } from './utils/getTipProps';
export type { TipPropsOptions, TipPropsResult } from './utils/getTipProps';
export { generateTooltipId, parseContent, parseDataAttributes } from './utils/parseDataAttributes';
export type { ParsedContent } from './utils/parseDataAttributes';

// Version
export const VERSION = '1.0.1';
