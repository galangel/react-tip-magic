import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Keyboard Shortcuts',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Tooltips can display keyboard shortcuts alongside the main content.
 *
 * **How it works:**
 * - Use `data-tip-shortcut` attribute to specify the keyboard shortcut
 * - The shortcut is rendered in a styled `<kbd>` badge next to the tooltip text
 *
 * **Example:**
 * ```html
 * <button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
 * ```
 *
 * **Customization:**
 * - Disable shortcut styling: `<TipMagicProvider options={{ enableShortcutStyle: false }}>`
 */
export const WithShortcuts: Story = {
  render: () => (
    <TipMagicProvider>
      <div className="story-container">
        <p className="story-description">
          Use <code>data-tip-shortcut</code> to add a styled keyboard shortcut badge.
          <br />
          Example: <code>data-tip="Copy" data-tip-shortcut="⌘C"</code>
        </p>
        <div className="story-toolbar">
          <button
            className="story-icon-button"
            data-tip="Copy"
            data-tip-shortcut="⌘C"
            aria-label="Copy"
          >
            📋
          </button>
          <button
            className="story-icon-button"
            data-tip="Paste"
            data-tip-shortcut="⌘V"
            aria-label="Paste"
          >
            📄
          </button>
          <button
            className="story-icon-button"
            data-tip="Cut"
            data-tip-shortcut="⌘X"
            aria-label="Cut"
          >
            ✂️
          </button>
          <button
            className="story-icon-button"
            data-tip="Undo"
            data-tip-shortcut="⌘Z"
            aria-label="Undo"
          >
            ↩️
          </button>
          <button
            className="story-icon-button"
            data-tip="Save"
            data-tip-shortcut="⌘S"
            aria-label="Save"
          >
            💾
          </button>
        </div>
        <p className="story-info">
          Without <code>data-tip-shortcut</code>, only the main text is shown (no shortcut badge).
        </p>
      </div>
    </TipMagicProvider>
  ),
};

/**
 * A real-world toolbar example showing how tooltips with keyboard shortcuts enhance UX.
 *
 * This demonstrates a text editor toolbar where each formatting action
 * includes both a description and its keyboard shortcut.
 */
export const EditorToolbar: Story = {
  render: () => (
    <TipMagicProvider>
      <div className="story-container">
        <p className="story-description">
          A realistic text editor toolbar with keyboard shortcuts for common formatting actions.
        </p>
        <div className="story-editor-toolbar">
          <div className="story-toolbar-group">
            <button
              className="story-toolbar-btn"
              data-tip="Bold"
              data-tip-shortcut="⌘B"
              aria-label="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              className="story-toolbar-btn"
              data-tip="Italic"
              data-tip-shortcut="⌘I"
              aria-label="Italic"
            >
              <em>I</em>
            </button>
            <button
              className="story-toolbar-btn"
              data-tip="Underline"
              data-tip-shortcut="⌘U"
              aria-label="Underline"
            >
              <u>U</u>
            </button>
            <button
              className="story-toolbar-btn"
              data-tip="Strikethrough"
              aria-label="Strikethrough"
            >
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
            <button
              className="story-toolbar-btn"
              data-tip="Insert link"
              data-tip-shortcut="⌘K"
              aria-label="Insert link"
            >
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
    </TipMagicProvider>
  ),
};
