import { act, cleanup, render } from '@testing-library/react';
import {
  startTransition,
  StrictMode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { TipMagicProvider } from '../../../components/TipMagicProvider';
import { useTipMagic } from '../../useTipMagic';
import type { TipMagicOptions } from '../../../types';
import type { TourNavigation, TourOptions, TourStep, UseTourReturn } from '../../../types/tour';
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

  it('should render the panel for a step whose only feature is its title', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', title: 'Hello', text: 'A' }],
        navigation: { showClose: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(document.querySelector('.tip-magic-tour-title')?.textContent).toBe('Hello');
    expect(document.querySelector('.tip-magic-tour-message')?.textContent).toBe('A');
    expect(tooltip()?.getAttribute('role')).toBe('dialog');
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

  it('should render `text` once-escaped when the step renders no panel', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', text: 'Tom & <Jerry>' }],
        navigation: { showClose: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(tooltip()?.textContent).toBe('Tom & <Jerry>');
  });

  it('should keep `text` off the HTML path even when the tooltip options ask for html', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', text: '<b class="raw">bold</b>' }],
        navigation: { showClose: false },
        tooltipOptions: { html: true },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.raw')).toBe(0);
    expect(tooltip()?.textContent).toBe('<b class="raw">bold</b>');
  });

  it('should render `content` as HTML when the step renders no panel', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', content: '<b class="raw">bold</b>' }],
        navigation: { showClose: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(tooltip()?.querySelector('.raw')?.textContent).toBe('bold');
  });

  it('should leave `content` as text when the tour asks for html: false', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', content: '<b class="raw">bold</b>' }],
        navigation: { showClose: false },
        tooltipOptions: { html: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.raw')).toBe(0);
    expect(tooltip()?.textContent).toBe('<b class="raw">bold</b>');
  });

  it('should leave `content` as text when the step asks for html: false', () => {
    const getTour = mountTour(
      {
        steps: [
          {
            target: 'one',
            content: '<b class="raw">bold</b>',
            tooltipOptions: { html: false },
          },
        ],
        navigation: { showClose: false },
        tooltipOptions: { html: true },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(count('.raw')).toBe(0);
  });

  it('should render navigation labels as text, not markup', () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', text: 'A' },
          { target: 'two', text: 'B' },
        ],
        navigation: { showControls: true, nextLabel: '<b>Go</b>', backLabel: '<i>Back</i>' },
      },
      '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>'
    );

    act(() => {
      getTour().start();
    });

    const next = document.querySelector('.tip-magic-tour-btn-next');
    expect(next?.textContent).toBe('<b>Go</b>');
    expect(next?.querySelector('b')).toBeNull();

    act(() => {
      getTour().next();
    });

    const back = document.querySelector('.tip-magic-tour-btn-back');
    expect(back?.textContent).toBe('<i>Back</i>');
    expect(back?.querySelector('i')).toBeNull();
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

describe('a React body', () => {
  it('should render in a running tour, with its event handlers', () => {
    const onClick = vi.fn();
    const getTour = mountTour(
      {
        steps: [
          {
            target: 'one',
            title: "What's new",
            body: (
              <p className="notes">
                Release <strong>notes</strong>{' '}
                <button type="button" onClick={onClick}>
                  Details
                </button>
              </p>
            ),
          },
        ],
        navigation: { showControls: true },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const notes = document.querySelector('.tip-magic-tour-message > .notes');
    expect(notes?.querySelector('strong')?.textContent).toBe('notes');

    act(() => {
      (notes?.querySelector('button') as HTMLElement).click();
    });

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(getTour().isActive).toBe(true);
  });

  it('should be called with the current step when it is a function', () => {
    const getTour = mountTour(
      {
        steps: [
          { target: 'one', body: (step) => <em>{`${step.index + 1} of ${step.total}`}</em> },
          { target: 'two', body: (step) => <em>{`${step.index + 1} of ${step.total}`}</em> },
        ],
      },
      '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>'
    );

    act(() => {
      getTour().start();
    });
    act(() => {
      getTour().next();
    });

    expect(document.querySelector('.tip-magic-tour-message em')?.textContent).toBe('2 of 2');
    expect(getTour().currentStep?.content).toBe('');
  });

  it('should render in an interactive, scrollable panel even with no other panel features', () => {
    const onClick = vi.fn();
    const getTour = mountTour(
      {
        steps: [
          {
            target: 'one',
            body: (
              <button type="button" className="act" onClick={onClick}>
                Act
              </button>
            ),
          },
        ],
        navigation: { showClose: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    expect(tooltip()?.querySelector('.tip-magic-tour-body .act')).not.toBeNull();
    expect(tooltip()?.hasAttribute('data-interactive')).toBe(true);
    expect(tooltip()?.getAttribute('role')).toBe('dialog');

    act(() => {
      (tooltip()?.querySelector('.act') as HTMLElement).click();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('an empty body', () => {
  it('should not open an empty dialog for a body that short-circuits to nothing', async () => {
    const notes = '';
    const getTour = mountTour(
      {
        steps: [{ target: 'one', body: notes && <p>{notes}</p> }],
        navigation: { showClose: false },
      },
      '<button id="trigger">Start</button><div data-tip-id="one">One</div>'
    );
    const trigger = document.getElementById('trigger') as HTMLElement;
    trigger.focus();

    await act(async () => {
      getTour().start();
    });

    expect(count('.tip-magic-tour-content')).toBe(0);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe('a running step follows changes to its steps', () => {
  function Notes({ text }: { text: string }) {
    return <p className="notes">{text}</p>;
  }

  const onEnter = vi.fn();
  beforeEach(() => {
    onEnter.mockReset();
  });

  const stepsWith = (text: string): TourStep[] => [
    { target: 'one', title: 'News', body: <Notes text={text} />, onEnter },
    { target: 'two', text: 'Second' },
  ];

  /** Mount a tour whose steps can be replaced while it runs */
  function mountReplaceable(options: Omit<TourOptions, 'steps'>, initial: string) {
    document.body.innerHTML = '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>';
    let tour!: UseTourReturn;
    const onReady = (value: UseTourReturn) => (tour = value);
    const ui = (text: string) => (
      <TipMagicProvider>
        <Harness options={{ ...options, steps: stepsWith(text) }} onReady={onReady} />
      </TipMagicProvider>
    );
    const { rerender } = render(ui(initial));
    return { tour: () => tour, replaceSteps: (text: string) => act(() => rerender(ui(text))) };
  }

  it('updates the panel in place, without re-firing callbacks or moving focus', async () => {
    const onStepChange = vi.fn();
    const api = mountReplaceable(
      { navigation: { showControls: true, autoFocus: 'primary' }, onStepChange },
      'Loading...'
    );

    await act(async () => {
      api.tour().start();
    });
    const panel = document.querySelector('.tip-magic-tour-content');
    expect(document.querySelector('.notes')?.textContent).toBe('Loading...');

    // The user moves focus off the primary action
    const close = document.querySelector('.tip-magic-tour-close') as HTMLElement;
    close.focus();

    await api.replaceSteps('Release notes');

    expect(document.querySelector('.notes')?.textContent).toBe('Release notes');
    expect(document.querySelector('.tip-magic-tour-content')).toBe(panel);
    expect(document.activeElement).toBe(close);
    expect(onStepChange).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledTimes(1);
  });

  it('shows the latest steps after navigating', () => {
    const api = mountReplaceable({ navigation: { showControls: true } }, 'Loading...');

    act(() => {
      api.tour().start();
    });
    api.replaceSteps('Release notes');
    act(() => {
      api.tour().next();
    });
    act(() => {
      api.tour().prev();
    });

    expect(document.querySelector('.notes')?.textContent).toBe('Release notes');
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

describe('navigation.autoFocus', () => {
  const twoSteps = [
    { target: 'one', content: 'Step one' },
    { target: 'two', content: 'Step two' },
  ];
  const twoTargets =
    '<button id="trigger">Start</button><div data-tip-id="one">One</div><div data-tip-id="two">Two</div>';

  const primary = () => document.querySelector('[data-tip-magic-primary]') as HTMLElement | null;
  const closeBtn = () => document.querySelector('[data-tour-action="close"]') as HTMLElement | null;

  const mountWith = (navigation: TourNavigation, steps: TourStep[] = twoSteps) =>
    mountTour({ steps, navigation }, twoTargets);

  it('defaults to the panel, unchanged, on the first and later steps', async () => {
    const getTour = mountWith({ showControls: true });

    await act(async () => {
      getTour().start();
    });
    expect(document.activeElement).toBe(tooltip());
    expect(document.activeElement).not.toBe(primary());

    await act(async () => {
      getTour().next();
    });
    expect(document.activeElement).toBe(tooltip());
  });

  it("focuses Next on the first step with autoFocus: 'primary'", async () => {
    const getTour = mountWith({ showControls: true, autoFocus: 'primary' });

    await act(async () => {
      getTour().start();
    });

    expect(document.activeElement).toBe(primary());
    expect(primary()?.getAttribute('data-tour-action')).toBe('next');
  });

  it('focuses Finish on the last step', async () => {
    const getTour = mountWith({ showControls: true, autoFocus: 'primary' });

    await act(async () => {
      getTour().start();
    });
    await act(async () => {
      getTour().next();
    });

    expect(document.activeElement).toBe(primary());
    expect(primary()?.getAttribute('data-tour-action')).toBe('finish');
  });

  it('reaches the button even when focus is already on the panel', async () => {
    const getTour = mountWith({ showControls: true, autoFocus: 'primary' });

    await act(async () => {
      getTour().start();
    });

    await act(async () => {
      tooltip()?.focus();
    });
    expect(document.activeElement).toBe(tooltip());

    await act(async () => {
      getTour().next();
    });

    expect(document.activeElement).toBe(primary());
  });

  it('falls back to the panel - never the close button - when no primary action renders', async () => {
    const getTour = mountWith({ autoFocus: 'primary' });

    await act(async () => {
      getTour().start();
    });

    expect(primary()).toBeNull();
    expect(closeBtn()).not.toBeNull(); // showClose still defaults to true
    expect(document.activeElement).toBe(tooltip());
    expect(document.activeElement).not.toBe(closeBtn());
  });

  it('leaves focus untouched with autoFocus: false', async () => {
    const getTour = mountWith({ showControls: true, autoFocus: false });
    const trigger = document.getElementById('trigger') as HTMLElement;
    trigger.focus();

    await act(async () => {
      getTour().start();
    });

    expect(document.activeElement).toBe(trigger);
    expect(document.activeElement).not.toBe(tooltip());
  });

  it('restores the pre-tour focus on end, in every mode', async () => {
    for (const autoFocus of ['panel', 'primary', false] as const) {
      const getTour = mountWith({ showControls: true, autoFocus });
      const trigger = document.getElementById('trigger') as HTMLElement;
      trigger.focus();

      await act(async () => {
        getTour().start();
      });
      await act(async () => {
        getTour().end();
      });

      expect(document.activeElement, `mode: ${String(autoFocus)}`).toBe(trigger);
      cleanup();
    }
  });

  it('lets a step override the tour-level setting', async () => {
    const getTour = mountWith({ showControls: true, autoFocus: 'primary' }, [
      { target: 'one', content: 'Step one' },
      { target: 'two', content: 'Step two', navigation: { autoFocus: 'panel' } },
    ]);

    await act(async () => {
      getTour().start();
    });
    expect(document.activeElement).toBe(primary());

    await act(async () => {
      getTour().next();
    });
    expect(document.activeElement).toBe(tooltip());
  });

  it('is inert for a step that is not a dialog', async () => {
    const getTour = mountWith({ showClose: false, autoFocus: 'primary' }, [
      { target: 'one', content: 'plain' },
    ]);

    await act(async () => {
      getTour().start();
    });

    expect(tooltip()?.getAttribute('role')).toBe('tooltip');
    expect(document.activeElement).toBe(document.body);
  });
});

describe('unmounting the component that runs the tour', () => {
  /**
   * Render a tour beside a probe of the helper flow, with a way to unmount only the tour
   */
  function mountUnmountable(options: TourOptions, markup: string, sibling?: ReactNode) {
    document.body.innerHTML = markup;
    let tour!: UseTourReturn;
    let flowActive: boolean | undefined;
    let unmountTour!: () => void;

    function FlowProbe() {
      flowActive = useTipMagic().helper.isFlowActive;
      return null;
    }

    function Toggle() {
      const [mounted, setMounted] = useState(true);
      unmountTour = () => setMounted(false);
      return (
        <>
          {mounted && <Harness options={options} onReady={(value) => (tour = value)} />}
          <FlowProbe />
          {sibling}
        </>
      );
    }

    render(
      <TipMagicProvider>
        <Toggle />
      </TipMagicProvider>
    );

    return {
      tour: () => tour,
      flowActive: () => flowActive,
      unmountTour: () =>
        act(async () => {
          unmountTour();
        }),
    };
  }

  it('takes the panel, backdrop and helper flow down without calling onEnd', async () => {
    const onEnd = vi.fn();
    const onExit = vi.fn();
    const api = mountUnmountable(
      { steps: [{ target: 'one', text: 'A', onExit }], focus: true, onEnd },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      api.tour().start();
    });
    expect(count('.tip-magic-tooltip')).toBe(1);
    expect(api.flowActive()).toBe(true);

    await api.unmountTour();

    expect(count('.tip-magic-tooltip')).toBe(0);
    expect(count('.tip-magic-tour-backdrop')).toBe(0);
    expect(count('[data-tip-magic-focus]')).toBe(0);
    expect(api.flowActive()).toBe(false);
    expect(onEnd).not.toHaveBeenCalled();
    expect(onExit).not.toHaveBeenCalled();
  });

  it('reports nothing when the target unmounts with the component', async () => {
    const onEnd = vi.fn();
    const onExit = vi.fn();
    const onTargetMissing = vi.fn();
    let tour!: UseTourReturn;
    let unmountTour!: () => void;

    function TourWithTarget() {
      tour = useTour({
        steps: [{ target: 'inside', text: 'A', onExit }],
        onEnd,
        onTargetMissing,
      });
      return <div data-tip-id="inside">Inside</div>;
    }

    function Toggle() {
      const [mounted, setMounted] = useState(true);
      unmountTour = () => setMounted(false);
      return mounted ? <TourWithTarget /> : null;
    }

    document.body.innerHTML = '';
    render(
      <TipMagicProvider>
        <Toggle />
      </TipMagicProvider>
    );
    act(() => {
      tour.start();
    });
    expect(count('.tip-magic-tooltip')).toBe(1);

    await act(async () => {
      unmountTour();
    });
    await flushMutations();

    expect(count('.tip-magic-tooltip')).toBe(0);
    expect(onTargetMissing).not.toHaveBeenCalled();
    expect(onExit).not.toHaveBeenCalled();
    expect(onEnd).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('leaves a tooltip it does not own alone when the tour is not running', async () => {
    let showOther!: () => void;
    function Shower() {
      const { tooltip: api } = useTipMagic();
      showOther = () => api.show('#other', 'Not the tour');
      return null;
    }

    const api = mountUnmountable(
      { steps: [{ target: 'one', text: 'A' }] },
      '<div data-tip-id="one">One</div><div id="other">Other</div>',
      <Shower />
    );

    act(() => {
      showOther();
    });
    await api.unmountTour();

    expect(tooltip()?.textContent).toContain('Not the tour');
  });
});

describe('StrictMode', () => {
  const STEPS: TourStep[] = [{ target: 'one', title: 'News', text: 'A' }];

  /** Starts the tour once on mount, the way a "show this announcement" guard does */
  function GuardedAutoStart() {
    const tour = useTour({ steps: STEPS, focus: true });
    const startRef = useRef(tour.start);
    startRef.current = tour.start;
    const startedRef = useRef(false);
    useEffect(() => {
      if (startedRef.current) return;
      startedRef.current = true;
      startRef.current();
    }, []);
    return null;
  }

  it('keeps a guarded auto-start tour open through the simulated unmount, and still ends it on a real one', async () => {
    let unmountTour!: () => void;
    function Toggle() {
      const [mounted, setMounted] = useState(true);
      unmountTour = () => setMounted(false);
      return mounted ? <GuardedAutoStart /> : null;
    }

    document.body.innerHTML = '<div data-tip-id="one">One</div>';
    await act(async () => {
      render(
        <StrictMode>
          <TipMagicProvider>
            <Toggle />
          </TipMagicProvider>
        </StrictMode>
      );
    });

    expect(count('.tip-magic-tooltip')).toBe(1);
    expect(count('.tip-magic-tour-backdrop')).toBe(1);
    expect(count('[data-tip-magic-focus]')).toBe(1);

    await act(async () => {
      unmountTour();
    });

    expect(count('.tip-magic-tooltip')).toBe(0);
    expect(count('.tip-magic-tour-backdrop')).toBe(0);
    expect(count('[data-tip-magic-focus]')).toBe(0);
  });
});

describe('panel instances', () => {
  it("never renders the next step's body inside the previous step's panel", async () => {
    const renders: string[] = [];
    let nextInstance = 0;

    /** Records which mounted instance rendered which label */
    function Probe({ label }: { label: string }) {
      const instance = useRef(-1);
      if (instance.current < 0) {
        instance.current = nextInstance++;
      }
      renders.push(`${instance.current}:${label}`);
      return <span className="probe">{label}</span>;
    }

    const getTour = mountTour(
      {
        steps: [
          { target: 'one', body: <Probe label="one" /> },
          { target: 'two', body: <Probe label="two" /> },
        ],
      },
      '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>'
    );

    act(() => {
      getTour().start();
    });

    // Navigate in a transition: the store's re-render is sync, the tooltip's dispatch is
    // not, so they land in different renders
    await act(async () => {
      startTransition(() => {
        getTour().next();
      });
    });

    expect(document.querySelector('.probe')?.textContent).toBe('two');
    const firstInstance = renders.find((entry) => entry.endsWith(':one'))?.split(':')[0];
    expect(renders).not.toContain(`${firstInstance}:two`);
  });
});

const STEPS_MARKUP =
  '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div><div data-tip-id="three">Three</div>';

/** Mount a tour whose steps can be replaced while it runs */
function mountWithSteps(
  steps: TourStep[],
  options: Omit<TourOptions, 'steps'> = {},
  markup = STEPS_MARKUP
) {
  document.body.innerHTML = markup;
  let tour!: UseTourReturn;
  let helperStep: string | undefined;
  const onReady = (value: UseTourReturn) => (tour = value);

  function HelperProbe() {
    helperStep = useTipMagic().helper.currentStep?.targetId;
    return null;
  }

  const ui = (current: TourStep[]) => (
    <TipMagicProvider>
      <Harness options={{ ...options, steps: current }} onReady={onReady} />
      <HelperProbe />
    </TipMagicProvider>
  );
  const { rerender } = render(ui(steps));
  return {
    tour: () => tour,
    helperStep: () => helperStep,
    replaceSteps: (next: TourStep[]) => act(() => rerender(ui(next))),
  };
}

describe('a running tour whose steps change shape', () => {
  const A: TourStep = { target: 'one', text: 'Step A' };
  const B: TourStep = { target: 'two', text: 'Step B' };
  const C: TourStep = { target: 'three', text: 'Step C' };

  const message = () => document.querySelector('.tip-magic-tour-message')?.textContent;

  it('keeps showing the same step when an earlier one is filtered out', () => {
    const onStepChange = vi.fn();
    const api = mountWithSteps([A, B, C], { onStepChange });
    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().next();
    });
    expect(message()).toBe('Step B');

    api.replaceSteps([B, C]);

    expect(message()).toBe('Step B');
    expect(api.tour().currentStep).toMatchObject({ index: 0, target: 'two' });
    expect(onStepChange).toHaveBeenCalledTimes(2);

    act(() => {
      api.tour().next();
    });
    expect(message()).toBe('Step C');
  });

  it('moves on to the step now at its place, as a navigation, when the shown step is removed', () => {
    const onStepChange = vi.fn();
    const onExit = vi.fn();
    const api = mountWithSteps([A, { ...B, onExit }, C], { onStepChange });
    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().next();
    });

    api.replaceSteps([A, C]);

    expect(message()).toBe('Step C');
    expect(api.tour().currentStep).toMatchObject({ index: 1, target: 'three' });
    expect(onExit).toHaveBeenCalledTimes(1);
    expect(onStepChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ target: 'three' }),
      'next'
    );
  });

  it('ends the tour when the steps shrink below the shown step', () => {
    const onEnd = vi.fn();
    const api = mountWithSteps([A, B, C], { onEnd, focus: true });
    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().goTo(2);
    });

    api.replaceSteps([A, B]);

    expect(api.tour().isActive).toBe(false);
    expect(onEnd).toHaveBeenCalledWith(false);
    expect(count('.tip-magic-tooltip')).toBe(0);
    expect(count('.tip-magic-tour-backdrop')).toBe(0);
  });

  it('labels the dialog by a title that appears while the step is shown', () => {
    const api = mountWithSteps([A]);
    act(() => {
      api.tour().start();
    });
    const messageId = tooltip()?.getAttribute('aria-labelledby');
    expect(document.getElementById(messageId!)?.textContent).toBe('Step A');

    api.replaceSteps([{ ...A, title: 'Hello' }]);

    const labelId = tooltip()?.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toBe('Hello');
  });
});

describe('one tour replacing another', () => {
  it('does not hide the next tour when both show the same text and it starts in a layout effect', async () => {
    let showB!: () => void;
    let tourA!: UseTourReturn;

    function TourA() {
      tourA = useTour({
        steps: [{ target: 'one', text: 'Saved' }],
        navigation: { showClose: false },
      });
      return null;
    }

    /** Starts before paint, so the announcement never flickers */
    function TourB() {
      const tour = useTour({
        steps: [{ target: 'two', text: 'Saved' }],
        navigation: { showClose: false },
      });
      const startRef = useRef(tour.start);
      startRef.current = tour.start;
      useLayoutEffect(() => {
        startRef.current();
      }, []);
      return null;
    }

    function Route() {
      const [route, setRoute] = useState<'a' | 'b'>('a');
      showB = () => setRoute('b');
      return route === 'a' ? <TourA /> : <TourB />;
    }

    document.body.innerHTML = '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>';
    render(
      <TipMagicProvider>
        <Route />
      </TipMagicProvider>
    );
    act(() => {
      tourA.start();
    });

    await act(async () => {
      showB();
    });

    expect(tooltip()?.textContent).toBe('Saved');
  });

  it("does not take down the next tour's panel or flow when the previous one unmounts", async () => {
    let flowActive: boolean | undefined;
    let showB!: () => void;
    let tourA!: UseTourReturn;

    function FlowProbe() {
      flowActive = useTipMagic().helper.isFlowActive;
      return null;
    }

    function TourA() {
      tourA = useTour({ steps: [{ target: 'one', text: 'Tour A' }], focus: true });
      return null;
    }

    /** Starts on mount, the way a route's announcement does */
    function TourB() {
      const tour = useTour({ steps: [{ target: 'two', text: 'Tour B' }] });
      const startRef = useRef(tour.start);
      startRef.current = tour.start;
      useEffect(() => {
        startRef.current();
      }, []);
      return null;
    }

    function Route() {
      const [route, setRoute] = useState<'a' | 'b'>('a');
      showB = () => setRoute('b');
      return (
        <>
          {route === 'a' ? <TourA /> : <TourB />}
          <FlowProbe />
        </>
      );
    }

    document.body.innerHTML = '<div data-tip-id="one">One</div><div data-tip-id="two">Two</div>';
    render(
      <TipMagicProvider>
        <Route />
      </TipMagicProvider>
    );
    act(() => {
      tourA.start();
    });

    await act(async () => {
      showB();
    });

    expect(tooltip()?.textContent).toContain('Tour B');
    expect(flowActive).toBe(true);
    // Tour A's own DOM state is still cleaned up
    expect(count('.tip-magic-tour-backdrop')).toBe(0);
  });
});

describe('steps that share a target', () => {
  const first: TourStep = { target: 'one', text: 'First tip on one' };
  const second: TourStep = { target: 'one', text: 'Second tip on one' };
  const other: TourStep = { target: 'two', text: 'Inserted' };
  const message = () => document.querySelector('.tip-magic-tour-message')?.textContent;

  it('follows a step by its id through an insertion ahead of it', () => {
    const onStepChange = vi.fn();
    const api = mountWithSteps(
      [
        { ...first, id: 'first' },
        { ...second, id: 'second' },
      ],
      { onStepChange }
    );
    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().next();
    });

    api.replaceSteps([other, { ...first, id: 'first' }, { ...second, id: 'second' }]);

    expect(message()).toBe('Second tip on one');
    expect(api.tour().currentStep?.index).toBe(2);
    expect(onStepChange).toHaveBeenCalledTimes(2);
  });

  it('does not guess between steps on the same target: it shows the step now at its place, as a navigation', () => {
    const onStepChange = vi.fn();
    const api = mountWithSteps([first, second], { onStepChange });
    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().next();
    });

    api.replaceSteps([other, first, second]);

    expect(message()).toBe('First tip on one');
    expect(api.tour().currentStep?.index).toBe(1);
    expect(onStepChange).toHaveBeenCalledTimes(3);
    expect(onStepChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 1, target: 'one' }),
      'next'
    );
  });
});

describe('the step on screen after its steps change', () => {
  it('moves the tooltip when its placement changes', async () => {
    const api = mountWithSteps([{ target: 'one', text: 'A', placement: 'top' }]);
    await act(async () => {
      api.tour().start();
    });
    const panel = document.querySelector('.tip-magic-tour-content');

    api.replaceSteps([{ target: 'one', text: 'A', placement: 'right' }]);
    // Floating UI positions asynchronously
    await flushMutations();

    expect(tooltip()?.getAttribute('data-placement')).toMatch(/^right/);
    expect(document.querySelector('.tip-magic-tour-content')).toBe(panel);
  });

  it('updates the text of a step shown as a plain tooltip', () => {
    const api = mountWithSteps([{ target: 'one', text: 'Loading...' }], {
      navigation: { showClose: false },
    });
    act(() => {
      api.tour().start();
    });

    api.replaceSteps([{ target: 'one', text: 'Ready' }]);

    expect(tooltip()?.textContent).toBe('Ready');
    expect(tooltip()?.getAttribute('role')).toBe('tooltip');
  });

  it('applies a changed maxWidth', () => {
    const api = mountWithSteps([{ target: 'one', text: 'A' }]);
    act(() => {
      api.tour().start();
    });

    api.replaceSteps([{ target: 'one', text: 'A', tooltipOptions: { maxWidth: 480 } }]);

    expect(tooltip()?.style.maxWidth).toBe('480px');
  });

  it('keeps the helper flow on the step on screen', () => {
    const A: TourStep = { target: 'one', text: 'Step A' };
    const B: TourStep = { target: 'two', text: 'Step B' };
    const C: TourStep = { target: 'three', text: 'Step C' };
    const api = mountWithSteps([A, B, C]);
    act(() => {
      api.tour().start();
    });
    act(() => {
      api.tour().next();
    });
    expect(api.helperStep()).toBe('two');

    api.replaceSteps([B, C]);

    expect(api.helperStep()).toBe('two');
  });
});

describe('accessible names', () => {
  it('names a dialog with no title by its message', () => {
    const getTour = mountTour(
      {
        steps: [{ target: 'one', body: <p>Release notes</p> }],
        navigation: { showClose: false },
      },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const labelId = tooltip()?.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)?.textContent).toBe('Release notes');
  });

  it('names a titled dialog by its title', () => {
    const getTour = mountTour(
      { steps: [{ target: 'one', title: 'News', body: <p>Release notes</p> }] },
      '<div data-tip-id="one">One</div>'
    );

    act(() => {
      getTour().start();
    });

    const labelId = tooltip()?.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId!)?.textContent).toBe('News');
  });
});

describe('a first step with nothing to show', () => {
  it.each([
    ['null', null],
    ['an empty fragment', <></>],
    ['an empty array', []],
    [
      'a fragment of nothing',
      <>
        {false}
        {''}
      </>,
    ],
  ])('does not start for a body of %s', (_name, value) => {
    const onStart = vi.fn();
    const getTour = mountTour(
      {
        steps: [{ target: 'one', body: () => value }],
        navigation: { showClose: false },
        onStart,
      },
      '<div data-tip-id="one">One</div>'
    );

    let started: boolean | undefined;
    act(() => {
      started = getTour().start();
    });

    expect(started).toBe(false);
    expect(getTour().isActive).toBe(false);
    expect(onStart).not.toHaveBeenCalled();
    expect(count('.tip-magic-tooltip')).toBe(0);
  });
});
