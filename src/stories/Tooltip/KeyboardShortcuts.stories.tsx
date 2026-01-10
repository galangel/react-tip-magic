import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Keyboard Shortcuts',
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
  ),
};
