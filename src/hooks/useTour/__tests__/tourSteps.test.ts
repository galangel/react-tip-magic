import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CurrentTourStep, TourStep } from '../../../types/tour';
import {
  buildCurrentStep,
  calculateProgress,
  filterVisibleSteps,
  resolveStepContent,
  resolveTargetElement,
} from '../utils/tourSteps';

describe('tourSteps utilities', () => {
  describe('filterVisibleSteps', () => {
    it('should return all steps when no conditions are set', () => {
      const steps: TourStep[] = [
        { target: 'step1', content: 'Content 1' },
        { target: 'step2', content: 'Content 2' },
        { target: 'step3', content: 'Content 3' },
      ];

      const result = filterVisibleSteps(steps);
      expect(result).toHaveLength(3);
      expect(result).toEqual(steps);
    });

    it('should filter out steps where condition returns false', () => {
      const steps: TourStep[] = [
        { target: 'step1', content: 'Content 1' },
        { target: 'step2', content: 'Content 2', condition: () => false },
        { target: 'step3', content: 'Content 3' },
      ];

      const result = filterVisibleSteps(steps);
      expect(result).toHaveLength(2);
      expect(result[0].target).toBe('step1');
      expect(result[1].target).toBe('step3');
    });

    it('should include steps where condition returns true', () => {
      const steps: TourStep[] = [
        { target: 'step1', content: 'Content 1', condition: () => true },
        { target: 'step2', content: 'Content 2', condition: () => true },
      ];

      const result = filterVisibleSteps(steps);
      expect(result).toHaveLength(2);
    });

    it('should handle mixed conditions', () => {
      const steps: TourStep[] = [
        { target: 'step1', content: 'Content 1', condition: () => true },
        { target: 'step2', content: 'Content 2', condition: () => false },
        { target: 'step3', content: 'Content 3' }, // no condition = visible
        { target: 'step4', content: 'Content 4', condition: () => false },
        { target: 'step5', content: 'Content 5', condition: () => true },
      ];

      const result = filterVisibleSteps(steps);
      expect(result).toHaveLength(3);
      expect(result.map((s) => s.target)).toEqual(['step1', 'step3', 'step5']);
    });

    it('should return empty array when all conditions are false', () => {
      const steps: TourStep[] = [
        { target: 'step1', content: 'Content 1', condition: () => false },
        { target: 'step2', content: 'Content 2', condition: () => false },
      ];

      const result = filterVisibleSteps(steps);
      expect(result).toHaveLength(0);
    });
  });

  describe('resolveStepContent', () => {
    it('should return string content as-is', () => {
      const step: TourStep = { target: 'step1', content: 'Hello World' };
      const stepInfo: Omit<CurrentTourStep, 'content'> = {
        index: 0,
        target: 'step1',
        isFirst: true,
        isLast: true,
        total: 1,
      };

      const result = resolveStepContent(step, stepInfo);
      expect(result).toBe('Hello World');
    });

    it('should call function content with step info', () => {
      const contentFn = vi.fn((step: CurrentTourStep) => `Step ${step.index + 1} of ${step.total}`);
      const step: TourStep = { target: 'step1', content: contentFn };
      const stepInfo: Omit<CurrentTourStep, 'content'> = {
        index: 2,
        target: 'step1',
        isFirst: false,
        isLast: false,
        total: 5,
      };

      const result = resolveStepContent(step, stepInfo);
      expect(result).toBe('Step 3 of 5');
      expect(contentFn).toHaveBeenCalledWith(stepInfo);
    });
  });

  describe('buildCurrentStep', () => {
    const steps: TourStep[] = [
      { target: 'step1', content: 'Content 1', title: 'Title 1' },
      { target: 'step2', content: 'Content 2' },
      { target: 'step3', content: 'Content 3', title: 'Title 3' },
    ];

    it('should return null for negative index', () => {
      const result = buildCurrentStep(steps, -1);
      expect(result).toBeNull();
    });

    it('should return null for index out of bounds', () => {
      const result = buildCurrentStep(steps, 5);
      expect(result).toBeNull();
    });

    it('should build first step correctly', () => {
      const result = buildCurrentStep(steps, 0);
      expect(result).toEqual({
        index: 0,
        target: 'step1',
        title: 'Title 1',
        content: 'Content 1',
        isFirst: true,
        isLast: false,
        total: 3,
      });
    });

    it('should build middle step correctly', () => {
      const result = buildCurrentStep(steps, 1);
      expect(result).toEqual({
        index: 1,
        target: 'step2',
        title: undefined,
        content: 'Content 2',
        isFirst: false,
        isLast: false,
        total: 3,
      });
    });

    it('should build last step correctly', () => {
      const result = buildCurrentStep(steps, 2);
      expect(result).toEqual({
        index: 2,
        target: 'step3',
        title: 'Title 3',
        content: 'Content 3',
        isFirst: false,
        isLast: true,
        total: 3,
      });
    });

    it('should handle single step as both first and last', () => {
      const singleStep: TourStep[] = [{ target: 'only', content: 'Only step' }];
      const result = buildCurrentStep(singleStep, 0);
      expect(result).toEqual({
        index: 0,
        target: 'only',
        title: undefined,
        content: 'Only step',
        isFirst: true,
        isLast: true,
        total: 1,
      });
    });

    it('should resolve function content', () => {
      const stepsWithFn: TourStep[] = [{ target: 'step1', content: (s) => `Dynamic: ${s.index}` }];
      const result = buildCurrentStep(stepsWithFn, 0);
      expect(result?.content).toBe('Dynamic: 0');
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 current when not active', () => {
      const result = calculateProgress(false, 2, 5);
      expect(result).toEqual({ current: 0, total: 5 });
    });

    it('should return 1-based current index when active', () => {
      const result = calculateProgress(true, 0, 5);
      expect(result).toEqual({ current: 1, total: 5 });
    });

    it('should calculate correct progress for middle step', () => {
      const result = calculateProgress(true, 2, 5);
      expect(result).toEqual({ current: 3, total: 5 });
    });

    it('should calculate correct progress for last step', () => {
      const result = calculateProgress(true, 4, 5);
      expect(result).toEqual({ current: 5, total: 5 });
    });
  });

  describe('resolveStepContent with `text`', () => {
    const stepInfo = {
      index: 0,
      target: 'step1',
      isFirst: true,
      isLast: false,
      total: 1,
    };

    it('should escape a text step', () => {
      const step: TourStep = { target: 'step1', text: '<b>bold</b>' };

      expect(resolveStepContent(step, stepInfo)).toBe('&lt;b&gt;bold&lt;/b&gt;');
    });

    it('should take precedence over content', () => {
      const step: TourStep = { target: 'step1', text: 'plain', content: '<b>html</b>' };

      expect(resolveStepContent(step, stepInfo)).toBe('plain');
    });

    it('should return an empty string when a step has neither', () => {
      const step: TourStep = { target: 'step1' };

      expect(resolveStepContent(step, stepInfo)).toBe('');
    });

    it('should leave `content` as the raw HTML it is documented to be', () => {
      const step: TourStep = { target: 'step1', content: '<b>bold</b>' };

      expect(resolveStepContent(step, stepInfo)).toBe('<b>bold</b>');
    });
  });

  describe('resolveTargetElement', () => {
    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should find an element by data-tip-id', () => {
      document.body.innerHTML = '<div data-tip-id="sidebar">Sidebar</div>';

      expect(resolveTargetElement('sidebar')?.textContent).toBe('Sidebar');
    });

    it('should return null when the element is absent', () => {
      expect(resolveTargetElement('nowhere')).toBeNull();
    });

    it('should not break on a target containing a quote', () => {
      document.body.innerHTML = `<div data-tip-id='say "hi"'>Quoted</div>`;

      expect(() => resolveTargetElement('say "hi"')).not.toThrow();
      expect(resolveTargetElement('say "hi"')?.textContent).toBe('Quoted');
    });
  });
});
