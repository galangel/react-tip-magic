import type { Placement, TooltipAutoFocus, TooltipShowOptions } from './index';

// =============================================================================
// Tour Types - Simplified API for guided tours
// =============================================================================

/**
 * Navigation direction for step changes
 */
export type TourDirection = 'next' | 'prev' | 'jump';

/**
 * How the tour should recover when a step's target element cannot be found
 *
 * - `'skip'`: move past the step and continue with the next resolvable one
 * - `'end'`: end the tour (the default when no handler is provided)
 */
export type TourTargetMissingAction = 'skip' | 'end';

/**
 * Backdrop behaviour when focus mode is enabled
 *
 * By default the backdrop is purely visual - it does not capture pointer events, so
 * the app behind it stays fully interactive and the user can navigate away from (or
 * unmount) the highlighted element mid-tour.
 *
 * @example
 * ```tsx
 * // Dim the app and stop clicks from reaching it
 * focus: { block: true }
 *
 * // Dim the app and let a click on the backdrop end the tour
 * focus: { dismissOnClick: true }
 * ```
 */
export interface TourFocusOptions {
  /** Whether the backdrop should swallow clicks aimed at the app behind it (default: false) */
  block?: boolean;
  /** Whether clicking the backdrop ends the tour (default: false). Implies `block`. */
  dismissOnClick?: boolean;
}

/**
 * Focus/backdrop configuration
 *
 * `true` is shorthand for a purely visual backdrop; pass an object to control
 * pointer interaction.
 */
export type TourFocus = boolean | TourFocusOptions;

/**
 * Where keyboard focus lands when a tour step opens
 *
 * - `'panel'`: the tour panel itself (the default)
 * - `'primary'`: the step's main action - Next, or Finish on the last step
 * - `false`: leave focus wherever it is
 */
export type TourAutoFocus = TooltipAutoFocus;

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
  /**
   * Where keyboard focus lands when the step opens (default: `'panel'`).
   *
   * `'primary'` puts focus on the step's main action so Enter advances the tour, and
   * falls back to the panel when the step renders no primary action - with
   * `showControls` off, for instance. It never falls back to the close button.
   *
   * `false` is an escape hatch: focus stays behind the panel, so a screen reader is not
   * told the dialog opened. Prefer `'panel'` unless you are moving focus yourself.
   *
   * Only applies to steps that render as a dialog. A step with no navigation features,
   * media or progress is a plain tooltip and never moves focus, whatever this is set to.
   *
   * @example
   * ```tsx
   * // Read-and-advance tour: Enter goes to the next step
   * navigation: { showControls: true, autoFocus: 'primary' }
   * ```
   */
  autoFocus?: TourAutoFocus;
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
  /**
   * Resolved content, exactly as rendered. If the step used `text`, this is the
   * HTML-escaped form of that string.
   */
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
export interface TourStepBase {
  /** Target element's data-tip-id value */
  target: string;
  /** Optional step title (escaped by the library) */
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
  focus?: TourFocus;
  /** Override tour-level progress options for this step */
  progress?: Partial<ProgressOptions>;
}

/**
 * The body of a step: raw HTML via `content`, or plain text via `text`.
 *
 * Exactly one is required. Expressing it as a union rather than two optionals means a
 * step with neither does not compile, and a step with both does not either - so there is
 * no precedence rule to remember.
 */
export type TourStepContent =
  | {
      /**
       * Tooltip content - a string or a function that receives current step info.
       *
       * @remarks
       * **This value is injected as HTML.** Steps are rendered with
       * `dangerouslySetInnerHTML` so that titles, media and navigation controls work,
       * which means any interpolated value - a user-supplied name, an account label -
       * must be escaped by the caller. The exported `escapeHtml` helper is there for
       * interpolating into markup; prefer `text` when the whole body is plain text.
       */
      content: string | ((step: CurrentTourStep) => string);
      text?: never;
    }
  | {
      /**
       * Plain-text body, escaped by the library before it is rendered.
       *
       * @example
       * ```tsx
       * { target: 'profile', text: `Signed in as ${user.name}` }
       * ```
       */
      text: string;
      content?: never;
    };

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
export type TourStep = TourStepBase & TourStepContent;

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
 * @remarks
 * A custom `render` function returns raw HTML that is injected as-is. Escape any
 * interpolated value.
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
  /**
   * Callback when a step's target element cannot be found in the DOM.
   *
   * Fires instead of the library's `console.warn`, so hosts that route through their
   * own logger can handle it. Return `'skip'` to continue with the next resolvable
   * step; anything else (including no return value) ends the tour, or prevents it from
   * starting when the failure is on the first step.
   *
   * @example
   * ```tsx
   * onTargetMissing: (step) => {
   *   logger.warn('tour target missing', { target: step.target });
   *   return 'skip';
   * }
   * ```
   */
  onTargetMissing?: (step: CurrentTourStep) => TourTargetMissingAction | void;
  /** Default tooltip options applied to all steps (can be overridden per step) */
  tooltipOptions?: TooltipShowOptions;
  /** Whether to scroll target elements into view (default: true) */
  autoScroll?: boolean;
  /** CSS class to add to current target element for highlighting */
  highlightClass?: string;
  /** Navigation configuration for built-in controls */
  navigation?: TourNavigation;
  /**
   * Whether to show a backdrop blur effect highlighting the target (default: false).
   * Pass an object to also control pointer interaction - see {@link TourFocusOptions}.
   */
  focus?: TourFocus;
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
  /**
   * Start the tour from the first step.
   *
   * Returns `false` without starting - no state change, no `onStart`, no
   * `onStepChange` - when there are no steps to show or no step's target can be
   * resolved. A tour that cannot render never reports itself as shown, so `onStart` is
   * safe to use for "mark this tour as seen".
   */
  start: () => boolean;
  /** End the tour (marks as incomplete) */
  end: () => void;
  /** Go to next step (if on last step, ends tour as complete) */
  next: () => void;
  /**
   * Go to previous step.
   *
   * A no-op on the first step, and also when the previous step's target is not in the
   * DOM - the tour stays where it is rather than ending, since the current step is
   * still rendering.
   */
  prev: () => void;
  /**
   * Jump to a specific step by index (0-based).
   *
   * Returns `false` without moving if the index is out of range or that step's target
   * is not in the DOM. Unlike `next`, a jump never skips to a different step - landing
   * somewhere the caller did not ask for is worse than not moving.
   */
  goTo: (index: number) => boolean;
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Current step data with navigation metadata, null if tour is not active */
  currentStep: CurrentTourStep | null;
  /** Total number of visible steps (excluding conditional steps that returned false) */
  totalSteps: number;
  /** Progress info for display (1-based current, total) */
  progress: TourProgress;
}
