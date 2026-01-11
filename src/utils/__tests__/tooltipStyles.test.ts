import { describe, it, expect } from 'vitest';
import { buildTooltipClassNames, getArrowStaticSide, getArrowStyles } from '../tooltipStyles';

describe('buildTooltipClassNames', () => {
  const defaultOptions = {
    shouldShow: false,
    isTransitioning: false,
    shouldAnimatePosition: false,
    isInteractive: false,
    wordWrap: false,
    ellipsis: false,
    textBreak: 'normal' as const,
  };

  describe('base class', () => {
    it('should always include the base tooltip class', () => {
      const result = buildTooltipClassNames(defaultOptions);
      expect(result).toContain('tip-magic-tooltip');
    });
  });

  describe('visibility classes', () => {
    it('should include visible class when shouldShow is true', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, shouldShow: true });
      expect(result).toContain('tip-magic-visible');
      expect(result).not.toContain('tip-magic-hidden');
    });

    it('should include hidden class when shouldShow is false', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, shouldShow: false });
      expect(result).toContain('tip-magic-hidden');
      expect(result).not.toContain('tip-magic-visible');
    });
  });

  describe('transitioning class', () => {
    it('should include transitioning class when isTransitioning is true', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, isTransitioning: true });
      expect(result).toContain('tip-magic-transitioning');
    });

    it('should not include transitioning class when isTransitioning is false', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, isTransitioning: false });
      expect(result).not.toContain('tip-magic-transitioning');
    });
  });

  describe('moving class', () => {
    it('should include moving class when shouldAnimatePosition is true', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, shouldAnimatePosition: true });
      expect(result).toContain('tip-magic-moving');
    });
  });

  describe('interactive class', () => {
    it('should include interactive class when isInteractive is true', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, isInteractive: true });
      expect(result).toContain('tip-magic-interactive');
    });
  });

  describe('text handling classes', () => {
    it('should include word-wrap class when wordWrap is true', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, wordWrap: true });
      expect(result).toContain('tip-magic-word-wrap');
    });

    it('should include ellipsis class when ellipsis is true', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, ellipsis: true });
      expect(result).toContain('tip-magic-ellipsis');
    });

    it('should not include text-break class when textBreak is normal', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, textBreak: 'normal' });
      expect(result).not.toContain('tip-magic-text-break');
    });

    it('should include text-break-break-all class', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, textBreak: 'break-all' });
      expect(result).toContain('tip-magic-text-break-break-all');
    });

    it('should include text-break-keep-all class', () => {
      const result = buildTooltipClassNames({ ...defaultOptions, textBreak: 'keep-all' });
      expect(result).toContain('tip-magic-text-break-keep-all');
    });
  });

  describe('combined classes', () => {
    it('should correctly combine multiple classes', () => {
      const result = buildTooltipClassNames({
        shouldShow: true,
        isTransitioning: true,
        shouldAnimatePosition: true,
        isInteractive: true,
        wordWrap: true,
        ellipsis: true,
        textBreak: 'break-all',
      });

      expect(result).toContain('tip-magic-tooltip');
      expect(result).toContain('tip-magic-visible');
      expect(result).toContain('tip-magic-transitioning');
      expect(result).toContain('tip-magic-moving');
      expect(result).toContain('tip-magic-interactive');
      expect(result).toContain('tip-magic-word-wrap');
      expect(result).toContain('tip-magic-ellipsis');
      expect(result).toContain('tip-magic-text-break-break-all');
    });
  });
});

describe('getArrowStaticSide', () => {
  describe('basic placements', () => {
    it('should return bottom for top placement', () => {
      expect(getArrowStaticSide('top')).toBe('bottom');
    });

    it('should return top for bottom placement', () => {
      expect(getArrowStaticSide('bottom')).toBe('top');
    });

    it('should return right for left placement', () => {
      expect(getArrowStaticSide('left')).toBe('right');
    });

    it('should return left for right placement', () => {
      expect(getArrowStaticSide('right')).toBe('left');
    });
  });

  describe('compound placements', () => {
    it('should handle top-start placement', () => {
      expect(getArrowStaticSide('top-start')).toBe('bottom');
    });

    it('should handle top-end placement', () => {
      expect(getArrowStaticSide('top-end')).toBe('bottom');
    });

    it('should handle bottom-start placement', () => {
      expect(getArrowStaticSide('bottom-start')).toBe('top');
    });

    it('should handle bottom-end placement', () => {
      expect(getArrowStaticSide('bottom-end')).toBe('top');
    });

    it('should handle left-start placement', () => {
      expect(getArrowStaticSide('left-start')).toBe('right');
    });

    it('should handle right-end placement', () => {
      expect(getArrowStaticSide('right-end')).toBe('left');
    });
  });

  describe('fallback', () => {
    it('should return bottom for unknown placements', () => {
      expect(getArrowStaticSide('unknown')).toBe('bottom');
    });
  });
});

describe('getArrowStyles', () => {
  it('should return correct styles when both x and y are provided', () => {
    const result = getArrowStyles(10, 20, 'bottom');
    expect(result).toEqual({
      left: '10px',
      top: '20px',
      bottom: '-4px',
    });
  });

  it('should return empty string for left when x is undefined', () => {
    const result = getArrowStyles(undefined, 20, 'bottom');
    expect(result.left).toBe('');
    expect(result.top).toBe('20px');
  });

  it('should return empty string for top when y is undefined', () => {
    const result = getArrowStyles(10, undefined, 'bottom');
    expect(result.left).toBe('10px');
    expect(result.top).toBe('');
  });

  it('should use the correct static side', () => {
    expect(getArrowStyles(0, 0, 'top')).toHaveProperty('top', '-4px');
    expect(getArrowStyles(0, 0, 'left')).toHaveProperty('left', '-4px');
    expect(getArrowStyles(0, 0, 'right')).toHaveProperty('right', '-4px');
  });

  it('should handle zero values correctly', () => {
    const result = getArrowStyles(0, 0, 'bottom');
    expect(result.left).toBe('0px');
    expect(result.top).toBe('0px');
  });
});
