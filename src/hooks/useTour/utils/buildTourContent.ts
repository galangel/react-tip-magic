import type { CurrentTourStep, TourNavigation, TourStep } from '../../../types/tour';
import { escapeHtml } from '../../../utils/escapeHtml';
import { TOUR_ACTIONS, TOUR_CSS_CLASSES, TOUR_ELEMENT_IDS } from '../constants';
import type { ResolvedProgressOptions } from './tourNavigation';

/**
 * Build media HTML for a tour step (image or video)
 *
 * @param step - The tour step with optional image/video
 * @returns HTML string for the media element
 */
export function buildMediaHtml(step: TourStep): string {
  if (step.video) {
    const { src, type = 'native', autoplay = true, loop = true, muted = true } = step.video;

    if (type === 'embed') {
      // Embed video (YouTube, Vimeo, etc.)
      return `<div class="${TOUR_CSS_CLASSES.VIDEO} ${TOUR_CSS_CLASSES.VIDEO_EMBED}">
        <iframe src="${escapeHtml(src)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>`;
    } else {
      // Native video (mp4, webm)
      return `<div class="${TOUR_CSS_CLASSES.VIDEO}">
        <video ${autoplay ? 'autoplay' : ''} ${loop ? 'loop' : ''} ${muted ? 'muted' : ''} playsinline>
          <source src="${escapeHtml(src)}" type="video/mp4">
        </video>
      </div>`;
    }
  }

  if (step.image) {
    return `<div class="${TOUR_CSS_CLASSES.IMAGE}"><img src="${escapeHtml(step.image)}" alt="" /></div>`;
  }

  return '';
}

/**
 * Build header HTML for a tour step (title and close button)
 *
 * @param step - The tour step
 * @param nav - Navigation configuration
 * @returns HTML string for the header
 */
export function buildHeaderHtml(step: TourStep, nav: Required<TourNavigation>): string {
  const hasHeader = step.title || nav.showClose;

  if (!hasHeader) {
    return '';
  }

  // The title carries an id so the panel can point aria-labelledby at it
  const titleHtml = step.title
    ? `<div class="${TOUR_CSS_CLASSES.TITLE}" id="${TOUR_ELEMENT_IDS.TITLE}">${escapeHtml(step.title)}</div>`
    : '<div></div>';

  return `<div class="${TOUR_CSS_CLASSES.HEADER}">
    ${titleHtml}
    ${nav.showClose ? `<button class="${TOUR_CSS_CLASSES.CLOSE}" data-tour-action="${TOUR_ACTIONS.CLOSE}" aria-label="Close">×</button>` : ''}
  </div>`;
}

/**
 * Build navigation HTML for a tour step (back/next buttons)
 *
 * @param stepInfo - Current step info with navigation metadata
 * @param nav - Navigation configuration
 * @returns HTML string for the navigation buttons
 */
export function buildNavHtml(stepInfo: CurrentTourStep, nav: Required<TourNavigation>): string {
  if (!nav.showControls) {
    return '';
  }

  const backButton = !stepInfo.isFirst
    ? `<button class="${TOUR_CSS_CLASSES.BTN} ${TOUR_CSS_CLASSES.BTN_BACK}" data-tour-action="${TOUR_ACTIONS.PREV}">${nav.backLabel}</button>`
    : '';

  const nextAction = stepInfo.isLast ? TOUR_ACTIONS.FINISH : TOUR_ACTIONS.NEXT;
  const nextLabel = stepInfo.isLast ? nav.finishLabel : nav.nextLabel;
  const nextButton = `<button class="${TOUR_CSS_CLASSES.BTN} ${TOUR_CSS_CLASSES.BTN_NEXT}" data-tour-action="${nextAction}">${nextLabel}</button>`;

  return `<div class="${TOUR_CSS_CLASSES.NAV}">
    ${backButton}
    ${nextButton}
  </div>`;
}

/**
 * Build text-based progress indicator HTML (e.g., "Step 1 of 5")
 *
 * @param currentStep - Current step number (1-based)
 * @param totalSteps - Total number of steps
 * @returns HTML string for the text progress indicator
 */
export function buildStepsProgressHtml(currentStep: number, totalSteps: number): string {
  return `<div class="${TOUR_CSS_CLASSES.PROGRESS}">Step ${currentStep} of ${totalSteps}</div>`;
}

/**
 * Build ring/circular progress indicator HTML
 *
 * @param currentStep - Current step number (1-based)
 * @param totalSteps - Total number of steps
 * @returns HTML string for the ring progress indicator
 */
export function buildRingProgressHtml(currentStep: number, totalSteps: number): string {
  // SVG ring calculations
  const size = 32; // Matches CSS variable default
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = currentStep / totalSteps;
  const dashOffset = circumference * (1 - progress);

  return `<div class="${TOUR_CSS_CLASSES.PROGRESS_RING}">
    <svg viewBox="0 0 ${size} ${size}">
      <circle 
        class="${TOUR_CSS_CLASSES.PROGRESS_RING_BG}"
        cx="${size / 2}" 
        cy="${size / 2}" 
        r="${radius}"
      />
      <circle 
        class="${TOUR_CSS_CLASSES.PROGRESS_RING_FILL}"
        cx="${size / 2}" 
        cy="${size / 2}" 
        r="${radius}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${dashOffset}"
      />
    </svg>
    <span class="${TOUR_CSS_CLASSES.PROGRESS_RING_TEXT}">${currentStep}/${totalSteps}</span>
  </div>`;
}

/**
 * Build progress indicator HTML based on options
 *
 * @param stepInfo - Current step info with progress metadata
 * @param progressOptions - Progress configuration
 * @returns HTML string for the progress indicator
 */
export function buildProgressHtml(
  stepInfo: CurrentTourStep,
  progressOptions: ResolvedProgressOptions
): string {
  const currentStep = stepInfo.index + 1;
  const totalSteps = stepInfo.total;

  // Custom render function takes priority
  if (progressOptions.render) {
    return progressOptions.render({ currentStep, totalSteps });
  }

  // Built-in types
  switch (progressOptions.type) {
    case 'ring':
      return buildRingProgressHtml(currentStep, totalSteps);
    case 'steps':
    default:
      return buildStepsProgressHtml(currentStep, totalSteps);
  }
}

/**
 * Build footer HTML containing progress and/or navigation
 *
 * @param stepInfo - Current step info
 * @param nav - Navigation configuration
 * @param progressOptions - Progress configuration (null if not shown)
 * @returns HTML string for the footer
 */
export function buildFooterHtml(
  stepInfo: CurrentTourStep,
  nav: Required<TourNavigation>,
  progressOptions: ResolvedProgressOptions | null
): string {
  const hasNavigation = nav.showControls;
  const showProgress = progressOptions?.show ?? false;

  // No footer needed if neither progress nor navigation
  if (!showProgress && !hasNavigation) {
    return '';
  }

  // Only navigation, no progress - return just nav
  if (!showProgress && hasNavigation) {
    return buildNavHtml(stepInfo, nav);
  }

  // Only progress, no navigation
  if (showProgress && progressOptions && !hasNavigation) {
    return `<div class="${TOUR_CSS_CLASSES.FOOTER}">
      ${buildProgressHtml(stepInfo, progressOptions)}
    </div>`;
  }

  // Both progress and navigation - use footer layout
  if (showProgress && progressOptions) {
    return `<div class="${TOUR_CSS_CLASSES.FOOTER}">
      ${buildProgressHtml(stepInfo, progressOptions)}
      ${buildNavHtml(stepInfo, nav)}
    </div>`;
  }

  return '';
}

/**
 * Build the complete HTML content for a tour step with navigation controls
 *
 * @param step - The tour step
 * @param stepInfo - Current step info with navigation metadata
 * @param nav - Navigation configuration
 * @param resolvedContent - The resolved content string
 * @param progressOptions - Progress configuration (null if not shown)
 * @returns Complete HTML string for the tooltip content
 */
export function buildTourContent(
  step: TourStep,
  stepInfo: CurrentTourStep,
  nav: Required<TourNavigation>,
  resolvedContent: string,
  progressOptions: ResolvedProgressOptions | null = null
): string {
  const hasHeader = step.title || nav.showClose;
  const hasNavigation = nav.showControls;
  const hasMedia = step.image || step.video;
  const showProgress = progressOptions?.show ?? false;
  const hasFooter = hasNavigation || showProgress;

  // If no navigation features are used, return simple content
  if (!hasHeader && !hasMedia && !hasFooter) {
    return resolvedContent;
  }

  const headerHtml = buildHeaderHtml(step, nav);
  const mediaHtml = buildMediaHtml(step);
  const footerHtml = buildFooterHtml(stepInfo, nav, progressOptions);

  return `<div class="${TOUR_CSS_CLASSES.CONTENT}">
    ${headerHtml}
    ${mediaHtml}
    <div class="${TOUR_CSS_CLASSES.BODY}">
      <div class="${TOUR_CSS_CLASSES.MESSAGE}">${resolvedContent}</div>
    </div>
    ${footerHtml}
  </div>`;
}
