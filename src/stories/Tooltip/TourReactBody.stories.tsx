import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTour } from '../../hooks/useTour';
import '../../styles/index.css';
import './tooltip-stories.css';

/**
 * A step's `body` takes any React node - here, a long announcement rendered by a
 * component with its own state and event handlers.
 *
 * Start the tour: the body scrolls once it reaches `--tip-magic-tour-body-max-height`
 * (`60vh` by default) while the header and footer stay put, and the panel shrinks the body
 * further when there is less room beside the target. Resize the window to see it. The
 * "Helpful?" button is an ordinary React `onClick`.
 */
const meta: Meta = {
  title: 'The Tourtip/React body',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
    options: { panelPosition: 'right' },
    viewMode: 'story',
  },
};

export default meta;

type Story = StoryObj<{ sections: number }>;

const RELEASE_SECTIONS = [
  {
    heading: 'Faster search',
    items: ['Results stream in as they are found', 'Recent queries are one click away'],
  },
  {
    heading: 'Saved views',
    items: ['Pin a filtered view to the sidebar', 'Share it with a link'],
  },
  {
    heading: 'Alerts',
    items: ['Snooze an alert for an hour, a day or a week', 'Group alerts by service'],
  },
  {
    heading: 'Keyboard shortcuts',
    items: ['Press ? anywhere to list them', 'Rebind any of them in settings'],
  },
  {
    heading: 'Accessibility',
    items: ['Every chart has a table view', 'Reduced motion is respected everywhere'],
  },
];

function ReleaseNotes({ sections }: { sections: number }) {
  const [votes, setVotes] = useState(0);

  return (
    <div className="tour-react-body-notes">
      <p>
        Here is everything that changed this month. <strong>Scroll</strong> for the rest.
      </p>
      {Array.from({ length: sections }, (_, index) => {
        const section = RELEASE_SECTIONS[index % RELEASE_SECTIONS.length];
        return (
          <section key={index}>
            <h4>{section.heading}</h4>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        );
      })}
      <button type="button" onClick={() => setVotes((count) => count + 1)}>
        Helpful? ({votes})
      </button>
    </div>
  );
}

function Demo({ sections }: { sections: number }) {
  const tour = useTour({
    steps: [
      {
        target: 'whats-new',
        title: "What's new",
        body: <ReleaseNotes sections={sections} />,
      },
    ],
    navigation: { showControls: true, finishLabel: 'Got it' },
    tooltipOptions: { maxWidth: 360 },
  });

  return (
    <div className="tour-react-body-demo">
      <span className="tour-react-body-target" data-tip-id="whats-new">
        What&apos;s new
      </span>
      <button type="button" onClick={() => tour.start()}>
        Show the announcement
      </button>
    </div>
  );
}

/**
 * Raise `sections` in the controls panel to make the body longer.
 */
export const ReactBody: Story = {
  args: { sections: 10 },
  argTypes: {
    sections: {
      control: { type: 'range', min: 1, max: 30 },
      description: 'How many sections the announcement has',
    },
  },
  render: (args) => (
    <TipMagicProvider>
      <Demo sections={args.sections} />
    </TipMagicProvider>
  ),
};
