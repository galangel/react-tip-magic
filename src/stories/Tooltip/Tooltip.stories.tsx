import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTipMagic } from '../../hooks/useTipMagic';
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
  title: 'Components/Tooltip',
  decorators: [
    (Story, context) => {
      // Skip the default provider if the story provides its own
      if (context.parameters.skipDefaultProvider) {
        return <Story />;
      }
      return (
        <TipMagicProvider>
          <Story />
        </TipMagicProvider>
      );
    },
  ],
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
export const Basic: Story = {
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
    moveTransitionDuration: 200,
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
  },
  render: (args) => {
    const tipProps = getTipProps(args);

    return (
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
    );
  },
};

/**
 * Demonstrates smooth transitions when moving between multiple tooltip targets.
 * The tooltip slides smoothly instead of disappearing and reappearing.
 */
export const SmoothTransitions: Story = {
  render: () => (
    <div className="story-container">
      <p className="story-description">
        Move your mouse between the buttons below - notice how the tooltip smoothly transitions
        instead of flickering!
      </p>
      <div className="story-button-group">
        <button className="story-button" data-tip="First button tooltip">
          Button 1
        </button>
        <button className="story-button" data-tip="Second button tooltip">
          Button 2
        </button>
        <button className="story-button" data-tip="Third button tooltip">
          Button 3
        </button>
        <button className="story-button" data-tip="Fourth button tooltip">
          Button 4
        </button>
      </div>
    </div>
  ),
};

/**
 * Keyboard shortcuts can be added using the `;` separator.
 * The shortcut is displayed in a special styled badge.
 */
export const WithKeyboardShortcuts: Story = {
  render: () => (
    <div className="story-container">
      <div className="story-toolbar">
        <button className="story-icon-button" data-tip="Copy; ⌘C" aria-label="Copy">
          📋
        </button>
        <button className="story-icon-button" data-tip="Paste; ⌘V" aria-label="Paste">
          📄
        </button>
        <button className="story-icon-button" data-tip="Cut; ⌘X" aria-label="Cut">
          ✂️
        </button>
        <button className="story-icon-button" data-tip="Undo; ⌘Z" aria-label="Undo">
          ↩️
        </button>
        <button className="story-icon-button" data-tip="Save; ⌘S" aria-label="Save">
          💾
        </button>
      </div>
    </div>
  ),
};

/**
 * Control tooltip placement with the `data-tip-placement` attribute.
 * Supports: top, top-start, top-end, bottom, bottom-start, bottom-end,
 * left, left-start, left-end, right, right-start, right-end
 */
export const Placements: Story = {
  render: () => (
    <div className="story-container">
      <div className="story-placement-grid">
        <button className="story-button" data-tip="Top start" data-tip-placement="top-start">
          Top Start
        </button>
        <button className="story-button" data-tip="Top center" data-tip-placement="top">
          Top
        </button>
        <button className="story-button" data-tip="Top end" data-tip-placement="top-end">
          Top End
        </button>

        <button className="story-button" data-tip="Left" data-tip-placement="left">
          Left
        </button>
        <div className="story-placeholder" />
        <button className="story-button" data-tip="Right" data-tip-placement="right">
          Right
        </button>

        <button className="story-button" data-tip="Bottom start" data-tip-placement="bottom-start">
          Bottom Start
        </button>
        <button className="story-button" data-tip="Bottom center" data-tip-placement="bottom">
          Bottom
        </button>
        <button className="story-button" data-tip="Bottom end" data-tip-placement="bottom-end">
          Bottom End
        </button>
      </div>
    </div>
  ),
};

/**
 * Demonstrates custom delays using the `data-tip-delay` attribute.
 */
export const CustomDelay: Story = {
  render: () => (
    <div className="story-container">
      <div className="story-button-group">
        <button className="story-button" data-tip="Instant!" data-tip-delay="0">
          No delay
        </button>
        <button className="story-button" data-tip="Default delay (200ms)" data-tip-delay="200">
          200ms
        </button>
        <button className="story-button" data-tip="Slow reveal (500ms)" data-tip-delay="500">
          500ms
        </button>
        <button className="story-button" data-tip="Very slow (1s)" data-tip-delay="1000">
          1 second
        </button>
      </div>
    </div>
  ),
};

/**
 * Programmatic control of tooltips using the `useTipMagic` hook.
 */
export const ProgrammaticControl: Story = {
  parameters: {
    skipDefaultProvider: true,
  },
  decorators: [
    (Story) => (
      <TipMagicProvider options={{ hideDelay: 999999999 }}>
        <Story />
      </TipMagicProvider>
    ),
  ],
  render: function ProgrammaticDemo() {
    const { tooltip } = useTipMagic();

    return (
      <div className="story-container">
        <p className="story-description">
          The tooltip will stay visible until you click "Hide Tooltip" (no auto-hide).
        </p>
        <div className="story-button-group">
          <button
            className="story-button"
            id="programmatic-target"
            data-tip="I can be controlled programmatically!"
          >
            Target Element
          </button>
        </div>
        <div className="story-button-group" style={{ marginTop: '20px' }}>
          <button
            className="story-button story-button-secondary"
            onClick={() => tooltip.show('#programmatic-target')}
          >
            Show Tooltip
          </button>
          <button
            className="story-button story-button-secondary"
            onClick={() => tooltip.show('#programmatic-target', 'Custom content!')}
          >
            Show Custom Content
          </button>
          <button className="story-button story-button-secondary" onClick={() => tooltip.hide()}>
            Hide Tooltip
          </button>
        </div>
        <p className="story-info">
          Visible: {tooltip.isVisible ? 'Yes' : 'No'}
          {tooltip.content && ` | Content: "${tooltip.content}"`}
        </p>
      </div>
    );
  },
};

/**
 * Works on any element, not just buttons.
 */
export const VariousElements: Story = {
  render: () => (
    <div className="story-container">
      <div className="story-various-elements">
        <span className="story-badge" data-tip="I'm a badge!">
          Badge
        </span>

        <a href="#" className="story-link" data-tip="Click to navigate">
          Link with tooltip
        </a>

        <div className="story-card" data-tip="This is a card component">
          <h4>Card Title</h4>
          <p>Hover over this card</p>
        </div>

        <span className="story-icon" data-tip="Settings; ⌘,">
          ⚙️
        </span>

        <abbr className="story-abbr" data-tip="Application Programming Interface">
          API
        </abbr>
      </div>
    </div>
  ),
};

/**
 * A real-world toolbar example showing how tooltips enhance UX.
 */
export const RealWorldToolbar: Story = {
  render: () => (
    <div className="story-container">
      <div className="story-editor-toolbar">
        <div className="story-toolbar-group">
          <button className="story-toolbar-btn" data-tip="Bold; ⌘B" aria-label="Bold">
            <strong>B</strong>
          </button>
          <button className="story-toolbar-btn" data-tip="Italic; ⌘I" aria-label="Italic">
            <em>I</em>
          </button>
          <button className="story-toolbar-btn" data-tip="Underline; ⌘U" aria-label="Underline">
            <u>U</u>
          </button>
          <button className="story-toolbar-btn" data-tip="Strikethrough" aria-label="Strikethrough">
            <s>S</s>
          </button>
        </div>
        <div className="story-toolbar-divider" />
        <div className="story-toolbar-group">
          <button className="story-toolbar-btn" data-tip="Align left" aria-label="Align left">
            ≡
          </button>
          <button className="story-toolbar-btn" data-tip="Align center" aria-label="Align center">
            ≡
          </button>
          <button className="story-toolbar-btn" data-tip="Align right" aria-label="Align right">
            ≡
          </button>
        </div>
        <div className="story-toolbar-divider" />
        <div className="story-toolbar-group">
          <button className="story-toolbar-btn" data-tip="Insert link; ⌘K" aria-label="Insert link">
            🔗
          </button>
          <button className="story-toolbar-btn" data-tip="Insert image" aria-label="Insert image">
            🖼️
          </button>
          <button
            className="story-toolbar-btn"
            data-tip="Insert code block"
            aria-label="Insert code block"
          >
            {'</>'}
          </button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Demonstrates the move vs jump transition behavior.
 * - **Move** (default): Tooltip smoothly animates from one target to another
 * - **Jump**: Tooltip fades out and reappears at the new position
 *
 * Use `data-tip-move` or `data-tip-jump` to override per-element.
 */
export const TransitionBehavior: Story = {
  render: () => (
    <div className="story-container">
      <p className="story-description">
        Compare how the tooltip moves vs jumps between targets. The default behavior is 'move'.
      </p>

      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ margin: '0 0 12px', color: '#6b7280' }}>Move Behavior (default)</h4>
        <div className="story-button-group">
          <button className="story-button" data-tip="Move to me!" data-tip-move>
            Move 1
          </button>
          <button className="story-button" data-tip="Smooth transition!" data-tip-move>
            Move 2
          </button>
          <button className="story-button" data-tip="Slides over!" data-tip-move>
            Move 3
          </button>
        </div>
      </div>

      <div>
        <h4 style={{ margin: '0 0 12px', color: '#6b7280' }}>Jump Behavior</h4>
        <div className="story-button-group">
          <button
            className="story-button story-button-secondary"
            data-tip="Jump to me!"
            data-tip-jump
          >
            Jump 1
          </button>
          <button
            className="story-button story-button-secondary"
            data-tip="Instant appear!"
            data-tip-jump
          >
            Jump 2
          </button>
          <button
            className="story-button story-button-secondary"
            data-tip="No animation!"
            data-tip-jump
          >
            Jump 3
          </button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Provider-level transition behavior with jump as default.
 * All tooltips will jump unless explicitly set to move.
 */
export const JumpAsDefault: Story = {
  parameters: {
    skipDefaultProvider: true,
  },
  decorators: [
    (Story) => (
      <TipMagicProvider options={{ transitionBehavior: 'jump' }}>
        <Story />
      </TipMagicProvider>
    ),
  ],
  render: () => (
    <div className="story-container">
      <p className="story-description">
        This story uses 'jump' as the default transition behavior at the provider level.
      </p>
      <div className="story-button-group">
        <button className="story-button" data-tip="Jumps by default">
          Button 1
        </button>
        <button className="story-button" data-tip="Also jumps">
          Button 2
        </button>
        <button className="story-button" data-tip="This one moves!" data-tip-move>
          Button 3 (override)
        </button>
      </div>
    </div>
  ),
};
