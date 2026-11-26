import { describe, expect, it } from 'vitest';
import { getProgressRingGeometry } from '../utils/progressRing';

describe('getProgressRingGeometry', () => {
  it('should centre a circle that fits inside the stroke', () => {
    const ring = getProgressRingGeometry(1, 4);

    expect(ring.size).toBe(32);
    expect(ring.center).toBe(16);
    expect(ring.radius).toBe(14.5);
    expect(ring.circumference).toBeCloseTo(2 * Math.PI * 14.5);
  });

  it('should leave the drawn fraction equal to the progress', () => {
    const ring = getProgressRingGeometry(1, 4);

    expect(ring.dashOffset).toBeCloseTo(ring.circumference * 0.75);
  });

  it('should draw the full ring on the last step', () => {
    expect(getProgressRingGeometry(5, 5).dashOffset).toBe(0);
  });
});
