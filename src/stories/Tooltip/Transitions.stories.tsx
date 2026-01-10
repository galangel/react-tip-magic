import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Transitions',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Demonstrates smooth transitions when moving between multiple tooltip targets.
 * The tooltip slides smoothly instead of disappearing and reappearing.
 */
export const SmoothTransitions: Story = {
  render: () => (
    <TipMagicProvider>
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
    </TipMagicProvider>
  ),
};

/**
 * Demonstrates the move vs jump transition behavior.
 * - **Move** (default): Tooltip smoothly animates from one target to another
 * - **Jump**: Tooltip fades out and reappears at the new position
 *
 * Use `data-tip-move` or `data-tip-jump` to override per-element.
 */
export const MoveVsJump: Story = {
  render: () => (
    <TipMagicProvider>
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
    </TipMagicProvider>
  ),
};

/**
 * Provider-level transition behavior with jump as default.
 * All tooltips will jump unless explicitly set to move.
 */
export const JumpAsDefault: Story = {
  render: () => (
    <TipMagicProvider options={{ transitionBehavior: 'jump' }}>
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
    </TipMagicProvider>
  ),
};
