import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import { getTipProps, type TipPropsOptions } from '../../utils/getTipProps';
import './tooltip-stories.css';

/**
 * The Tooltip component from React Tip Magic provides elegant, performant tooltips
 * that smoothly transition between elements instead of creating new instances.
 *
 * ## Features
 * - **Single instance**: One tooltip moves between targets for smooth transitions
 * - **Data attribute based**: Just add `data-tip` to any element
 * - **Keyboard shortcut support**: Use `; ` to separate content from shortcuts
 * - **Floating UI powered**: Smart positioning with flip/shift
 * - **Accessible**: Keyboard and screen reader support
 * - **TypeScript support**: Use `getTipProps()` for typed tooltip configuration
 */
const meta: Meta = {
  title: 'Tooltip/Basic',
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<TipPropsOptions>;

/**
 * Basic tooltip usage with the `getTipProps()` utility.
 * This provides full TypeScript support for all tooltip options.
 *
 * Use the controls panel below to experiment with all available options.
 */
export const Default: Story = {
  args: {
    tip: 'This is a tooltip',
    placement: 'top',
    showDelay: 200,
    hideDelay: 700,
    disabled: false,
    ellipsis: false,
    maxLines: 1,
    wordWrap: false,
    textBreak: 'normal',
    maxWidth: 300,
    html: false,
    interactive: false,
    transitionBehavior: 'move',
    moveTransitionDuration: 100,
    showArrow: true,
    contentSeparator: ';',
  },
  argTypes: {
    tip: {
      control: 'text',
      description: 'Tooltip content. Use "; " to add keyboard shortcuts (e.g., "Save; ⌘S")',
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
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ],
      description: 'Position of the tooltip relative to the target',
    },
    showDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 50 },
      description: 'Delay before showing tooltip (ms)',
    },
    hideDelay: {
      control: { type: 'number', min: 0, max: 2000, step: 50 },
      description: 'Delay before hiding tooltip (ms)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the tooltip',
    },
    ellipsis: {
      control: 'boolean',
      description: 'Enable text truncation with ellipsis',
    },
    maxLines: {
      control: { type: 'number', min: 1, max: 10, step: 1 },
      description: 'Maximum lines before truncation (requires ellipsis)',
    },
    wordWrap: {
      control: 'boolean',
      description: 'Enable word wrapping for long content',
    },
    textBreak: {
      control: 'select',
      options: ['normal', 'break-all', 'keep-all'],
      description:
        'Text break behavior: normal (break at words), break-all (can break mid-word), keep-all (keep CJK together)',
    },
    maxWidth: {
      control: { type: 'number', min: 100, max: 600, step: 50 },
      description: 'Maximum width in pixels',
    },
    html: {
      control: 'boolean',
      description: 'Parse tooltip content as HTML',
    },
    interactive: {
      control: 'boolean',
      description: 'Keep tooltip visible when hovering over it',
    },
    transitionBehavior: {
      control: 'radio',
      options: ['move', 'jump'],
      description: 'How tooltip transitions between targets',
    },
    moveTransitionDuration: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Duration of move transition animation (ms)',
    },
    showArrow: {
      control: 'boolean',
      description: 'Show or hide the tooltip arrow',
    },
    contentSeparator: {
      control: 'text',
      description:
        'Character(s) to separate main text from keyboard shortcut (e.g., "Save; ⌘S" uses ";")',
    },
  },
  render: (args) => {
    const tipProps = getTipProps(args);

    return (
      <TipMagicProvider>
        <div className="story-container">
          <p className="story-description">
            Using <code>getTipProps()</code> for typed tooltip configuration.
            <br />
            Adjust the controls below to see different tooltip behaviors.
          </p>
          <button className="story-button" {...tipProps}>
            Hover me
          </button>
          <button className="story-button" {...tipProps}>
            Hover me
          </button>
          <pre className="story-code">
            {`const tipProps = getTipProps(${JSON.stringify(args, null, 2)});

<button {...tipProps}>Hover me</button>`}
          </pre>
        </div>
      </TipMagicProvider>
    );
  },
};
