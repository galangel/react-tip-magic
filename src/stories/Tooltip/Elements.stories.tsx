import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Elements',
  decorators: [
    (Story) => (
      <TipMagicProvider>
        <Story />
      </TipMagicProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

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
