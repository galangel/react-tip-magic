import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { DEFAULT_OPTIONS } from '../constants';
import type {
  FlowStep,
  HelperAction,
  HelperPosition,
  HelperState,
  Placement,
  TextBreak,
  TipMagicOptions,
  TooltipTransitionBehavior,
} from '../types';

/**
 * Parsed tooltip data from element attributes
 */
export interface ParsedTooltipData {
  content: string;
  id?: string;
  placement: Placement;
  delay: number;
  /** Per-element hide delay override (undefined = use provider default) */
  hideDelay?: number;
  disabled: boolean;
  ellipsis: boolean;
  maxLines: number;
  wordWrap: boolean;
  /** Text break behavior - controls where words can break */
  textBreak: TextBreak;
  maxWidth: number;
  html: boolean;
  interactive: boolean;
  /** Override transition behavior for this specific tooltip */
  transitionBehavior?: TooltipTransitionBehavior;
  /** Override move transition duration for this specific tooltip (ms) */
  moveTransitionDuration?: number;
  /** Show or hide the arrow (default: true) */
  showArrow: boolean;
}

/**
 * Tooltip state
 */
export interface TooltipState {
  visible: boolean;
  content: string;
  target: Element | null;
  position: { x: number; y: number };
  placement: Placement;
  isTransitioning: boolean;
  parsedData: ParsedTooltipData | null;
}

/**
 * Helper internal state
 */
export interface HelperInternalState {
  visible: boolean;
  state: HelperState;
  message?: string;
  actions?: HelperAction[];
  targetId?: string;
  position: HelperPosition;
  autoHide?: number;
}

/**
 * Flow state
 */
export interface FlowState {
  active: boolean;
  steps: FlowStep[];
  currentIndex: number;
}

/**
 * Complete state for TipMagic
 */
export interface TipMagicState {
  tooltip: TooltipState;
  helper: HelperInternalState;
  flow: FlowState;
  config: Required<TipMagicOptions>;
}

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
          target: action.payload.target,
          content: action.payload.content,
          parsedData: action.payload.parsedData,
          isTransitioning: true,
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
