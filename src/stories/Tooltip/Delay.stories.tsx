import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Delay',
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
 * Demonstrates custom show delays using the `data-tip-delay` attribute.
 *
 * **Delay Behavior When Transitioning:**
 * - When moving between buttons, the new button's show delay is respected
 * - If the show delay is longer than the hide delay (default: 700ms), the tooltip
 *   will first disappear, then reappear on the new target after its show delay
 * - Example: Moving from 500ms → 1000ms button: tooltip hides at 700ms, shows at 1000ms
 * - If show delay is shorter than hide delay, tooltip moves smoothly to the new target
 */
export const CustomShowDelay: Story = {
  render: () => (
    <div className="story-container">
      <p className="story-description">
        Try moving between buttons to see how delays interact.
        <br />
        <strong>Tip:</strong> When moving to a button with a show delay longer than the hide delay
        (700ms), the tooltip will disappear first, then reappear.
      </p>
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
