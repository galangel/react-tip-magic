import { describe, it, expect, beforeEach } from 'vitest';
import { shouldHideTooltip, findTooltipTarget, isTooltipElement } from '../eventUtils';

describe('shouldHideTooltip', () => {
  let mockElement: Element;

  beforeEach(() => {
    // Create a mock element for testing
    mockElement = document.createElement('div');
  });

  describe('moving to tooltip', () => {
    it('should not hide when moving to the tooltip itself', () => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tip-magic-tooltip';
      document.body.appendChild(tooltip);

      const result = shouldHideTooltip(tooltip, null, mockElement, mockElement, true);

      expect(result.shouldHide).toBe(false);
      expect(result.shouldClearShowTimeout).toBe(true);

      document.body.removeChild(tooltip);
    });
  });

  describe('moving to helper', () => {
    it('should not hide when moving to the helper', () => {
      const helper = document.createElement('div');
      helper.className = 'tip-magic-helper';
      document.body.appendChild(helper);

      const result = shouldHideTooltip(helper, null, mockElement, mockElement, true);

      expect(result.shouldHide).toBe(false);

      document.body.removeChild(helper);
    });
  });

  describe('moving to another tooltip target', () => {
    it('should not hide when moving to another tooltip target', () => {
      const target = document.createElement('div');
      target.setAttribute('data-tip', 'Hello');
      document.body.appendChild(target);

      const result = shouldHideTooltip(target, null, mockElement, mockElement, true);

      expect(result.shouldHide).toBe(false);

      document.body.removeChild(target);
    });
  });

  describe('moving from tooltip back to target', () => {
    it('should not hide when moving from tooltip back to original target', () => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tip-magic-tooltip';

      const result = shouldHideTooltip(mockElement, tooltip, null, mockElement, true);

      expect(result.shouldHide).toBe(false);
    });
  });

  describe('leaving tooltip target', () => {
    it('should hide when leaving a tooltip target and not moving to protected elements', () => {
      const unrelatedElement = document.createElement('div');

      const result = shouldHideTooltip(unrelatedElement, null, mockElement, mockElement, true);

      expect(result.shouldHide).toBe(true);
    });

    it('should not hide when tooltip is not visible', () => {
      const unrelatedElement = document.createElement('div');

      const result = shouldHideTooltip(unrelatedElement, null, mockElement, mockElement, false);

      expect(result.shouldHide).toBe(false);
    });
  });

  describe('relatedTarget is null', () => {
    it('should hide when leaving target and relatedTarget is null', () => {
      const result = shouldHideTooltip(null, null, mockElement, mockElement, true);

      expect(result.shouldHide).toBe(true);
    });
  });
});

describe('findTooltipTarget', () => {
  it('should find tooltip target when element has data-tip', () => {
    const target = document.createElement('button');
    target.setAttribute('data-tip', 'Hello');
    document.body.appendChild(target);

    const result = findTooltipTarget(target);

    expect(result).toBe(target);

    document.body.removeChild(target);
  });

  it('should find parent tooltip target', () => {
    const parent = document.createElement('div');
    parent.setAttribute('data-tip', 'Hello');
    const child = document.createElement('span');
    parent.appendChild(child);
    document.body.appendChild(parent);

    const result = findTooltipTarget(child);

    expect(result).toBe(parent);

    document.body.removeChild(parent);
  });

  it('should return null when no tooltip target exists', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const result = findTooltipTarget(element);

    expect(result).toBeNull();

    document.body.removeChild(element);
  });
});

describe('isTooltipElement', () => {
  it('should return true for tooltip element', () => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tip-magic-tooltip';
    document.body.appendChild(tooltip);

    expect(isTooltipElement(tooltip)).toBe(true);

    document.body.removeChild(tooltip);
  });

  it('should return true for child of tooltip element', () => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tip-magic-tooltip';
    const child = document.createElement('span');
    tooltip.appendChild(child);
    document.body.appendChild(tooltip);

    expect(isTooltipElement(child)).toBe(true);

    document.body.removeChild(tooltip);
  });

  it('should return false for non-tooltip element', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    expect(isTooltipElement(element)).toBe(false);

    document.body.removeChild(element);
  });
});
