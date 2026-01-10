import type { Meta, StoryObj } from '@storybook/react-vite';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import '../../styles/index.css';
import { MockDashboard } from './MockDashboard';
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
 * Demonstrates the move vs jump transition behavior.
 * - **Move**: Tooltip smoothly animates from one target to another
 * - **Jump**: Tooltip fades out and reappears at the new position
 *
 * Use `data-tip-move` or `data-tip-jump` to override per-element.
 */
export const MoveVsJump: Story = {
  render: () => (
    <TipMagicProvider>
      <div className="story-container">
        <p className="story-description">
          Compare how the tooltip moves vs jumps between targets. The default behavior is 'jump'.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 12px', color: '#6b7280' }}>Move Behavior</h4>
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
          <h4 style={{ margin: '0 0 12px', color: '#6b7280' }}>Jump Behavior (default)</h4>
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
 * Demonstrates tooltip groups for controlling move transitions.
 *
 * Move transitions only happen when:
 * - Moving between elements in the **same group**
 * - Moving from a grouped element to an **ungrouped** element (or vice versa)
 *
 * Move transitions are **blocked** when:
 * - Moving between elements in **different groups** (tooltip will jump/appear instead)
 */
export const TooltipGroups: Story = {
  render: () => (
    <TipMagicProvider>
      <div className="story-container">
        <p className="story-description">
          Tooltips in the same group will smoothly move between each other. Moving between different
          groups will cause the tooltip to jump/appear instead.
        </p>

        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 12px', color: '#10b981' }}>Group A (Green)</h4>
          <div className="story-button-group">
            <button
              className="story-button"
              style={{ backgroundColor: '#10b981' }}
              data-tip="Group A - Button 1"
              data-tip-move
              data-tip-group="A"
            >
              A1
            </button>
            <button
              className="story-button"
              style={{ backgroundColor: '#10b981' }}
              data-tip="Group A - Button 2"
              data-tip-move
              data-tip-group="A"
            >
              A2
            </button>
            <button
              className="story-button"
              style={{ backgroundColor: '#10b981' }}
              data-tip="Group A - Button 3"
              data-tip-move
              data-tip-group="A"
            >
              A3
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ margin: '0 0 12px', color: '#3b82f6' }}>Group B (Blue)</h4>
          <div className="story-button-group">
            <button
              className="story-button"
              style={{ backgroundColor: '#3b82f6' }}
              data-tip="Group B - Button 1"
              data-tip-move
              data-tip-group="B"
            >
              B1
            </button>
            <button
              className="story-button"
              style={{ backgroundColor: '#3b82f6' }}
              data-tip="Group B - Button 2"
              data-tip-move
              data-tip-group="B"
            >
              B2
            </button>
            <button
              className="story-button"
              style={{ backgroundColor: '#3b82f6' }}
              data-tip="Group B - Button 3"
              data-tip-move
              data-tip-group="B"
            >
              B3
            </button>
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 12px', color: '#6b7280' }}>No Group (Gray)</h4>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 12px' }}>
            Elements without a group can move from/to any grouped element.
          </p>
          <div className="story-button-group">
            <button
              className="story-button story-button-secondary"
              data-tip="No group - can move from anywhere"
              data-tip-move
            >
              Ungrouped 1
            </button>
            <button
              className="story-button story-button-secondary"
              data-tip="No group - can move from anywhere"
              data-tip-move
            >
              Ungrouped 2
            </button>
          </div>
        </div>
      </div>
    </TipMagicProvider>
  ),
};

/**
 * A realistic UI example demonstrating tooltip groups in a dashboard layout.
 *
 * - **Side navigation items** belong to the `side-nav` group
 * - **Tab buttons** belong to the `tab-group` group
 *
 * Moving within each group transitions smoothly. Moving between groups causes the tooltip to jump.
 */
export const DashboardLayoutGroups: Story = {
  parameters: {
    layout: 'centered',
  },
  render: () => (
    <TipMagicProvider>
      <div className="tour-demo-container">
        <MockDashboard
          contentTitle="Project Overview"
          contentDescription="Hover over navigation items and tabs to see grouped tooltip transitions."
          navMove
          tabMove
          navTooltipGroup="side-nav"
          tabTooltipGroup="tab-group"
          stats={[]}
          actions={[]}
        >
          {/* Custom content explaining the groups feature */}
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: '18px', color: '#1e293b' }}>
              Try the Tooltip Groups
            </h2>
            <ul style={{ margin: 0, padding: '0 0 0 20px', color: '#64748b', lineHeight: 1.8 }}>
              <li>
                Move between <strong>navigation items</strong> — tooltips slide smoothly
              </li>
              <li>
                Move between <strong>tab buttons</strong> — tooltips slide smoothly
              </li>
              <li>
                Move from <strong>nav to tabs</strong> (or vice versa) — tooltip jumps to new
                position
              </li>
            </ul>
          </div>
        </MockDashboard>
      </div>
    </TipMagicProvider>
  ),
};
