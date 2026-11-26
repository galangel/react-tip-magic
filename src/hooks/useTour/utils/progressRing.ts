/**
 * Geometry of the ring progress indicator's SVG
 */
export interface ProgressRingGeometry {
  /** viewBox width and height */
  size: number;
  /** Centre coordinate on both axes */
  center: number;
  radius: number;
  circumference: number;
  /** stroke-dashoffset that leaves `currentStep / totalSteps` of the ring drawn */
  dashOffset: number;
}

/** viewBox size - matches the `--tip-magic-tour-progress-ring-size` default */
const RING_SIZE = 32;
const RING_STROKE_WIDTH = 3;

/**
 * Compute the ring progress indicator's geometry
 *
 * @param currentStep - Current step number (1-based)
 * @param totalSteps - Total number of steps
 * @returns The values the SVG circles are drawn with
 *
 * @example
 * ```ts
 * getProgressRingGeometry(1, 2).dashOffset; // half the circumference
 * ```
 */
export function getProgressRingGeometry(
  currentStep: number,
  totalSteps: number
): ProgressRingGeometry {
  const radius = (RING_SIZE - RING_STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;

  return {
    size: RING_SIZE,
    center: RING_SIZE / 2,
    radius,
    circumference,
    dashOffset: circumference * (1 - currentStep / totalSteps),
  };
}
