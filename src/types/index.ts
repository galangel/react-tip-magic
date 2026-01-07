/**
 * Tooltip placement options
 */
export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Helper state types
 */
export type HelperState =
  | 'idle'
  | 'thinking'
  | 'working'
  | 'informative'
  | 'cta'
  | 'success'
  | 'error'
  | 'warning';

/**
 * Helper position options
 */
export type HelperPosition =
  | 'auto'
  | 'near-target'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center';

/**
 * Configuration options for TipMagicProvider
 */
export interface TipMagicOptions {
  /** Delay before showing tooltip (ms) */
  showDelay?: number;
  /** Delay before hiding tooltip (ms) */
  hideDelay?: number;
  /** Duration of tooltip animation (ms) */
  animationDuration?: number;
  /** Default tooltip placement */
  placement?: Placement;
  /** Offset from target element (px) */
  offset?: number;
  /** Enable/disable helper system */
  enableHelper?: boolean;
  /** Default helper position */
  helperPosition?: HelperPosition;
  /** Custom theme */
  theme?: 'light' | 'dark' | 'auto';
  /** Z-index for tooltip layer */
  zIndex?: number;
  /** Disable all tooltips globally */
  disabled?: boolean;
  /** Portal container element */
  portalContainer?: HTMLElement;
  /** Separator for tooltip content parsing */
  contentSeparator?: string;
  /** Enable keyboard shortcut styling */
  enableShortcutStyle?: boolean;
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean;
}

/**
 * Tooltip API returned by useTipMagic hook
 */
export interface TooltipAPI {
  /** Show tooltip for a specific element */
  show: (target: Element | string, content?: string) => void;
  /** Hide the current tooltip */
  hide: () => void;
  /** Check if tooltip is visible */
  isVisible: boolean;
  /** Current tooltip content */
  content: string | null;
  /** Current target element */
  target: Element | null;
  /** Update tooltip content dynamically */
  updateContent: (content: string) => void;
}

/**
 * Helper action button
 */
export interface HelperAction {
  /** Button label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Icon (component or string) */
  icon?: React.ReactNode;
  /** Disable the action */
  disabled?: boolean;
}

/**
 * Options for showing the helper
 */
export interface HelperShowOptions {
  /** The state to display */
  state?: HelperState;
  /** Message to show */
  message?: string;
  /** Actions to display */
  actions?: HelperAction[];
  /** Target element ID to attach to */
  targetId?: string;
  /** Position override */
  position?: HelperPosition;
  /** Auto-hide after duration (ms) */
  autoHide?: number;
}

/**
 * Flow step action
 */
export interface FlowStepAction {
  /** Button label */
  label: string;
  /** Action type */
  action: 'next' | 'prev' | 'complete' | 'skip' | 'custom';
  /** Custom handler (for action: 'custom') */
  onClick?: () => void;
  /** Button variant */
  variant?: 'primary' | 'secondary';
}

/**
 * Flow step definition
 */
export interface FlowStep {
  /** Unique step identifier */
  id: string;
  /** Element's data-tip-id */
  targetId: string;
  /** Optional step title */
  title?: string;
  /** Main message content */
  message: string;
  /** Action buttons */
  actions: FlowStepAction[];
  /** Helper state for this step */
  state?: HelperState;
  /** Delay before showing (ms) */
  delay?: number;
  /** Highlight target element */
  highlight?: boolean;
  /** Scroll target into view */
  scrollIntoView?: boolean;
  /** Callback when step is shown */
  onEnter?: () => void;
  /** Callback when leaving step */
  onExit?: () => void;
  /** Conditional display */
  condition?: () => boolean;
}

/**
 * Helper API returned by useTipMagic hook
 */
export interface HelperAPI {
  /** Show the helper with options */
  show: (options: HelperShowOptions) => void;
  /** Hide the helper */
  hide: () => void;
  /** Set helper state */
  setState: (state: HelperState) => void;
  /** Move helper to a target */
  moveTo: (targetId: string) => void;
  /** Start an automated flow */
  startFlow: (steps: FlowStep[]) => void;
  /** Move to next flow step */
  nextStep: () => void;
  /** End current flow */
  endFlow: () => void;
  /** Current flow step index */
  currentStep: number;
  /** Check if helper is visible */
  isVisible: boolean;
  /** Current helper state */
  state: HelperState;
}

/**
 * Return value of useTipMagic hook
 */
export interface UseTipMagicReturn {
  tooltip: TooltipAPI;
  helper: HelperAPI;
  config: TipMagicOptions;
}
