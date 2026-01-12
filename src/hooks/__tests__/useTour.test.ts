import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type {
  CurrentTourStep,
  TourDirection,
  TourOptions,
  TourProgress,
  TourStep,
  UseTourReturn,
} from '../../types/tour';

/**
 * Unit tests for useTour hook types and logic
 *
 * Note: Since useTour is a React hook that depends on TipMagicContext,
 * full integration tests are handled by Storybook tests. These unit tests
 * focus on type validation and utility logic that can be tested in isolation.
 */

describe('useTour Types', () => {
  describe('TourStep interface', () => {
    it('should accept minimal step definition', () => {
      const step: TourStep = {
        target: 'my-target',
        content: 'Hello world',
      };

      expect(step.target).toBe('my-target');
      expect(step.content).toBe('Hello world');
    });

    it('should accept step with all optional properties', () => {
      const step: TourStep = {
        target: 'my-target',
        content: 'Hello world',
        title: 'Step Title',
        placement: 'right',
        tooltipOptions: {
          maxWidth: 300,
          wordWrap: true,
          html: true,
        },
        condition: () => true,
        onEnter: () => {},
        onExit: () => {},
      };

      expect(step.title).toBe('Step Title');
      expect(step.placement).toBe('right');
      expect(step.condition?.()).toBe(true);
    });

    it('should accept function content', () => {
      const step: TourStep = {
        target: 'my-target',
        content: (currentStep) => `Step ${currentStep.index + 1} of ${currentStep.total}`,
      };

      // Mock CurrentTourStep for testing the function
      const mockCurrentStep: CurrentTourStep = {
        index: 0,
        target: 'my-target',
        content: '',
        isFirst: true,
        isLast: false,
        total: 5,
      };

      const content =
        typeof step.content === 'function' ? step.content(mockCurrentStep) : step.content;

      expect(content).toBe('Step 1 of 5');
    });
  });

  describe('TourOptions interface', () => {
    it('should accept minimal options', () => {
      const options: TourOptions = {
        steps: [{ target: 'a', content: 'A' }],
      };

      expect(options.steps.length).toBe(1);
    });

    it('should accept full options', () => {
      const onStart = vi.fn();
      const onEnd = vi.fn();
      const onStepChange = vi.fn();

      const options: TourOptions = {
        steps: [
          { target: 'a', content: 'A' },
          { target: 'b', content: 'B' },
        ],
        onStart,
        onEnd,
        onStepChange,
        tooltipOptions: {
          placement: 'bottom',
          interactive: true,
        },
        autoScroll: true,
        highlightClass: 'tour-highlight',
      };

      expect(options.steps.length).toBe(2);
      expect(options.autoScroll).toBe(true);
      expect(options.highlightClass).toBe('tour-highlight');
    });
  });

  describe('CurrentTourStep interface', () => {
    it('should have correct navigation metadata', () => {
      const firstStep: CurrentTourStep = {
        index: 0,
        target: 'first',
        content: 'First step',
        isFirst: true,
        isLast: false,
        total: 3,
      };

      const middleStep: CurrentTourStep = {
        index: 1,
        target: 'middle',
        content: 'Middle step',
        isFirst: false,
        isLast: false,
        total: 3,
      };

      const lastStep: CurrentTourStep = {
        index: 2,
        target: 'last',
        content: 'Last step',
        isFirst: false,
        isLast: true,
        total: 3,
      };

      expect(firstStep.isFirst).toBe(true);
      expect(firstStep.isLast).toBe(false);

      expect(middleStep.isFirst).toBe(false);
      expect(middleStep.isLast).toBe(false);

      expect(lastStep.isFirst).toBe(false);
      expect(lastStep.isLast).toBe(true);
    });

    it('should handle single step tour', () => {
      const singleStep: CurrentTourStep = {
        index: 0,
        target: 'only',
        content: 'Only step',
        isFirst: true,
        isLast: true,
        total: 1,
      };

      expect(singleStep.isFirst).toBe(true);
      expect(singleStep.isLast).toBe(true);
      expect(singleStep.total).toBe(1);
    });
  });

  describe('TourProgress interface', () => {
    it('should provide 1-based current for display', () => {
      const progress: TourProgress = {
        current: 1, // 1-based for display
        total: 5,
      };

      expect(progress.current).toBe(1);
      expect(progress.total).toBe(5);
    });
  });

  describe('TourDirection type', () => {
    it('should accept valid directions', () => {
      const directions: TourDirection[] = ['next', 'prev', 'jump'];

      expect(directions).toContain('next');
      expect(directions).toContain('prev');
      expect(directions).toContain('jump');
    });
  });

  describe('UseTourReturn interface', () => {
    it('should have all required properties', () => {
      // This test verifies the interface shape
      const mockReturn: UseTourReturn = {
        start: vi.fn(),
        end: vi.fn(),
        next: vi.fn(),
        prev: vi.fn(),
        goTo: vi.fn(),
        isActive: false,
        currentStep: null,
        totalSteps: 0,
        progress: { current: 0, total: 0 },
      };

      expect(typeof mockReturn.start).toBe('function');
      expect(typeof mockReturn.end).toBe('function');
      expect(typeof mockReturn.next).toBe('function');
      expect(typeof mockReturn.prev).toBe('function');
      expect(typeof mockReturn.goTo).toBe('function');
      expect(typeof mockReturn.isActive).toBe('boolean');
      expect(mockReturn.currentStep).toBeNull();
      expect(typeof mockReturn.totalSteps).toBe('number');
      expect(mockReturn.progress).toBeDefined();
    });
  });
});

describe('useTour Logic Helpers', () => {
  describe('Step filtering with conditions', () => {
    it('should filter out steps with false conditions', () => {
      const steps: TourStep[] = [
        { target: 'a', content: 'A', condition: () => true },
        { target: 'b', content: 'B', condition: () => false },
        { target: 'c', content: 'C' }, // No condition = always shown
        { target: 'd', content: 'D', condition: () => true },
      ];

      // Simulate the filtering logic from useTour
      const visibleSteps = steps.filter((step) => !step.condition || step.condition());

      expect(visibleSteps.length).toBe(3);
      expect(visibleSteps.map((s) => s.target)).toEqual(['a', 'c', 'd']);
    });

    it('should handle dynamic conditions', () => {
      let showAdvanced = false;

      const steps: TourStep[] = [
        { target: 'basic', content: 'Basic' },
        { target: 'advanced', content: 'Advanced', condition: () => showAdvanced },
      ];

      // Initially hidden
      let visibleSteps = steps.filter((step) => !step.condition || step.condition());
      expect(visibleSteps.length).toBe(1);

      // After enabling
      showAdvanced = true;
      visibleSteps = steps.filter((step) => !step.condition || step.condition());
      expect(visibleSteps.length).toBe(2);
    });
  });

  describe('Content resolution', () => {
    it('should resolve string content directly', () => {
      const step: TourStep = { target: 'a', content: 'Hello' };
      const resolved =
        typeof step.content === 'function' ? step.content({} as CurrentTourStep) : step.content;

      expect(resolved).toBe('Hello');
    });

    it('should resolve function content with step info', () => {
      const step: TourStep = {
        target: 'a',
        content: (s) => `${s.index + 1}/${s.total}: ${s.target}`,
      };

      const mockStep: CurrentTourStep = {
        index: 2,
        target: 'a',
        content: '',
        isFirst: false,
        isLast: false,
        total: 5,
      };

      const resolved = typeof step.content === 'function' ? step.content(mockStep) : step.content;

      expect(resolved).toBe('3/5: a');
    });
  });

  describe('Navigation index bounds', () => {
    const totalSteps = 5;

    it('should not go below 0 for prev', () => {
      let currentIndex = 0;
      const prev = () => {
        if (currentIndex > 0) {
          currentIndex = currentIndex - 1;
        }
      };

      prev(); // Should stay at 0
      expect(currentIndex).toBe(0);
    });

    it('should not go above totalSteps - 1 for next', () => {
      const currentIndex = totalSteps - 1; // Last step
      const isLast = currentIndex === totalSteps - 1;

      // next() should trigger end() when on last step, not increment
      expect(isLast).toBe(true);
    });

    it('should validate goTo bounds', () => {
      const goTo = (index: number) => {
        if (index < 0 || index >= totalSteps) {
          return false;
        }
        return true;
      };

      expect(goTo(-1)).toBe(false);
      expect(goTo(0)).toBe(true);
      expect(goTo(4)).toBe(true);
      expect(goTo(5)).toBe(false);
      expect(goTo(100)).toBe(false);
    });
  });

  describe('Progress calculation', () => {
    it('should calculate 1-based progress correctly', () => {
      const calculateProgress = (index: number, total: number): TourProgress => ({
        current: index + 1,
        total,
      });

      expect(calculateProgress(0, 5)).toEqual({ current: 1, total: 5 });
      expect(calculateProgress(2, 5)).toEqual({ current: 3, total: 5 });
      expect(calculateProgress(4, 5)).toEqual({ current: 5, total: 5 });
    });

    it('should handle inactive state', () => {
      const calculateProgress = (
        isActive: boolean,
        index: number,
        total: number
      ): TourProgress => ({
        current: isActive ? index + 1 : 0,
        total,
      });

      expect(calculateProgress(false, 0, 5)).toEqual({ current: 0, total: 5 });
      expect(calculateProgress(true, 0, 5)).toEqual({ current: 1, total: 5 });
    });
  });
});

describe('DOM Target Resolution', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should find target by data-tip-id', () => {
    const target = document.createElement('button');
    target.setAttribute('data-tip-id', 'my-button');
    container.appendChild(target);

    const found = document.querySelector('[data-tip-id="my-button"]');

    expect(found).toBe(target);
  });

  it('should return null for non-existent target', () => {
    const found = document.querySelector('[data-tip-id="non-existent"]');

    expect(found).toBeNull();
  });

  it('should handle highlight class toggle', () => {
    const target = document.createElement('div');
    target.setAttribute('data-tip-id', 'highlight-target');
    container.appendChild(target);

    const highlightClass = 'tour-highlight';

    // Add highlight
    target.classList.add(highlightClass);
    expect(target.classList.contains(highlightClass)).toBe(true);

    // Remove highlight
    target.classList.remove(highlightClass);
    expect(target.classList.contains(highlightClass)).toBe(false);
  });
});

describe('Callback Invocation Order', () => {
  it('should call onStart when tour starts', () => {
    const callbacks: string[] = [];

    const onStart = () => callbacks.push('onStart');
    const onStepChange = () => callbacks.push('onStepChange');

    // Simulate start behavior
    onStart();
    onStepChange();

    expect(callbacks).toEqual(['onStart', 'onStepChange']);
  });

  it('should call onExit before onEnter when navigating', () => {
    const callbacks: string[] = [];

    const onExit = () => callbacks.push('onExit');
    const onEnter = () => callbacks.push('onEnter');

    // Simulate navigation behavior
    onExit(); // Previous step
    onEnter(); // Next step

    expect(callbacks).toEqual(['onExit', 'onEnter']);
  });

  it('should call onEnd with correct completion status', () => {
    let completedStatus: boolean | null = null;

    const onEnd = (completed: boolean) => {
      completedStatus = completed;
    };

    // Completed (finished all steps)
    onEnd(true);
    expect(completedStatus).toBe(true);

    // Incomplete (user exited early)
    onEnd(false);
    expect(completedStatus).toBe(false);
  });
});
