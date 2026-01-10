import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTipMagic } from '../../hooks/useTipMagic';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Programmatic',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Programmatic control of tooltips using the `useTipMagic` hook.
 */
const ProgrammaticDemo = () => {
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
};

export const ProgrammaticControl: Story = {
  render: () => (
    <TipMagicProvider options={{ hideDelay: 999999999 }}>
      <ProgrammaticDemo />
    </TipMagicProvider>
  ),
};
