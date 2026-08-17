import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { DEFAULT_OPTIONS } from '../constants';
import type {
  FlowState,
  FlowStep,
  HelperInternalState,
  HelperState,
  ParsedTooltipData,
  Placement,
  TipMagicOptions,
  TipMagicState,
  TooltipState,
} from '../types';

// Re-export types for backwards compatibility
export type {
  FlowState,
  HelperInternalState,
  ParsedTooltipData,
  TipMagicState,
  TooltipState,
} from '../types';

/**
 * Initial tooltip state
 */
const initialTooltipState: TooltipState = {
  visible: false,
  content: '',
  target: null,
  position: { x: 0, y: 0 },
  placement: 'top',
  isTransitioning: false,
  parsedData: null,
  previousGroup: undefined,
};

/**
 * Initial helper state
 */
const initialHelperState: HelperInternalState = {
  visible: false,
  state: 'idle',
  message: undefined,
  actions: undefined,
  targetId: undefined,
  position: 'bottom-right',
  autoHide: undefined,
};

/**
 * Initial flow state
 */
const initialFlowState: FlowState = {
  active: false,
  steps: [],
  currentIndex: -1,
};

/**
 * Create initial state with options
 */
export function createInitialState(options: TipMagicOptions = {}): TipMagicState {
  return {
    tooltip: initialTooltipState,
    helper: {
      ...initialHelperState,
      position: options.helperPosition ?? DEFAULT_OPTIONS.helperPosition,
    },
    flow: initialFlowState,
    config: {
      ...DEFAULT_OPTIONS,
      ...options,
      portalContainer: options.portalContainer ?? DEFAULT_OPTIONS.portalContainer,
    },
  };
}

/**
 * Action types for the reducer
 */
export type TipMagicAction =
  | {
      type: 'SHOW_TOOLTIP';
      payload: {
        target: Element;
        content: string;
        parsedData: ParsedTooltipData;
      };
    }
  | { type: 'HIDE_TOOLTIP' }
  | {
      type: 'MOVE_TOOLTIP';
      payload: {
        target: Element;
        content: string;
        parsedData: ParsedTooltipData;
        previousGroup?: string;
      };
    }
  | {
      type: 'UPDATE_TOOLTIP_POSITION';
      payload: { x: number; y: number; placement: Placement };
    }
  | { type: 'UPDATE_TOOLTIP_CONTENT'; payload: string }
  | { type: 'SET_TOOLTIP_TRANSITIONING'; payload: boolean }
  | { type: 'SHOW_HELPER'; payload: Partial<HelperInternalState> }
  | { type: 'HIDE_HELPER' }
  | { type: 'SET_HELPER_STATE'; payload: HelperState }
  | { type: 'MOVE_HELPER'; payload: string }
  | { type: 'START_FLOW'; payload: FlowStep[] }
  | { type: 'NEXT_FLOW_STEP' }
  | { type: 'PREV_FLOW_STEP' }
  | { type: 'SET_FLOW_STEP'; payload: number }
  | { type: 'END_FLOW' };

/**
 * Reducer for TipMagic state
 */
export function tipMagicReducer(state: TipMagicState, action: TipMagicAction): TipMagicState {
  switch (action.type) {
    case 'SHOW_TOOLTIP':
      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          visible: true,
          target: action.payload.target,
          content: action.payload.content,
          parsedData: action.payload.parsedData,
          isTransitioning: false,
        },
      };

    case 'HIDE_TOOLTIP':
      return {
        ...state,
        tooltip: {
          ...initialTooltipState,
        },
      };

    case 'MOVE_TOOLTIP':
      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          visible: true, // Ensure visibility when moving (in case tooltip was hidden)
          target: action.payload.target,
          content: action.payload.content,
          parsedData: action.payload.parsedData,
          isTransitioning: true,
          previousGroup: action.payload.previousGroup,
        },
      };

    case 'UPDATE_TOOLTIP_POSITION':
      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          position: { x: action.payload.x, y: action.payload.y },
          placement: action.payload.placement,
        },
      };

    case 'UPDATE_TOOLTIP_CONTENT':
      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          content: action.payload,
        },
      };

    case 'SET_TOOLTIP_TRANSITIONING':
      return {
        ...state,
        tooltip: {
          ...state.tooltip,
          isTransitioning: action.payload,
        },
      };

    case 'SHOW_HELPER':
      return {
        ...state,
        helper: {
          ...state.helper,
          ...action.payload,
          visible: true,
        },
      };

    case 'HIDE_HELPER':
      return {
        ...state,
        helper: {
          ...initialHelperState,
          position: state.config.helperPosition,
        },
      };

    case 'SET_HELPER_STATE':
      return {
        ...state,
        helper: {
          ...state.helper,
          state: action.payload,
        },
      };

    case 'MOVE_HELPER':
      return {
        ...state,
        helper: {
          ...state.helper,
          targetId: action.payload,
        },
      };

    case 'START_FLOW':
      return {
        ...state,
        flow: {
          active: true,
          steps: action.payload,
          currentIndex: 0,
        },
      };

    case 'NEXT_FLOW_STEP':
      return {
        ...state,
        flow: {
          ...state.flow,
          currentIndex: Math.min(state.flow.currentIndex + 1, state.flow.steps.length - 1),
        },
      };

    case 'PREV_FLOW_STEP':
      return {
        ...state,
        flow: {
          ...state.flow,
          currentIndex: Math.max(state.flow.currentIndex - 1, 0),
        },
      };

    case 'SET_FLOW_STEP':
      return {
        ...state,
        flow: {
          ...state.flow,
          currentIndex: Math.min(
            Math.max(action.payload, 0),
            Math.max(state.flow.steps.length - 1, 0)
          ),
        },
      };

    case 'END_FLOW':
      return {
        ...state,
        flow: initialFlowState,
      };

    default:
      return state;
  }
}

/**
 * Context value interface
 */
export interface TipMagicContextValue {
  state: TipMagicState;
  dispatch: React.Dispatch<TipMagicAction>;
}

/**
 * Create the context
 */
export const TipMagicContext = createContext<TipMagicContextValue | null>(null);

/**
 * Hook to access TipMagic context
 */
export function useTipMagicContext(): TipMagicContextValue {
  const context = useContext(TipMagicContext);
  if (!context) {
    throw new Error('useTipMagicContext must be used within a TipMagicProvider');
  }
  return context;
}

/**
 * Provider props
 */
export interface TipMagicContextProviderProps {
  children: ReactNode;
  options?: TipMagicOptions;
}

/**
 * Context provider component
 */
export function TipMagicContextProvider({ children, options }: TipMagicContextProviderProps) {
  const [state, dispatch] = useReducer(tipMagicReducer, options, createInitialState);

  return (
    <TipMagicContext.Provider value={{ state, dispatch }}>{children}</TipMagicContext.Provider>
  );
}
