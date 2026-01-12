import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTour } from '../../hooks/useTour';
import '../../styles/index.css';
import './tooltip-stories.css';

/**
 * The Tour Tooltip from React Tip Magic provides guided tour experiences
 * with rich content including titles, images, videos, navigation controls,
 * and progress indicators.
 *
 * ## Features
 * - **Built-in navigation**: Next, Back, Close buttons with custom labels
 * - **Media support**: Images, GIFs, embedded videos (YouTube/Vimeo), native videos
 * - **Focus mode**: Backdrop overlay to highlight the target element
 * - **Progress indicators**: Steps text or circular ring progress
 * - **Per-step overrides**: Customize navigation and focus per step
 * - **TypeScript support**: Full type safety with `useTour()` hook
 */
const meta: Meta = {
  title: 'The Tourtip',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
    options: {
      panelPosition: 'right',
    },
    // Open controls panel by default
    viewMode: 'story',
    previewTabs: {
      'storybook/docs/panel': { hidden: true },
    },
  },
};

export default meta;

// Predefined media options for the select control
const MEDIA_OPTIONS = {
  none: { image: undefined, video: undefined },
  image: {
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    video: undefined,
  },
  gif: {
    image: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
    video: undefined,
  },
  youtube: {
    image: undefined,
    video: {
      src: 'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1&mute=1',
      type: 'embed' as const,
    },
  },
  mp4: {
    image: undefined,
    video: {
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      type: 'native' as const,
    },
  },
};

type MediaType = keyof typeof MEDIA_OPTIONS;

interface TourtipArgs {
  // Content
  title: string;
  content: string;
  placement:
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'right';
  // Navigation
  showControls: boolean;
  nextLabel: string;
  backLabel: string;
  finishLabel: string;
  showClose: boolean;
  // Media
  media: MediaType;
  // Focus
  focus: boolean;
  // Progress
  showProgress: boolean;
  progressType: 'steps' | 'ring';
}

type Story = StoryObj<TourtipArgs>;

const TourtipDemo = ({
  title,
  content,
  placement,
  showControls,
  nextLabel,
  backLabel,
  finishLabel,
  showClose,
  media,
  focus,
  showProgress,
  progressType,
}: TourtipArgs) => {
  const mediaConfig = MEDIA_OPTIONS[media];
  const hasStarted = useRef(false);

  const tour = useTour({
    steps: [
      {
        target: 'tourtip-target',
        title,
        content,
        ...mediaConfig,
      },
      {
        target: 'tourtip-target',
        title: 'Step 2',
        content: 'This is the second step.',
        ...mediaConfig,
      },
      {
        target: 'tourtip-target',
        title: 'Step 3',
        content: 'This is the final step.',
        ...mediaConfig,
      },
    ],
    tooltipOptions: {
      placement,
      maxWidth: 320,
      wordWrap: true,
    },
    navigation: {
      showControls,
      nextLabel,
      backLabel,
      finishLabel,
      showClose,
    },
    focus,
    progress: {
      show: showProgress,
      type: progressType,
    },
  });

  // Auto-start the tour when component mounts or args change
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (hasStarted.current) {
        // Restart to apply new settings
        tour.end();
      }
      tour.start();
      hasStarted.current = true;
    }, 100);

    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    content,
    placement,
    showControls,
    nextLabel,
    backLabel,
    finishLabel,
    showClose,
    media,
    focus,
    showProgress,
    progressType,
  ]);

  // Build the code preview
  const mediaCode =
    media === 'none'
      ? ''
      : media === 'image' || media === 'gif'
        ? `\n    image: '${MEDIA_OPTIONS[media].image}',`
        : `\n    video: { src: '...', type: '${MEDIA_OPTIONS[media].video?.type}' },`;

  const codePreview = `const tour = useTour({
  steps: [{
    target: 'my-element',
    title: '${title}',
    content: '${content}',${mediaCode}
  }],
  tooltipOptions: {
    placement: '${placement}',
  },
  navigation: {
    showControls: ${showControls},
    nextLabel: '${nextLabel}',
    backLabel: '${backLabel}',
    finishLabel: '${finishLabel}',
    showClose: ${showClose},
  },
  focus: ${focus},
  progress: {
    show: ${showProgress},
    type: '${progressType}',
  },
});

// Start the tour
tour.start();`;

  return (
    <div className="story-container" style={{ minHeight: '400px', paddingTop: '60px' }}>
      <p className="story-description">
        Using <code>useTour()</code> for guided tour experiences.
        <br />
        Adjust the controls below to see different tour tooltip configurations.
      </p>

      {/* Target element */}
      <div
        data-tip-id="tourtip-target"
        style={{
          padding: '20px 40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          fontWeight: 600,
          fontSize: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        Target Element
      </div>

      {/* Restart button */}
      {!tour.isActive && (
        <button
          className="story-button"
          onClick={() => tour.start()}
          style={{ marginBottom: '20px' }}
        >
          Restart Tour
        </button>
      )}

      {/* Code preview */}
      <pre className="story-code" style={{ fontSize: '11px', textAlign: 'left' }}>
        {codePreview}
      </pre>
    </div>
  );
};

/**
 * Interactive tour tooltip playground.
 *
 * The tooltip is shown automatically - use the controls panel below
 * to experiment with all available options and see changes in real-time.
 */
export const TheTourtip: Story = {
  args: {
    title: 'Welcome',
    content: 'This is a tour tooltip with rich features.',
    placement: 'bottom',
    showControls: true,
    nextLabel: 'Next',
    backLabel: 'Back',
    finishLabel: 'Finish',
    showClose: true,
    media: 'none',
    focus: false,
    showProgress: false,
    progressType: 'steps',
  },
  argTypes: {
    title: {
      control: 'text',
      description: 'Tooltip title displayed at the top',
    },
    content: {
      control: 'text',
      description: 'Main content/message of the tooltip',
    },
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'right',
      ],
      description: 'Position of the tooltip relative to the target',
    },
    showControls: {
      control: 'boolean',
      description: 'Show navigation buttons (Back/Next)',
      table: { category: 'Navigation' },
    },
    nextLabel: {
      control: 'text',
      description: 'Label for the Next button',
      table: { category: 'Navigation' },
    },
    backLabel: {
      control: 'text',
      description: 'Label for the Back button',
      table: { category: 'Navigation' },
    },
    finishLabel: {
      control: 'text',
      description: 'Label for the button on the last step',
      table: { category: 'Navigation' },
    },
    showClose: {
      control: 'boolean',
      description: 'Show close (×) button in the header',
      table: { category: 'Navigation' },
    },
    media: {
      control: 'select',
      options: ['none', 'image', 'gif', 'youtube', 'mp4'],
      description: 'Media type to display above the content',
      table: { category: 'Media' },
    },
    focus: {
      control: 'boolean',
      description: 'Apply backdrop overlay to highlight the target',
      table: { category: 'Focus' },
    },
    showProgress: {
      control: 'boolean',
      description: 'Show step progress indicator',
      table: { category: 'Progress' },
    },
    progressType: {
      control: 'radio',
      options: ['steps', 'ring'],
      description: 'Type of progress indicator: text ("Step 1 of 3") or circular ring',
      table: { category: 'Progress' },
    },
  },
  render: (args) => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <TourtipDemo {...args} />
    </TipMagicProvider>
  ),
};
