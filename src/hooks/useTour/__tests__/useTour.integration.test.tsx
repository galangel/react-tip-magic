import { act, cleanup, render } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TipMagicProvider } from '../../../components/TipMagicProvider';
import { useTipMagic } from '../../useTipMagic';
import type { TipMagicOptions } from '../../../types';
import type { TourOptions, UseTourReturn } from '../../../types/tour';
import { useTour } from '../useTour';

/**
 * Behavioural tests for useTour against a real provider and DOM.
 *
 * These cover the lifecycle/DOM agreement the hook is responsible for: a tour must
 * never report itself as shown when it cannot render, and must never leave a backdrop
 * or highlight behind once its target is gone.
 */

/** MutationObserver callbacks land on the microtask queue */
const flushMutations = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

function Harness({
  options,
  onReady,
}: {
  options: TourOptions;
  onReady: (tour: UseTourReturn) => void;
}) {
  const tour = useTour(options);
  useEffect(() => {
    onReady(tour);
  }, [tour, onReady]);
  return null;
}

/**
 * Render a tour over the given markup and return an accessor for its latest API object
 */
function mountTour(options: TourOptions, markup: string, providerOptions?: TipMagicOptions) {
  document.body.innerHTML = markup;
  let tour!: UseTourReturn;
  render(
    <TipMagicProvider options={providerOptions}>
      <Harness options={options} onReady={(value) => (tour = value)} />
    </TipMagicProvider>
  );
  return () => tour;
}

const count = (selector: string) => document.querySelectorAll(selector).length;
const tooltip = () => document.querySelector('.tip-magic-tooltip') as HTMLElement | null;

let warnSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  warnSpy.mockRestore();
  document.body.innerHTML = '';
});

describe('missing targets', () => {
  it('should not start, and should fire no lifecycle callbacks, when the first target is missing', () => {
    const onStart = vi.fn();
    const onStepChange = vi.fn();
    const getTour = mountTour(
      {
        steps: [{ target: 'nowhere', content: 'Hello' }],
        focus: true,
        onStart,
        onStepChange,
      },
      '<div id="app"></div>'
    );

    let started: boolean | undefined;
    act(() => {
      started = getTour().start();
    });

    expect(started).toBe(false);
    expect(onStart).not.toHaveBeenCalled();
    expect(onStepChange).not.toHaveBeenCalled();
    expect(getTour().isActive).toBe(false);
    expect(getTour().currentStep).toBeNull();
    expect(count('.tip-magic-tour-backdrop')).toBe(0);
    expect(count('.tip-magic-tooltip')).toBe(0);
  });

  it('should return true and start when the target resolves', () => {
    const onStart = vi.fn();
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'Hello' }], onStart },
      '<div data-tip-id="one">One</div>'
    );

    let started: boolean | undefined;
    act(() => {
      started = getTour().start();
    });

    expect(started).toBe(true);
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(getTour().isActive).toBe(true);
  });

  it('should call onTargetMissing instead of warning', () => {
    const onTargetMissing = vi.fn();
    const getTour = mountTour(
      { steps: [{ target: 'nowhere', content: 'Hello' }], onTargetMissing },
      '<div id="app"></div>'
    );

    act(() => {
      getTour().start();
    });

    expect(onTargetMissing).toHaveBeenCalledTimes(1);
    expect(onTargetMissing.mock.calls[0][0]).toMatchObject({ target: 'nowhere', index: 0 });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('should warn only when no handler is supplied', () => {
    const getTour = mountTour(
      { steps: [{ target: 'nowhere', content: 'Hello' }] },
      '<div id="app"></div>'
    );

    act(() => {
      getTour().start();
    });

    expect(warnSpy).toHaveBeenCalled();
  });

  it('should skip to the next resolvable step when the handler returns "skip"', () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'nowhere', content: 'Skipped' },
          { target: 'two', content: 'Shown' },
        ],
        onTargetMissing: () => 'skip' as const,
      },
      '<div data-tip-id="two">Two</div>'
    );

    let started: boolean | undefined;
    act(() => {
      started = getTour().start();
    });

    expect(started).toBe(true);
    expect(getTour().currentStep?.index).toBe(1);
    expect(tooltip()?.textContent).toContain('Shown');
  });

  it('should end the tour rather than strand it when a later step is missing', () => {
    const onEnd = vi.fn();
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', content: 'Step one' },
          { target: 'gone', content: 'Step two' },
        ],
        focus: true,
        onEnd,
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });
    expect(count('[data-tip-magic-focus]')).toBe(1);

    act(() => {
      getTour().next();
    });

    expect(getTour().isActive).toBe(false);
    expect(onEnd).toHaveBeenCalledWith(false);
    // No stale highlight, backdrop or panel left behind
    expect(count('[data-tip-magic-focus]')).toBe(0);
    expect(count('.tip-magic-tour-backdrop')).toBe(0);
    expect(count('.tip-magic-tooltip')).toBe(0);
  });
});

describe('target lost mid-tour', () => {
  it('should end the tour and clear the backdrop when the target unmounts', async () => {
    const onEnd = vi.fn();
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'A' }], focus: true, onEnd },
      '<div id="panel"><div data-tip-id="one">One</div></div>'
    );

    act(() => {
      getTour().start();
    });
    expect(count('.tip-magic-tour-backdrop')).toBe(1);

    act(() => {
      document.getElementById('panel')?.remove();
    });
    await flushMutations();

    expect(getTour().isActive).toBe(false);
    expect(onEnd).toHaveBeenCalledWith(false);
    expect(count('.tip-magic-tour-backdrop')).toBe(0);
    expect(count('.tip-magic-tooltip')).toBe(0);
  });

  it('should advance to the next step when the handler returns "skip"', async () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', content: 'Step one' },
          { target: 'two', content: 'Step two' },
        ],
        focus: true,
        onTargetMissing: () => 'skip' as const,
      },
      '<div id="panel"><div data-tip-id="one">One</div></div><div data-tip-id="two">Two</div>'
    );

    act(() => {
      getTour().start();
    });
    act(() => {
      document.getElementById('panel')?.remove();
    });
    await flushMutations();

    expect(getTour().isActive).toBe(true);
    expect(getTour().currentStep?.index).toBe(1);
    expect(tooltip()?.textContent).toContain('Step two');
  });
});

describe('highlight survives a className rewrite', () => {
  it('should keep the elevation attribute and restore the highlight class', async () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', content: 'A' }],
        focus: true,
        highlightClass: 'my-hl',
      },
      '<div data-tip-id="one" class="css-abc123">One</div>'
    );

    act(() => {
      getTour().start();
    });
    const element = document.querySelector('[data-tip-id="one"]') as HTMLElement;
    expect(element.hasAttribute('data-tip-magic-focus')).toBe(true);
    expect(element.classList.contains('my-hl')).toBe(true);

    // What React does on an Emotion theme change: the whole class attribute is rewritten
    act(() => {
      element.className = 'css-zzz999';
    });
    await flushMutations();

    // The attribute the stylesheet keys off was never React's to remove
    expect(element.hasAttribute('data-tip-magic-focus')).toBe(true);
    // ...and the consumer's class, which has to stay a class, is put back
    expect(element.classList.contains('my-hl')).toBe(true);
    expect(element.classList.contains('tip-magic-tour-focus-target')).toBe(true);
    expect(getTour().isActive).toBe(true);
  });
});

describe('tour panel presentation', () => {
  it('should let long content wrap by default', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'A long line of prose '.repeat(10) }] },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.tip-magic-tooltip.tip-magic-word-wrap')).toBe(1);
  });

  it('should let a consumer opt back out of wrapping', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', content: 'A' }],
        tooltipOptions: { wordWrap: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.tip-magic-tooltip.tip-magic-word-wrap')).toBe(0);
  });

  it('should present the panel as a dialog labelled by its title', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', title: 'Welcome', content: 'A' }] },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const panel = tooltip();
    expect(panel?.getAttribute('role')).toBe('dialog');

    const labelId = panel?.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    // Generated, not a fixed string a host page could already own
    expect(labelId).not.toBe('tip-magic-tour-title');
    expect(document.querySelectorAll(`#${labelId}`)).toHaveLength(1);
    expect(document.getElementById(labelId!)?.textContent).toBe('Welcome');
  });

  it('should not adopt a host page element that owns a similar id', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', title: 'Tour title', content: 'A' }] },
      '<h1 id="tip-magic-tour-title">Host page heading</h1><div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const labelId = tooltip()?.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId!)?.textContent).toBe('Tour title');
  });

  it('should leave a panel with no interactive controls as role="tooltip"', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', content: 'A' }],
        navigation: { showClose: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    // No header, media, controls or progress - nothing interactive, so no dialog
    expect(tooltip()?.getAttribute('role')).toBe('tooltip');
  });

  it('should move focus into the panel once it is positioned', async () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', title: 'Welcome', content: 'A' }] },
      '<div data-tip-id="one">One</div>'
    );

    // Focus waits for positioning - a panel is visibility:hidden until then, and
    // focusing a hidden element is a no-op in a real browser
    await act(async () => {
      getTour().start();
    });

    expect(document.activeElement).toBe(tooltip());
  });
});

describe('focus backdrop options', () => {
  it('should leave the backdrop non-interactive by default', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'A' }], focus: true },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const backdrop = document.querySelector('.tip-magic-tour-backdrop');
    expect(backdrop?.hasAttribute('data-tip-magic-backdrop-interactive')).toBe(false);
  });

  it('should block pointer events when asked', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'A' }], focus: { block: true } },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const backdrop = document.querySelector('.tip-magic-tour-backdrop');
    expect(backdrop?.hasAttribute('data-tip-magic-backdrop-interactive')).toBe(true);
  });

  it('should end the tour when the backdrop is clicked with dismissOnClick', () => {
    const onEnd = vi.fn();
    const getTour = mountTour(
      {
        steps: [{ target: 'one', content: 'A' }],
        focus: { dismissOnClick: true },
        onEnd,
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const backdrop = document.querySelector('.tip-magic-tour-backdrop') as HTMLElement;
    expect(backdrop.hasAttribute('data-tip-magic-backdrop-interactive')).toBe(true);

    act(() => {
      backdrop.click();
    });

    expect(getTour().isActive).toBe(false);
    expect(onEnd).toHaveBeenCalledWith(false);
  });
});

describe('content escaping', () => {
  it('should render `content` as HTML, as documented', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', content: '<b class="raw">bold</b>' }] },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.raw')).toBe(1);
  });

  it('should escape `text`', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', text: '<b class="raw">bold</b>' }] },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.raw')).toBe(0);
    expect(tooltip()?.textContent).toContain('<b class="raw">bold</b>');
  });

  it('should escape the step title', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', title: '<img class="raw" />', content: 'A' }] },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.raw')).toBe(0);
  });

  it('should escape a media src so it cannot break out of the attribute', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', content: 'A', image: 'x.png" onerror="globalThis.pwned=1' }],
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const image = document.querySelector('.tip-magic-tour-image img');
    expect(image?.hasAttribute('onerror')).toBe(false);
  });
});

describe('provider options', () => {
  it('should apply the configured z-index to the panel', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'A' }] },
      '<div data-tip-id="one">One</div>',
      { zIndex: 20000 }
    );

    act(() => {
      getTour().start();
    });

    expect(tooltip()?.style.zIndex).toBe('20000');
  });

  it('should honour prefers-reduced-motion by default', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'A' }] },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(tooltip()?.hasAttribute('data-tip-magic-motion')).toBe(false);
  });

  it('should opt out of reduced motion when respectReducedMotion is false', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', content: 'A' }] },
      '<div data-tip-id="one">One</div>',
      { respectReducedMotion: false }
    );

    act(() => {
      getTour().start();
    });

    expect(tooltip()?.getAttribute('data-tip-magic-motion')).toBe('always');
  });
});

describe('keyboard activation of the panel controls', () => {
  const threeSteps = [
    { target: 'one', content: 'Step one' },
    { target: 'two', content: 'Step two' },
    { target: 'three', content: 'Step three' },
  ];
  const threeTargets =
    '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div><div data-tip-id="three">Three</div>';

  /** Enter or Space on a focused button produces a click with detail 0 */
  const activateByKeyboard = (element: HTMLElement) =>
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

  /** A pointer click reports a click count of at least 1 */
  const activateByPointer = (element: HTMLElement) => {
    element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, detail: 1 }));
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  };

  it('advances on keyboard activation of Next', () => {
    const getTour = mountTour(
      { steps: threeSteps, navigation: { showControls: true } },
      threeTargets
    );
    act(() => {
      getTour().start();
    });

    act(() => {
      activateByKeyboard(document.querySelector('.tip-magic-tour-btn-next') as HTMLElement);
    });

    expect(getTour().currentStep?.index).toBe(1);
  });

  it('goes back on keyboard activation of Back', () => {
    const getTour = mountTour(
      { steps: threeSteps, navigation: { showControls: true } },
      threeTargets
    );
    act(() => {
      getTour().start();
    });
    act(() => {
      getTour().next();
    });

    act(() => {
      activateByKeyboard(document.querySelector('.tip-magic-tour-btn-back') as HTMLElement);
    });

    expect(getTour().currentStep?.index).toBe(0);
  });

  it('ends the tour on keyboard activation of Close', () => {
    const getTour = mountTour(
      { steps: threeSteps, navigation: { showControls: true } },
      threeTargets
    );
    act(() => {
      getTour().start();
    });

    act(() => {
      activateByKeyboard(document.querySelector('.tip-magic-tour-close') as HTMLElement);
    });

    expect(getTour().isActive).toBe(false);
  });

  it('advances exactly one step on a pointer click, not two', () => {
    const getTour = mountTour(
      { steps: threeSteps, navigation: { showControls: true } },
      threeTargets
    );
    act(() => {
      getTour().start();
    });

    // mousedown then click, as a real pointer produces
    act(() => {
      activateByPointer(document.querySelector('.tip-magic-tour-btn-next') as HTMLElement);
    });

    expect(getTour().currentStep?.index).toBe(1);
  });

  it('gives the generated buttons an explicit type', () => {
    const getTour = mountTour(
      { steps: threeSteps, navigation: { showControls: true } },
      threeTargets
    );
    act(() => {
      getTour().start();
    });

    document
      .querySelectorAll('.tip-magic-tour-btn, .tip-magic-tour-close')
      .forEach((button) => expect(button.getAttribute('type')).toBe('button'));
  });
});

describe('recovery policy differs by direction', () => {
  it('prev() stays put rather than ending a tour that renders fine', () => {
    const onEnd = vi.fn();
    const getTour = mountTour(
      {
        steps: [
          { target: 'gone', content: 'Step one' },
          { target: 'two', content: 'Step two' },
          { target: 'three', content: 'Step three' },
        ],
        onTargetMissing: () => 'skip' as const,
        onEnd,
      },
      '<div data-tip-id="two">Two</div><div data-tip-id="three">Three</div>'
    );

    act(() => {
      getTour().start();
    });
    expect(getTour().currentStep?.index).toBe(1);

    act(() => {
      getTour().prev();
    });

    expect(getTour().isActive).toBe(true);
    expect(getTour().currentStep?.index).toBe(1);
    expect(onEnd).not.toHaveBeenCalled();
  });

  it('goTo() never lands on a step other than the one requested', () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', content: 'Step one' },
          { target: 'gone', content: 'Step two' },
          { target: 'three', content: 'Step three' },
        ],
        onTargetMissing: () => 'skip' as const,
      },
      '<div data-tip-id="one">One</div><div data-tip-id="three">Three</div>'
    );
    act(() => {
      getTour().start();
    });

    let moved: boolean | undefined;
    act(() => {
      moved = getTour().goTo(1);
    });

    expect(moved).toBe(false);
    expect(getTour().currentStep?.index).toBe(0);
    expect(getTour().isActive).toBe(true);
  });

  it('goTo() reports success for a reachable step', () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', content: 'Step one' },
          { target: 'two', content: 'Step two' },
        ],
      },
      '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>'
    );
    act(() => {
      getTour().start();
    });

    let moved: boolean | undefined;
    act(() => {
      moved = getTour().goTo(1);
    });

    expect(moved).toBe(true);
    expect(getTour().currentStep?.index).toBe(1);
  });

  it('next() still ends the tour when nothing ahead can render', () => {
    const onEnd = vi.fn();
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', content: 'Step one' },
          { target: 'gone', content: 'Step two' },
        ],
        onEnd,
      },
      '<div data-tip-id="one">One</div>'
    );
    act(() => {
      getTour().start();
    });
    act(() => {
      getTour().next();
    });

    expect(getTour().isActive).toBe(false);
    expect(onEnd).toHaveBeenCalledWith(false);
  });
});

describe('navigation controls', () => {
  it('should render only a close button by default', () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', content: 'A' },
          { target: 'two', content: 'B' },
        ],
      },
      '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(getTour().totalSteps).toBe(2);
    expect(count('.tip-magic-tour-close')).toBe(1);
    expect(count('.tip-magic-tour-btn')).toBe(0);
  });

  it('should render Back/Next when showControls is enabled', () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', content: 'A' },
          { target: 'two', content: 'B' },
        ],
        navigation: { showControls: true },
      },
      '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>'
    );

    act(() => {
      getTour().start();
    });
    expect(count('.tip-magic-tour-btn-next')).toBe(1);
    expect(count('.tip-magic-tour-btn-back')).toBe(0);

    act(() => {
      getTour().next();
    });
    expect(getTour().currentStep?.index).toBe(1);
    expect(count('.tip-magic-tour-btn-back')).toBe(1);
  });
});

describe('helper flow state tracks the tour', () => {
  function HelperProbe({
    options,
    onReady,
  }: {
    options: TourOptions;
    onReady: (tour: UseTourReturn, helperIndex: number) => void;
  }) {
    const tour = useTour(options);
    const { helper } = useTipMagic();
    useEffect(() => {
      onReady(tour, helper.currentStepIndex);
    }, [tour, helper.currentStepIndex, onReady]);
    return null;
  }

  function mountWithHelper(options: TourOptions, markup: string) {
    document.body.innerHTML = markup;
    let tour!: UseTourReturn;
    let helperIndex = -99;
    render(
      <TipMagicProvider>
        <HelperProbe
          options={options}
          onReady={(t, h) => {
            tour = t;
            helperIndex = h;
          }}
        />
      </TipMagicProvider>
    );
    return { tour: () => tour, helperIndex: () => helperIndex };
  }

  it('keeps the helper index in step with prev()', () => {
    const api = mountWithHelper(
      {
        steps: [
          { target: 'one', content: 'A' },
          { target: 'two', content: 'B' },
        ],
      },
      '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>'
    );

    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().next();
    });
    expect(api.helperIndex()).toBe(1);

    act(() => {
      api.tour().prev();
    });

    expect(api.tour().currentStep?.index).toBe(0);
    expect(api.helperIndex()).toBe(0);
  });

  it('keeps the helper index in step when a step is skipped', () => {
    const api = mountWithHelper(
      {
        steps: [
          { target: 'one', content: 'A' },
          { target: 'gone', content: 'B' },
          { target: 'three', content: 'C' },
        ],
        onTargetMissing: () => 'skip' as const,
      },
      '<div data-tip-id="one">One</div><div data-tip-id="three">Three</div>'
    );

    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().next();
    });

    expect(api.tour().currentStep?.index).toBe(2);
    expect(api.helperIndex()).toBe(2);
  });

  it('keeps the helper index in step when the first step is skipped', () => {
    const api = mountWithHelper(
      {
        steps: [
          { target: 'gone', content: 'A' },
          { target: 'two', content: 'B' },
        ],
        onTargetMissing: () => 'skip' as const,
      },
      '<div data-tip-id="two">Two</div>'
    );

    act(() => {
      api.tour().start();
    });

    expect(api.tour().currentStep?.index).toBe(1);
    expect(api.helperIndex()).toBe(1);
  });
});
