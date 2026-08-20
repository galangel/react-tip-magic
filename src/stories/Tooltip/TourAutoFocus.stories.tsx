import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTour } from '../../hooks/useTour';
import type { TourAutoFocus } from '../../types';
import '../../styles/index.css';
import './tooltip-stories.css';

/**
 * `navigation.autoFocus` decides where keyboard focus lands when a tour step opens.
 *
 * Start the tour, then press <kbd>Enter</kbd> without touching the mouse. With the
 * default `'panel'` nothing happens until you Tab to a control; with `'primary'` the tour
 * advances. The readout under the buttons shows what actually holds focus.
 *
 * - `'panel'` — the tour panel itself (default). The dialog is announced, Escape works.
 * - `'primary'` — the step's main action, so Enter advances the tour.
 * - `false` — focus is left alone. Nothing is announced; use only if you move focus yourself.
 */
const meta: Meta = {
  title: 'The Tourtip/autoFocus',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
    options: { panelPosition: 'right' },
    viewMode: 'story',
  },
};

export default meta;

type Story = StoryObj<{ autoFocus: TourAutoFocus }>;

/** Describe an element well enough to tell the three modes apart */
function describeElement(element: Element | null): string {
  if (!element || element === document.body) return 'nothing (document.body)';
  if (element.classList.contains('tip-magic-tooltip')) return 'the tour panel';
  const action = element.getAttribute('data-tour-action');
  if (action) return `the "${element.textContent?.trim()}" button (${action})`;
  return `<${element.tagName.toLowerCase()}> ${element.textContent?.trim() ?? ''}`.trim();
}

function FocusReadout() {
  const [focused, setFocused] = useState('nothing (document.body)');

  useEffect(() => {
    const update = () => setFocused(describeElement(document.activeElement));
    update();
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, []);

  return (
    <p className="tour-autofocus-readout">
      Focus is on: <strong>{focused}</strong>
    </p>
  );
}

function Demo({ autoFocus }: { autoFocus: TourAutoFocus }) {
  const tour = useTour({
    steps: [
      { target: 'inbox', title: 'Inbox', content: 'Everything lands here first.' },
      { target: 'filters', title: 'Filters', content: 'Narrow things down.' },
      { target: 'settings', title: 'Settings', content: 'Tune it to taste.' },
    ],
    navigation: { showControls: true, autoFocus },
    progress: { show: true },
  });

  return (
    <div className="tour-autofocus-demo">
      <nav className="tour-autofocus-bar">
        <span data-tip-id="inbox">Inbox</span>
        <span data-tip-id="filters">Filters</span>
        <span data-tip-id="settings">Settings</span>
      </nav>

      <button type="button" onClick={() => tour.start()}>
        Start tour ({String(autoFocus)})
      </button>

      <FocusReadout />

      <p className="tour-autofocus-hint">
        Start the tour, then press Enter without using the mouse.
      </p>
    </div>
  );
}

/**
 * Switch `autoFocus` in the controls panel and compare what Enter does.
 */
export const AutoFocus: Story = {
  args: { autoFocus: 'panel' },
  argTypes: {
    autoFocus: {
      control: 'radio',
      options: ['panel', 'primary', false],
      description: 'Where focus lands when a step opens',
    },
  },
  render: (args) => (
    <TipMagicProvider>
      <Demo autoFocus={args.autoFocus} />
    </TipMagicProvider>
  ),
};
