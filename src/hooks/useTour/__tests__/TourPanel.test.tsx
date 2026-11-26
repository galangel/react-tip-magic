import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CurrentTourStep, TourNavigation, TourStep } from '../../../types/tour';
import { DEFAULT_NAVIGATION } from '../constants';
import { LiveTourPanel, TourPanel, type TourPanelProps } from '../TourPanel';
import { createTourPanelStore, DEFAULT_PROGRESS, type ResolvedProgressOptions } from '../utils';

afterEach(() => {
  cleanup();
});

const STEP: TourStep = { target: 'step1', text: 'Message' };

/** Second of three steps unless overridden */
const STEP_INFO: CurrentTourStep = {
  index: 1,
  target: 'step1',
  content: 'Message',
  isFirst: false,
  isLast: false,
  total: 3,
};

function renderPanel(overrides: Partial<TourPanelProps> = {}) {
  const props: TourPanelProps = {
    step: STEP,
    stepInfo: STEP_INFO,
    navigation: DEFAULT_NAVIGATION,
    body: { kind: 'text', value: 'Message' },
    progress: DEFAULT_PROGRESS,
    ...overrides,
  };
  return render(<TourPanel {...props} />).container;
}

const withNav = (navigation: Partial<TourNavigation>): Required<TourNavigation> => ({
  ...DEFAULT_NAVIGATION,
  ...navigation,
});

const withProgress = (progress: Partial<ResolvedProgressOptions>): ResolvedProgressOptions => ({
  ...DEFAULT_PROGRESS,
  show: true,
  ...progress,
});

const query = (container: HTMLElement, selector: string) =>
  container.querySelector<HTMLElement>(selector);

describe('TourPanel', () => {
  describe('header', () => {
    it('renders the title with the supplied id, and the close button', () => {
      const container = renderPanel({
        step: { ...STEP, title: 'Welcome' },
        titleId: 'tour-title-1',
      });

      const title = query(container, '.tip-magic-tour-title');
      expect(title?.textContent).toBe('Welcome');
      expect(title?.id).toBe('tour-title-1');

      const close = query(container, '.tip-magic-tour-close');
      expect(close?.getAttribute('data-tour-action')).toBe('close');
      expect(close?.getAttribute('aria-label')).toBe('Close');
    });

    it('labels the close button with closeLabel', () => {
      const container = renderPanel({ navigation: withNav({ closeLabel: 'Dismiss' }) });

      expect(query(container, '.tip-magic-tour-close')?.getAttribute('aria-label')).toBe('Dismiss');
    });

    it('omits the id when none is supplied', () => {
      const container = renderPanel({ step: { ...STEP, title: 'Welcome' } });

      expect(query(container, '.tip-magic-tour-title')?.hasAttribute('id')).toBe(false);
    });

    it('renders the title as text', () => {
      const container = renderPanel({ step: { ...STEP, title: '<img class="raw" />' } });

      expect(query(container, '.raw')).toBeNull();
      expect(query(container, '.tip-magic-tour-title')?.textContent).toBe('<img class="raw" />');
    });

    it('keeps the close button on the right when there is no title', () => {
      const container = renderPanel();

      const header = query(container, '.tip-magic-tour-header');
      expect(header?.children).toHaveLength(2);
      expect(header?.lastElementChild?.className).toBe('tip-magic-tour-close');
    });

    it('renders no header without a title or close button', () => {
      const container = renderPanel({ navigation: withNav({ showClose: false }) });

      expect(query(container, '.tip-magic-tour-header')).toBeNull();
    });
  });

  describe('media', () => {
    it('renders an image', () => {
      const container = renderPanel({ step: { ...STEP, image: 'pic.gif' } });

      const image = query(container, '.tip-magic-tour-image img') as HTMLImageElement;
      expect(image.getAttribute('src')).toBe('pic.gif');
      expect(image.getAttribute('alt')).toBe('');
    });

    it('renders a native video that autoplays, loops and is muted by default', () => {
      const container = renderPanel({ step: { ...STEP, video: { src: 'clip.mp4' } } });

      const video = query(container, '.tip-magic-tour-video video') as HTMLVideoElement;
      expect(video.autoplay).toBe(true);
      expect(video.loop).toBe(true);
      expect(video.muted).toBe(true);
      // iOS Safari's autoplay policy reads the attribute, which React never writes
      expect(video.hasAttribute('muted')).toBe(true);
      expect(video.defaultMuted).toBe(true);
      expect(video.hasAttribute('playsinline')).toBe(true);
      expect(video.querySelector('source')?.getAttribute('src')).toBe('clip.mp4');
      expect(query(container, '.tip-magic-tour-video-embed')).toBeNull();
    });

    it('honours the native video flags', () => {
      const container = renderPanel({
        step: { ...STEP, video: { src: 'clip.mp4', autoplay: false, loop: false, muted: false } },
      });

      const video = query(container, 'video') as HTMLVideoElement;
      expect(video.autoplay).toBe(false);
      expect(video.loop).toBe(false);
      expect(video.muted).toBe(false);
      expect(video.hasAttribute('muted')).toBe(false);
    });

    it('drops the muted attribute when the same video is unmuted', () => {
      const props: TourPanelProps = {
        step: { ...STEP, video: { src: 'clip.mp4' } },
        stepInfo: STEP_INFO,
        navigation: DEFAULT_NAVIGATION,
        body: { kind: 'text', value: 'Message' },
        progress: DEFAULT_PROGRESS,
      };
      const { container, rerender } = render(<TourPanel {...props} />);
      const video = query(container, 'video') as HTMLVideoElement;
      expect(video.hasAttribute('muted')).toBe(true);

      rerender(
        <TourPanel {...props} step={{ ...STEP, video: { src: 'clip.mp4', muted: false } }} />
      );

      expect(query(container, 'video')).toBe(video);
      expect(video.hasAttribute('muted')).toBe(false);
      expect(video.defaultMuted).toBe(false);
      expect(video.muted).toBe(false);

      rerender(<TourPanel {...props} />);

      expect(video.hasAttribute('muted')).toBe(true);
    });

    it('renders an embed in an iframe with a semicolon-separated allow list', () => {
      const container = renderPanel({
        step: { ...STEP, video: { src: 'https://example.com/v', type: 'embed' } },
      });

      const iframe = query(container, '.tip-magic-tour-video.tip-magic-tour-video-embed iframe');
      expect(iframe?.getAttribute('src')).toBe('https://example.com/v');
      expect(iframe?.getAttribute('allow')).toMatch(/^accelerometer; autoplay;/);
      expect(iframe?.hasAttribute('allowfullscreen')).toBe(true);
    });

    it('gives an embed an accessible name, defaulting to "Tour video"', () => {
      const container = renderPanel({
        step: { ...STEP, video: { src: 'https://example.com/v', type: 'embed' } },
      });
      expect(query(container, 'iframe')?.getAttribute('title')).toBe('Tour video');

      cleanup();
      const titled = renderPanel({
        step: {
          ...STEP,
          video: { src: 'https://example.com/v', type: 'embed', title: 'Setting up alerts' },
        },
      });
      expect(query(titled, 'iframe')?.getAttribute('title')).toBe('Setting up alerts');
    });

    it('prefers a video over an image', () => {
      const container = renderPanel({
        step: { ...STEP, image: 'pic.gif', video: { src: 'clip.mp4' } },
      });

      expect(query(container, '.tip-magic-tour-image')).toBeNull();
      expect(query(container, 'video')).not.toBeNull();
    });

    it('keeps a src inside its attribute', () => {
      const container = renderPanel({ step: { ...STEP, image: 'x.png" onerror="alert(1)' } });

      const image = query(container, 'img');
      expect(image?.hasAttribute('onerror')).toBe(false);
      expect(image?.getAttribute('src')).toBe('x.png" onerror="alert(1)');
    });

    it('renders no media for a step without any', () => {
      const container = renderPanel();

      expect(query(container, '.tip-magic-tour-image, .tip-magic-tour-video')).toBeNull();
    });
  });

  describe('message', () => {
    it('renders text as text', () => {
      const container = renderPanel({ body: { kind: 'text', value: 'Tom & <b>Jerry</b>' } });

      const message = query(container, '.tip-magic-tour-body > .tip-magic-tour-message');
      expect(message?.textContent).toBe('Tom & <b>Jerry</b>');
      expect(message?.querySelector('b')).toBeNull();
    });

    it('puts the supplied id on the message, for the panel to be labelled by', () => {
      const text = renderPanel({ messageId: 'tour-message-1' });
      expect(query(text, '.tip-magic-tour-message')?.id).toBe('tour-message-1');

      cleanup();
      const html = renderPanel({
        messageId: 'tour-message-1',
        body: { kind: 'html', value: '<b>bold</b>' },
      });
      expect(query(html, '.tip-magic-tour-message')?.id).toBe('tour-message-1');
    });

    it('injects html content as HTML', () => {
      const container = renderPanel({ body: { kind: 'html', value: '<b class="raw">bold</b>' } });

      expect(query(container, '.tip-magic-tour-message .raw')?.textContent).toBe('bold');
    });

    it('renders a React body, and keeps its event handlers', () => {
      const onClick = vi.fn();
      const container = renderPanel({
        body: {
          kind: 'node',
          value: (
            <p>
              Read the <em>notes</em>, then{' '}
              <button type="button" onClick={onClick}>
                act
              </button>
            </p>
          ),
        },
      });

      const message = query(container, '.tip-magic-tour-message');
      expect(message?.querySelector('em')?.textContent).toBe('notes');

      fireEvent.click(message?.querySelector('button') as HTMLElement);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('navigation', () => {
    it('renders no buttons but Close when controls are off', () => {
      const container = renderPanel();

      expect(query(container, '.tip-magic-tour-nav')).toBeNull();
      expect(container.querySelectorAll('button')).toHaveLength(1);
    });

    it('renders only Next on the first step', () => {
      const container = renderPanel({
        stepInfo: { ...STEP_INFO, index: 0, isFirst: true },
        navigation: withNav({ showControls: true }),
      });

      expect(query(container, '.tip-magic-tour-btn-back')).toBeNull();
      const next = query(container, '.tip-magic-tour-btn.tip-magic-tour-btn-next');
      expect(next?.textContent).toBe('Next');
      expect(next?.getAttribute('data-tour-action')).toBe('next');
    });

    it('renders Back and Next on a middle step', () => {
      const container = renderPanel({ navigation: withNav({ showControls: true }) });

      const back = query(container, '.tip-magic-tour-btn.tip-magic-tour-btn-back');
      expect(back?.textContent).toBe('Back');
      expect(back?.getAttribute('data-tour-action')).toBe('prev');
      expect(query(container, '.tip-magic-tour-btn-next')?.textContent).toBe('Next');
    });

    it('renders Finish on the last step', () => {
      const container = renderPanel({
        stepInfo: { ...STEP_INFO, index: 2, isLast: true },
        navigation: withNav({ showControls: true }),
      });

      const finish = query(container, '.tip-magic-tour-btn-next');
      expect(finish?.textContent).toBe('Finish');
      expect(finish?.getAttribute('data-tour-action')).toBe('finish');
    });

    it('renders custom labels as text', () => {
      const container = renderPanel({
        navigation: withNav({ showControls: true, nextLabel: '<b>Go</b>', backLabel: '<i>Up</i>' }),
      });

      const next = query(container, '.tip-magic-tour-btn-next');
      expect(next?.textContent).toBe('<b>Go</b>');
      expect(next?.querySelector('b')).toBeNull();
      expect(query(container, '.tip-magic-tour-btn-back')?.textContent).toBe('<i>Up</i>');
    });

    it('renders a custom finish label as text', () => {
      const container = renderPanel({
        stepInfo: { ...STEP_INFO, index: 2, isLast: true },
        navigation: withNav({ showControls: true, finishLabel: '<b>Done</b>' }),
      });

      expect(query(container, '.tip-magic-tour-btn-next')?.textContent).toBe('<b>Done</b>');
    });

    it('gives every button an explicit type', () => {
      const container = renderPanel({ navigation: withNav({ showControls: true }) });

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(3);
      buttons.forEach((button) => expect(button.getAttribute('type')).toBe('button'));
    });
  });

  describe('primary action marker', () => {
    it('marks Next and nothing else', () => {
      const container = renderPanel({ navigation: withNav({ showControls: true }) });

      const marked = container.querySelectorAll('[data-tip-magic-primary]');
      expect(marked).toHaveLength(1);
      expect(marked[0].getAttribute('data-tour-action')).toBe('next');
    });

    it('marks Finish on the last step', () => {
      const container = renderPanel({
        stepInfo: { ...STEP_INFO, index: 2, isLast: true },
        navigation: withNav({ showControls: true }),
      });

      expect(query(container, '[data-tip-magic-primary]')?.getAttribute('data-tour-action')).toBe(
        'finish'
      );
    });

    it('never marks Close, even when it is the only button', () => {
      const container = renderPanel();

      expect(query(container, '.tip-magic-tour-close')).not.toBeNull();
      expect(query(container, '[data-tip-magic-primary]')).toBeNull();
    });
  });

  describe('progress', () => {
    it('renders no footer without progress or controls', () => {
      const container = renderPanel();

      expect(query(container, '.tip-magic-tour-footer')).toBeNull();
    });

    it('renders the nav without a footer when there is no progress', () => {
      const container = renderPanel({ navigation: withNav({ showControls: true }) });

      expect(query(container, '.tip-magic-tour-footer')).toBeNull();
      expect(query(container, '.tip-magic-tour-content > .tip-magic-tour-nav')).not.toBeNull();
    });

    it('renders step text progress in a footer', () => {
      const container = renderPanel({ progress: withProgress({}) });

      const progress = query(container, '.tip-magic-tour-footer > .tip-magic-tour-progress');
      expect(progress?.textContent).toBe('Step 2 of 3');
      expect(query(container, '.tip-magic-tour-nav')).toBeNull();
    });

    it('renders progress and the nav together in the footer', () => {
      const container = renderPanel({
        navigation: withNav({ showControls: true }),
        progress: withProgress({}),
      });

      const footer = query(container, '.tip-magic-tour-footer');
      expect(footer?.children[0].className).toBe('tip-magic-tour-progress');
      expect(footer?.children[1].className).toBe('tip-magic-tour-nav');
    });

    it('renders a ring', () => {
      const container = renderPanel({ progress: withProgress({ type: 'ring' }) });

      const ring = query(container, '.tip-magic-tour-progress-ring');
      expect(ring?.querySelector('.tip-magic-tour-progress-ring-bg')).not.toBeNull();
      expect(ring?.querySelector('.tip-magic-tour-progress-ring-text')?.textContent).toBe('2/3');

      const fill = ring?.querySelector('.tip-magic-tour-progress-ring-fill');
      const circumference = Number(fill?.getAttribute('stroke-dasharray'));
      expect(Number(fill?.getAttribute('stroke-dashoffset'))).toBeCloseTo(circumference / 3);
    });

    it('injects a custom render as HTML, ahead of the built-in types', () => {
      const render = vi.fn(
        ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) =>
          `<span class="custom">${currentStep}-${totalSteps}</span>`
      );
      const container = renderPanel({ progress: withProgress({ type: 'ring', render }) });

      expect(render).toHaveBeenCalledWith({ currentStep: 2, totalSteps: 3 });
      expect(query(container, '.tip-magic-tour-footer .custom')?.textContent).toBe('2-3');
      expect(query(container, '.tip-magic-tour-progress-ring')).toBeNull();
    });
  });
});

describe('LiveTourPanel', () => {
  const propsWith = (text: string): TourPanelProps => ({
    step: STEP,
    stepInfo: STEP_INFO,
    navigation: DEFAULT_NAVIGATION,
    body: { kind: 'text', value: text },
    progress: DEFAULT_PROGRESS,
  });

  it('re-renders the same panel when the store is set', () => {
    const store = createTourPanelStore();
    store.set(propsWith('Before'));
    const { container } = render(<LiveTourPanel store={store} />);
    const panel = query(container, '.tip-magic-tour-content');

    act(() => {
      store.set(propsWith('After'));
    });

    expect(query(container, '.tip-magic-tour-message')?.textContent).toBe('After');
    expect(query(container, '.tip-magic-tour-content')).toBe(panel);
  });
});

describe('a panel sized by its media', () => {
  const content = (container: HTMLElement) =>
    container.querySelector('.tip-magic-tour-content') as HTMLElement;

  it('marks itself, and stays marked loading until the image has loaded', () => {
    const container = renderPanel({ step: { ...STEP, image: 'pic.png' }, fitMedia: true });

    expect(content(container).hasAttribute('data-tip-magic-media-fit')).toBe(true);
    expect(content(container).hasAttribute('data-tip-magic-media-loading')).toBe(true);

    fireEvent.load(query(container, 'img') as HTMLElement);

    expect(content(container).hasAttribute('data-tip-magic-media-loading')).toBe(false);
  });

  it('stops loading when the image fails, rather than staying hidden', () => {
    const container = renderPanel({ step: { ...STEP, image: 'missing.png' }, fitMedia: true });

    fireEvent.error(query(container, 'img') as HTMLElement);

    expect(content(container).hasAttribute('data-tip-magic-media-loading')).toBe(false);
  });

  it("waits for a native video's metadata", () => {
    const container = renderPanel({
      step: { ...STEP, video: { src: 'clip.mp4' } },
      fitMedia: true,
    });
    expect(content(container).hasAttribute('data-tip-magic-media-loading')).toBe(true);

    fireEvent.loadedMetadata(query(container, 'video') as HTMLElement);

    expect(content(container).hasAttribute('data-tip-magic-media-loading')).toBe(false);
  });

  it('loads again when the image changes in place', () => {
    const props: TourPanelProps = {
      step: { ...STEP, image: 'one.png' },
      stepInfo: STEP_INFO,
      navigation: DEFAULT_NAVIGATION,
      body: { kind: 'text', value: 'Message' },
      progress: DEFAULT_PROGRESS,
      fitMedia: true,
    };
    const { container, rerender } = render(<TourPanel {...props} />);
    fireEvent.load(query(container, 'img') as HTMLElement);

    rerender(<TourPanel {...props} step={{ ...STEP, image: 'two.png' }} />);

    expect(content(container).hasAttribute('data-tip-magic-media-loading')).toBe(true);
  });

  it('passes an explicit width cap to the stylesheet', () => {
    const container = renderPanel({
      step: { ...STEP, image: 'pic.png' },
      fitMedia: true,
      mediaMaxWidth: 600,
    });

    expect(content(container).style.getPropertyValue('--tip-magic-tour-media-max-width')).toBe(
      '600px'
    );
  });

  it('marks a panel that is nothing but its media', () => {
    const mediaOnly = renderPanel({
      step: { video: { src: 'clip.mp4' } },
      body: { kind: 'html', value: '' },
      fitMedia: true,
    });
    expect(content(mediaOnly).hasAttribute('data-tip-magic-media-only')).toBe(true);

    cleanup();
    const withText = renderPanel({ step: { ...STEP, image: 'pic.png' }, fitMedia: true });
    expect(content(withText).hasAttribute('data-tip-magic-media-only')).toBe(false);
  });

  it('renders nothing but the media for a panel that is only media', () => {
    const container = renderPanel({
      step: { video: { src: 'clip.mp4' } },
      body: { kind: 'html', value: '' },
      navigation: withNav({ showClose: false }),
      fitMedia: true,
    });

    expect(Array.from(content(container).children).map((child) => child.className)).toEqual([
      'tip-magic-tour-video',
    ]);
    expect(query(container, '.tip-magic-tour-header')).toBeNull();
    expect(query(container, '.tip-magic-tour-body, .tip-magic-tour-message')).toBeNull();
    expect(query(container, '.tip-magic-tour-footer, .tip-magic-tour-nav')).toBeNull();
  });

  it('leaves a panel that is not sized by its media unmarked', () => {
    const container = renderPanel({ step: { ...STEP, image: 'pic.png' } });

    expect(content(container).hasAttribute('data-tip-magic-media-fit')).toBe(false);
    expect(content(container).hasAttribute('data-tip-magic-media-loading')).toBe(false);
  });
});

describe('media placement', () => {
  const content = (container: HTMLElement) =>
    container.querySelector('.tip-magic-tour-content') as HTMLElement;

  it.each(['left', 'right'] as const)('marks a panel with its media to the %s', (placement) => {
    const container = renderPanel({
      step: { ...STEP, title: 'News', image: 'pic.png' },
      mediaPlacement: placement,
    });

    expect(content(container).getAttribute('data-tip-magic-media-placement')).toBe(placement);
  });

  it('leaves a panel with its media on top unmarked', () => {
    const container = renderPanel({ step: { ...STEP, image: 'pic.png' }, mediaPlacement: 'top' });

    expect(content(container).hasAttribute('data-tip-magic-media-placement')).toBe(false);
  });

  it('passes an explicit width cap to the stylesheet for media beside the text', () => {
    const container = renderPanel({
      step: { ...STEP, image: 'pic.png' },
      mediaPlacement: 'left',
      mediaMaxWidth: 700,
    });

    expect(content(container).style.getPropertyValue('--tip-magic-tour-media-max-width')).toBe(
      '700px'
    );
  });
});
