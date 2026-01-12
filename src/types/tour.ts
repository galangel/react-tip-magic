import type { Placement, TooltipShowOptions } from './index';

// =============================================================================
// Tour Types - Simplified API for guided tours
// =============================================================================

/**
 * Navigation direction for step changes
 */
export type TourDirection = 'next' | 'prev' | 'jump';

/**
 * Navigation configuration for tours
 *
 * Controls the built-in navigation UI (buttons inside the tooltip).
 * Can be set at tour level or overridden per step.
 *
 * @example
 * ```tsx
 * const navigation: TourNavigation = {
 *   showControls: true,
 *   nextLabel: 'Continue',
 *   backLabel: 'Go Back',
 *   finishLabel: 'Done!',
 *   showClose: true,
 * };
 * ```
 */
export interface TourNavigation {
  /** Whether to show navigation controls inside the tooltip (default: false) */
  showControls?: boolean;
  /** Label for the next button (default: 'Next') */
  nextLabel?: string;
  /** Label for the back button (default: 'Back') */
  backLabel?: string;
  /** Label for the finish button on the last step (default: 'Finish') */
  finishLabel?: string;
  /** Whether to show the close button (default: true when showControls is true) */
  showClose?: boolean;
}

/**
 * Current tour step with computed navigation metadata
 */
export interface CurrentTourStep {
  /** 0-based index of the current step */
  index: number;
  /** Target element's data-tip-id value */
  target: string;
  /** Optional step title */
  title?: string;
  /** Resolved content (if function was provided, it has been called) */
  content: string;
  /** Whether this is the first step */
  isFirst: boolean;
  /** Whether this is the last step */
  isLast: boolean;
  /** Total number of visible steps */
  total: number;
}

/**
 * Tour step definition
 *
 * @example
 * ```tsx
 * const step: TourStep = {
 *   target: 'sidebar',
 *   content: 'Navigate from here',
 *   title: 'Navigation',
 *   placement: 'right',
 *   onEnter: () => analytics.track('tour_step_1'),
 * };
 * ```
 */
export interface TourStep {
  /** Target element's data-tip-id value */
  target: string;
  /** Tooltip content - can be a string or a function that receives current step info */
  content: string | ((step: CurrentTourStep) => string);
  /** Optional step title (will be prepended to content with bold styling if html is enabled) */
  title?: string;
  /** Tooltip placement for this step */
  placement?: Placement;
  /** Step-specific tooltip options (merged with tour-level options) */
  tooltipOptions?: Omit<TooltipShowOptions, 'content' | 'placement'>;
  /** Condition function - step is skipped if this returns false */
  condition?: () => boolean;
  /** Callback when entering this step */
  onEnter?: () => void;
  /** Callback when exiting this step */
  onExit?: () => void;
  /** Image URL to display above content (Pokemon card style) - supports GIFs */
  image?: string;
  /** Video to display above content */
  video?: {
    /** Video source URL (mp4, webm) or embed URL (YouTube, Vimeo) */
    src: string;
    /** Type of video: 'native' for mp4/webm, 'embed' for iframe embeds */
    type?: 'native' | 'embed';
    /** Whether to autoplay (native video only, default: true) */
    autoplay?: boolean;
    /** Whether to loop (native video only, default: true) */
    loop?: boolean;
    /** Whether to mute (native video only, default: true) */
    muted?: boolean;
  };
  /** Override tour-level navigation config for this step */
  navigation?: Partial<TourNavigation>;
  /** Override tour-level focus setting for this step */
  focus?: boolean;
  /** Override tour-level progress options for this step */
  progress?: Partial<ProgressOptions>;
}

/**
 * Tour progress information
 */
export interface TourProgress {
  /** Current step number (1-based for display) */
  current: number;
  /** Total number of visible steps */
  total: number;
}

/**
 * Progress indicator render props
 */
export interface ProgressRenderProps {
  /** Current step number (1-based) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
}

/**
 * Progress indicator type
 */
export type ProgressType = 'steps' | 'ring';

/**
 * Progress indicator options
 *
 * @example
 * ```tsx
 * // Simple text progress
 * progress: { show: true, type: 'steps' }
 *
 * // Ring/circular progress
 * progress: { show: true, type: 'ring' }
 *
 * // Custom render
 * progress: {
 *   show: true,
 *   render: ({ currentStep, totalSteps }) => `${currentStep}/${totalSteps}`
 * }
 * ```
 *
 * @note When using a custom render function, avoid semicolons (`;`) in inline styles
 * as they conflict with the tooltip content parsing. Use CSS classes instead.
 */
export interface ProgressOptions {
  /** Whether to show progress indicator (default: false) */
  show?: boolean;
  /** Type of progress indicator: 'steps' (text) or 'ring' (circular) */
  type?: ProgressType;
  /** Custom render function - returns HTML string for the progress indicator */
  render?: (props: ProgressRenderProps) => string;
}

/**
 * Options for useTour hook
 *
 * @example
 * ```tsx
 * const options: TourOptions = {
 *   steps: [
 *     { target: 'sidebar', content: 'Navigate from here' },
 *     { target: 'search', content: 'Search for items' },
 *   ],
 *   onStart: () => console.log('Tour started'),
 *   onEnd: (completed) => console.log(completed ? 'Finished!' : 'Skipped'),
 *   tooltipOptions: { placement: 'bottom', interactive: true },
 * };
 * ```
 */
export interface TourOptions {
  /** Array of tour steps (required) */
  steps: TourStep[];
  /** Callback when tour starts */
  onStart?: () => void;
  /** Callback when tour ends (completed = true if finished all steps, false if exited early) */
  onEnd?: (completed: boolean) => void;
  /** Callback when step changes */
  onStepChange?: (step: CurrentTourStep, direction: TourDirection) => void;
  /** Default tooltip options applied to all steps (can be overridden per step) */
  tooltipOptions?: TooltipShowOptions;
  /** Whether to scroll target elements into view (default: true) */
  autoScroll?: boolean;
  /** CSS class to add to current target element for highlighting */
  highlightClass?: string;
  /** Navigation configuration for built-in controls */
  navigation?: TourNavigation;
  /** Whether to show a backdrop blur effect highlighting the target (default: false) */
  focus?: boolean;
  /** Progress indicator options */
  progress?: ProgressOptions;
}

/**
 * Return value of useTour hook
 *
 * @example
 * ```tsx
 * const tour = useTour({ steps: [...] });
 *
 * // Start the tour
 * tour.start();
 *
 * // Navigate
 * tour.next();
 * tour.prev();
 * tour.goTo(2);
 *
 * // End the tour
 * tour.end();
 *
 * // Check state
 * if (tour.isActive) {
 *   console.log(`Step ${tour.currentStep.index + 1} of ${tour.totalSteps}`);
 * }
 * ```
 */
export interface UseTourReturn {
  /** Start the tour from the first step */
  start: () => void;
  /** End the tour (marks as incomplete) */
  end: () => void;
  /** Go to next step (if on last step, ends tour as complete) */
  next: () => void;
  /** Go to previous step (no-op if on first step) */
  prev: () => void;
  /** Jump to a specific step by index (0-based) */
  goTo: (index: number) => void;
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Current step data with navigation metadata, null if tour is not active */
  currentStep: CurrentTourStep | null;
  /** Total number of visible steps (excluding conditional steps that returned false) */
  totalSteps: number;
  /** Progress info for display (1-based current, total) */
  progress: TourProgress;
}
