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
 * - Use the `contentSeparator` (default: `;`) to separate text from the shortcut
 * - Format: `"Main text; Shortcut"` → displays "Main text" with a styled `[Shortcut]` badge
 * - The shortcut is rendered in a `<kbd>` element with special styling
 *
 * **Customization:**
 * - Change separator: `<TipMagicProvider options={{ contentSeparator: '|' }}>`
 * - Disable shortcut styling: `<TipMagicProvider options={{ enableShortcutStyle: false }}>`
 */
export const WithShortcuts: Story = {
  render: () => (
    <TipMagicProvider>
      <div className="story-container">
        <p className="story-description">
          Use a semicolon <code>;</code> to separate tooltip text from keyboard shortcuts.
          <br />
          Example: <code>data-tip="Copy; ⌘C"</code> → "Copy" + styled shortcut badge
        </p>
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
        <p className="story-info">
          💡 Without a semicolon, the entire text is shown as the main content (no shortcut badge).
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
            <button className="story-toolbar-btn" data-tip="Bold; ⌘B" aria-label="Bold">
              <strong>B</strong>
            </button>
            <button className="story-toolbar-btn" data-tip="Italic; ⌘I" aria-label="Italic">
              <em>I</em>
            </button>
            <button className="story-toolbar-btn" data-tip="Underline; ⌘U" aria-label="Underline">
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
              data-tip="Insert link; ⌘K"
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
