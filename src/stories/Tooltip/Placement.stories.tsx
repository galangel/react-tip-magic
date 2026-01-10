import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Placement',
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
 * Control tooltip placement with the `data-tip-placement` attribute.
 * Supports: top, top-start, top-end, bottom, bottom-start, bottom-end,
 * left, left-start, left-end, right, right-start, right-end
 */
export const AllPlacements: Story = {
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
