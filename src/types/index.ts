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
 * Tooltip transition behavior when moving between targets
 * - 'move': Smoothly animate position from one target to another
 * - 'jump': Instantly appear at new position (fade out/in)
 */
export type TooltipTransitionBehavior = 'move' | 'jump';

/**
 * Text break behavior for tooltips
 * - 'normal': Break at normal word boundaries (default)
 * - 'break-all': Can break in the middle of words (useful for long URLs, codes)
 * - 'keep-all': Don't break CJK characters (useful for Asian languages)
 */
export type TextBreak = 'normal' | 'break-all' | 'keep-all';

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
  /** Default transition behavior when moving between targets */
  transitionBehavior?: TooltipTransitionBehavior;
  /** Duration of move transition (ms) */
  moveTransitionDuration?: number;
  /**
   * CSS class name to automatically apply to the target element during a tour.
   * When a flow is active, this class is added to the current step's target element
   * and removed when moving to the next step or ending the flow.
   * @example 'tour-highlight'
   */
  tourHighlightClass?: string;
  /**
   * Whether to show tooltips when elements receive keyboard focus.
   * When true, pressing Tab to focus an element will show its tooltip.
   * @default false
   */
  showOnFocus?: boolean;
}

/**
 * Options for programmatically showing a tooltip
 */
export interface TooltipShowOptions {
  /** Tooltip content (overrides element's data-tip) */
  content?: string;
  /** Tooltip placement */
  placement?: Placement;
  /** Show delay (ms) */
  showDelay?: number;
  /** Hide delay (ms) */
  hideDelay?: number;
  /** Enable ellipsis truncation */
  ellipsis?: boolean;
  /** Maximum lines before truncation */
  maxLines?: number;
  /** Enable word wrapping */
  wordWrap?: boolean;
  /** Text break behavior */
  textBreak?: TextBreak;
  /** Maximum width in pixels */
  maxWidth?: number;
  /** Parse content as HTML */
  html?: boolean;
  /** Keep tooltip visible when hovering */
  interactive?: boolean;
  /** Transition behavior */
  transitionBehavior?: TooltipTransitionBehavior;
  /** Move transition duration (ms) */
  moveTransitionDuration?: number;
  /** Show/hide arrow */
  showArrow?: boolean;
  /** Content separator for keyboard shortcuts */
  contentSeparator?: string;
}

/**
 * Tooltip API returned by useTipMagic hook
 */
export interface TooltipAPI {
  /** Show tooltip for a specific element with optional content and options */
  show: (target: Element | string, contentOrOptions?: string | TooltipShowOptions) => void;
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
  /** Tooltip display options for this step */
  tooltipOptions?: Omit<TooltipShowOptions, 'content'>;
}

/**
 * Current step data with index
 */
export interface CurrentStepData extends FlowStep {
  /** The index of the current step (0-based) */
  index: number;
  /** Total number of steps in the flow */
  total: number;
  /** Whether this is the first step */
  isFirst: boolean;
  /** Whether this is the last step */
  isLast: boolean;
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
  /** Current step data including index, targetId, message, etc. Null if no flow is active. */
  currentStep: CurrentStepData | null;
  /** Current step index (0-based). -1 if no flow is active. */
  currentStepIndex: number;
  /** All steps in the current flow. Empty array if no flow is active. */
  steps: FlowStep[];
  /** Whether a flow is currently active */
  isFlowActive: boolean;
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
