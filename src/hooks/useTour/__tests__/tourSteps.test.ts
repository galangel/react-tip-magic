import { createElement, Fragment, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_NAVIGATION } from '../constants';
import type { CurrentTourStep, TourStep } from '../../../types/tour';
import {
  buildCurrentStep,
  buildFlowSteps,
  calculateProgress,
  filterVisibleSteps,
  findStep,
  fitsPanelToMedia,
  haveSameFlowSteps,
  haveSameStepOrder,
  hasMessage,
  rendersNothing,
  resolveMediaPlacement,
  resolveStepBody,
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

    // The type makes both-at-once and neither-at-all impossible to express, so these
    // two cover the runtime fallback for JS consumers who bypass it.
    it('should prefer text when both are somehow present', () => {
      const step = {
        target: 'step1',
        text: 'plain',
        content: '<b>html</b>',
      } as unknown as TourStep;

      expect(resolveStepContent(step, stepInfo)).toBe('plain');
    });

    it('should return an empty string when a step has neither', () => {
      const step = { target: 'step1' } as TourStep;

      expect(resolveStepContent(step, stepInfo)).toBe('');
    });

    it('should leave `content` as the raw HTML it is documented to be', () => {
      const step: TourStep = { target: 'step1', content: '<b>bold</b>' };

      expect(resolveStepContent(step, stepInfo)).toBe('<b>bold</b>');
    });

    it('should resolve a `body` step to an empty string, without calling it', () => {
      const body = vi.fn(() => 'node');
      const step: TourStep = { target: 'step1', body };

      expect(resolveStepContent(step, stepInfo)).toBe('');
      expect(body).not.toHaveBeenCalled();
    });
  });

  describe('resolveStepBody', () => {
    const stepInfo: CurrentTourStep = {
      index: 1,
      target: 'step1',
      content: '',
      isFirst: false,
      isLast: false,
      total: 3,
    };

    it('should keep `text` unescaped, for React to render as text', () => {
      const step: TourStep = { target: 'step1', text: 'Tom & <b>Jerry</b>' };

      expect(resolveStepBody(step, stepInfo)).toEqual({
        kind: 'text',
        value: 'Tom & <b>Jerry</b>',
      });
    });

    it('should pass a `body` node through', () => {
      const step: TourStep = { target: 'step1', body: 'a node' };

      expect(resolveStepBody(step, stepInfo)).toEqual({ kind: 'node', value: 'a node' });
    });

    it('should call a `body` function with the step info', () => {
      const body = vi.fn((step: CurrentTourStep) => `Step ${step.index + 1} of ${step.total}`);
      const step: TourStep = { target: 'step1', body };

      expect(resolveStepBody(step, stepInfo)).toEqual({ kind: 'node', value: 'Step 2 of 3' });
      expect(body).toHaveBeenCalledWith(stepInfo);
    });

    it('should resolve `content` to HTML', () => {
      const step: TourStep = { target: 'step1', content: (s) => `<b>${s.index}</b>` };

      expect(resolveStepBody(step, stepInfo)).toEqual({ kind: 'html', value: '<b>1</b>' });
    });

    it('should not accept a missing body as a body', () => {
      // @ts-expect-error - a body step has to have a body
      const nullBody: TourStep = { target: 'step1', body: null };
      // @ts-expect-error - as above
      const undefinedBody: TourStep = { target: 'step1', body: undefined };

      expect(resolveStepBody(nullBody, stepInfo)).toEqual({ kind: 'html', value: '' });
      expect(resolveStepBody(undefinedBody, stepInfo)).toEqual({ kind: 'html', value: '' });
    });

    it('should treat a body that renders nothing as no body', () => {
      const empty: unknown[] = [null, undefined, false, true, ''];
      for (const value of empty) {
        const step: TourStep = { target: 'step1', body: () => value as ReactNode };
        expect(resolveStepBody(step, stepInfo), String(value)).toEqual({ kind: 'html', value: '' });
      }

      const notes = '';
      const shortCircuited: TourStep = { target: 'step1', body: notes && 'Notes' };
      expect(resolveStepBody(shortCircuited, stepInfo)).toEqual({ kind: 'html', value: '' });
    });

    it('should not accept a boolean body', () => {
      // @ts-expect-error - a boolean renders nothing
      const step: TourStep = { target: 'step1', body: false };

      expect(resolveStepBody(step, stepInfo)).toEqual({ kind: 'html', value: '' });
    });

    it('should ignore an undefined body spread onto a content step', () => {
      const step: TourStep = { target: 'step1', content: '<b>x</b>', body: undefined };

      expect(resolveStepBody(step, stepInfo)).toEqual({ kind: 'html', value: '<b>x</b>' });
    });

    // The type rules out more than one; this covers JS consumers who bypass it.
    it('should prefer text, then body, when several are somehow present', () => {
      const all = { target: 'step1', text: 'plain', body: 'node', content: '<b>html</b>' };
      const bodyAndContent = { target: 'step1', body: 'node', content: '<b>html</b>' };

      expect(resolveStepBody(all as unknown as TourStep, stepInfo).kind).toBe('text');
      expect(resolveStepBody(bodyAndContent as unknown as TourStep, stepInfo).kind).toBe('node');
    });
  });

  describe('haveSameStepOrder', () => {
    const a: TourStep = { target: 'one', text: 'A' };
    const b: TourStep = { target: 'two', text: 'B' };

    it('should ignore everything but id and target', () => {
      expect(haveSameStepOrder([a, b], [{ ...a, text: 'changed' }, b])).toBe(true);
    });

    it('should notice an added, removed or reordered step', () => {
      expect(haveSameStepOrder([a, b], [a])).toBe(false);
      expect(haveSameStepOrder([a, b], [b, a])).toBe(false);
      expect(haveSameStepOrder([a], [{ ...a, id: 'a' }])).toBe(false);
    });
  });

  describe('findStep', () => {
    const one: TourStep = { target: 'one', text: 'A' };
    const two: TourStep = { target: 'two', text: 'B' };

    it('should find a step by its id', () => {
      const steps: TourStep[] = [
        { ...one, id: 'x' },
        { ...one, id: 'y' },
      ];

      expect(findStep(steps, { ...one, id: 'y' }, 0)).toBe(1);
      expect(findStep(steps, { ...one, id: 'z' }, 0)).toBe(-1);
    });

    it('should find a step by a target no other step shares', () => {
      expect(findStep([two, one], one, 0)).toBe(1);
      expect(findStep([two], one, 0)).toBe(-1);
    });

    it('should refuse to choose between steps on the same target', () => {
      expect(findStep([one, { ...one, text: 'C' }], one, 0)).toBeNull();
    });

    it('should find a centered step without an id only at its own position', () => {
      const centered: TourStep = { text: 'Welcome' };

      expect(findStep([centered, one], centered, 0)).toBe(0);
      expect(findStep([one, centered], centered, 0)).toBeNull();
      expect(findStep([{ ...centered, id: 'intro' }], centered, 0)).toBeNull();
      expect(findStep([one, { ...centered, id: 'intro' }], { ...centered, id: 'intro' }, 0)).toBe(
        1
      );
    });
  });

  describe('buildFlowSteps / haveSameFlowSteps', () => {
    const steps: TourStep[] = [
      { target: 'one', text: 'A' },
      { target: 'two', content: '<b>B</b>' },
      { target: 'three', body: 'C' },
    ];

    it('should copy target and plain message of each step', () => {
      expect(buildFlowSteps(steps)).toEqual([
        { id: 'tour-step-0', targetId: 'one', message: 'A' },
        { id: 'tour-step-1', targetId: 'two', message: '<b>B</b>' },
        { id: 'tour-step-2', targetId: 'three', message: '' },
      ]);
    });

    it('should compare flows by value', () => {
      expect(haveSameFlowSteps(buildFlowSteps(steps), buildFlowSteps([...steps]))).toBe(true);
      expect(haveSameFlowSteps(buildFlowSteps(steps), buildFlowSteps(steps.slice(1)))).toBe(false);
      expect(haveSameFlowSteps(buildFlowSteps(steps), null)).toBe(false);
    });
  });

  describe('rendersNothing', () => {
    const fragment = (...children: ReactNode[]) => createElement(Fragment, null, ...children);

    it('should be true for what React renders no nodes for', () => {
      const nothing: ReactNode[] = [null, undefined, false, true, '', [], [null, ''], fragment()];
      for (const node of nothing) {
        expect(rendersNothing(node), String(node)).toBe(true);
      }
      expect(rendersNothing(fragment(false, [null, fragment()]))).toBe(true);
    });

    it('should be false for anything that renders', () => {
      const something: ReactNode[] = [0, 'a', createElement('span'), [null, 'a'], fragment('a')];
      for (const node of something) {
        expect(rendersNothing(node), String(node)).toBe(false);
      }
    });
  });

  describe('a step that is only media', () => {
    it('should type-check with an image or a video and nothing else', () => {
      const image: TourStep = { image: 'pic.png' };
      const video: TourStep = { video: { src: 'clip.mp4', title: 'Product tour' } };
      // @ts-expect-error - a step with no body and no media has nothing to show
      const nothing: TourStep = { target: 'one' };

      expect(
        resolveStepBody(image, { index: 0, content: '', isFirst: true, isLast: true, total: 1 })
      ).toEqual({
        kind: 'html',
        value: '',
      });
      expect(video.video?.src).toBe('clip.mp4');
      expect(nothing.target).toBe('one');
    });
  });

  describe('hasMessage', () => {
    it('should be false only for an empty text or HTML body', () => {
      expect(hasMessage({ kind: 'text', value: '' })).toBe(false);
      expect(hasMessage({ kind: 'html', value: '' })).toBe(false);
      expect(hasMessage({ kind: 'text', value: 'A' })).toBe(true);
      expect(hasMessage({ kind: 'node', value: 'A' })).toBe(true);
    });
  });

  describe('resolveMediaPlacement', () => {
    const panel = {
      body: { kind: 'text', value: 'Text' } as const,
      navigation: DEFAULT_NAVIGATION,
      showProgress: false,
    };
    const withImage: TourStep = { text: 'Text', image: 'pic.png' };

    it('should default to top', () => {
      expect(resolveMediaPlacement(withImage, undefined, panel)).toBe('top');
    });

    it('should take the tour setting, overridden by the step', () => {
      expect(resolveMediaPlacement(withImage, 'left', panel)).toBe('left');
      expect(resolveMediaPlacement({ ...withImage, mediaPlacement: 'right' }, 'left', panel)).toBe(
        'right'
      );
      expect(resolveMediaPlacement({ ...withImage, mediaPlacement: 'top' }, 'left', panel)).toBe(
        'top'
      );
    });

    it('should put media beside a video, and ignore a step without media', () => {
      expect(
        resolveMediaPlacement({ text: 'Text', video: { src: 'clip.mp4' } }, 'left', panel)
      ).toBe('left');
      expect(resolveMediaPlacement({ text: 'Text' }, 'left', panel)).toBe('top');
    });

    it('should keep media on top when there is no text to put it beside', () => {
      const nothingElse = { ...panel, body: { kind: 'html', value: '' } as const };

      expect(resolveMediaPlacement({ image: 'pic.png' }, 'left', nothingElse)).toBe('top');
      expect(resolveMediaPlacement({ image: 'pic.png', title: 'T' }, 'left', nothingElse)).toBe(
        'left'
      );
      expect(
        resolveMediaPlacement({ image: 'pic.png' }, 'left', {
          ...nothingElse,
          navigation: { ...DEFAULT_NAVIGATION, showControls: true },
        })
      ).toBe('left');
    });
  });

  describe('fitsPanelToMedia', () => {
    it('should be true for a centered step with an image or a native video', () => {
      expect(fitsPanelToMedia({ text: 'A', image: 'pic.png' })).toBe(true);
      expect(fitsPanelToMedia({ text: 'A', video: { src: 'clip.mp4' } })).toBe(true);
    });

    it('should be false for an embed, no media, or a step with a target', () => {
      expect(fitsPanelToMedia({ text: 'A', video: { src: 'https://v', type: 'embed' } })).toBe(
        false
      );
      expect(
        fitsPanelToMedia({
          text: 'A',
          image: 'pic.png',
          video: { src: 'https://v', type: 'embed' },
        })
      ).toBe(false);
      expect(fitsPanelToMedia({ text: 'A' })).toBe(false);
      expect(fitsPanelToMedia({ target: 'one', text: 'A', image: 'pic.png' })).toBe(false);
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
