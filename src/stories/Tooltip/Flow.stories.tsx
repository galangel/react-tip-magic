import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTipMagic } from '../../hooks/useTipMagic';
import '../../styles/index.css';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Flow & Tours',
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

/**
 * Guided Flow / Tour demonstration.
 *
 * The flow API allows you to create multi-step guided tours that
 * highlight elements and show contextual information.
 *
 * **API:**
 * - `helper.startFlow(steps)` - Start a flow with defined steps
 * - `helper.nextStep()` - Move to next step
 * - `helper.endFlow()` - End the current flow
 * - `helper.currentStep` - Get current step index
 *
 * **Tooltip Options:**
 * Each step can include `tooltipOptions` to customize the tooltip appearance:
 * - `maxLines`, `ellipsis`, `wordWrap` - Text display options
 * - `maxWidth`, `placement` - Layout options
 * - `interactive` - Allow hovering over the tooltip
 */
const FlowDemo = () => {
  const { helper, tooltip } = useTipMagic();
  const [flowActive, setFlowActive] = React.useState(false);

  const steps = [
    {
      id: 'step-1',
      targetId: 'flow-target-1',
      title: 'Welcome!',
      message: 'This is the first step of the tour. Click Next to continue.',
      actions: [{ label: 'Next', action: 'next' as const, variant: 'primary' as const }],
      state: 'informative' as const,
      tooltipOptions: {
        maxWidth: 280,
        wordWrap: true,
        maxLines: 3,
        ellipsis: true,
        placement: 'bottom' as const,
      },
    },
    {
      id: 'step-2',
      targetId: 'flow-target-2',
      title: 'Settings',
      message:
        'Here you can configure your preferences including theme, notifications, privacy settings, and more advanced options.',
      actions: [{ label: 'Next', action: 'next' as const, variant: 'primary' as const }],
      state: 'success' as const,
      tooltipOptions: {
        maxWidth: 300,
        wordWrap: true,
        maxLines: 3,
        ellipsis: true,
        placement: 'bottom' as const,
      },
    },
    {
      id: 'step-3',
      targetId: 'flow-target-3',
      title: 'Profile',
      message: 'Manage your profile and account settings here.',
      actions: [{ label: 'Next', action: 'next' as const, variant: 'primary' as const }],
      state: 'informative' as const,
      tooltipOptions: {
        placement: 'bottom' as const,
        interactive: true,
        wordWrap: true,
        maxLines: 3,
        ellipsis: true,
      },
    },
    {
      id: 'step-4',
      targetId: 'flow-target-4',
      title: 'All Done!',
      message: "You've completed the tour. Click Finish to exit.",
      actions: [{ label: 'Finish', action: 'complete' as const, variant: 'primary' as const }],
      state: 'success' as const,
      tooltipOptions: {
        maxWidth: 250,
        wordWrap: true,
        maxLines: 3,
        ellipsis: true,
        placement: 'bottom' as const,
      },
    },
  ];

  const showStepTooltip = (stepIndex: number) => {
    const step = steps[stepIndex];
    const target = document.querySelector(`[data-tip-id="${step.targetId}"]`);
    if (target) {
      tooltip.show(target, {
        content: `Step ${stepIndex + 1}: ${step.title}\n${step.message}`,
        ...step.tooltipOptions,
      });
    }
  };

  const handleStartFlow = () => {
    helper.startFlow(steps);
    setFlowActive(true);
    showStepTooltip(0);
  };

  const handleNextStep = () => {
    const nextIndex = helper.currentStep + 1;
    if (nextIndex >= steps.length) {
      handleEndFlow();
      return;
    }
    helper.nextStep();
    showStepTooltip(nextIndex);
  };

  const handleEndFlow = () => {
    helper.endFlow();
    tooltip.hide();
    setFlowActive(false);
  };

  return (
    <div className="story-container">
      <p className="story-description">
        The Flow API enables creating guided tours that highlight elements sequentially.
        <br />
        Click "Start Tour" to begin the demonstration.
      </p>

      {/* Flow Control */}
      <div className="flow-controls">
        {!flowActive ? (
          <button className="story-button story-button-primary" onClick={handleStartFlow}>
            🚀 Start Tour
          </button>
        ) : (
          <>
            <span className="flow-step-indicator">
              Step {helper.currentStep + 1} of {steps.length}
            </span>
            <button className="story-button" onClick={handleNextStep}>
              {helper.currentStep >= steps.length - 1 ? '✓ Finish' : 'Next →'}
            </button>
            <button className="story-button story-button-secondary" onClick={handleEndFlow}>
              ✕ Exit Tour
            </button>
          </>
        )}
      </div>

      {/* Target Elements */}
      <div className="flow-targets">
        <div
          className={`flow-target ${flowActive && helper.currentStep === 0 ? 'flow-target-active' : ''}`}
          data-tip-id="flow-target-1"
          data-tip="Welcome to the app!"
        >
          <span className="flow-target-icon">🏠</span>
          <span>Home</span>
        </div>

        <div
          className={`flow-target ${flowActive && helper.currentStep === 1 ? 'flow-target-active' : ''}`}
          data-tip-id="flow-target-2"
          data-tip="Configure your settings"
        >
          <span className="flow-target-icon">⚙️</span>
          <span>Settings</span>
        </div>

        <div
          className={`flow-target ${flowActive && helper.currentStep === 2 ? 'flow-target-active' : ''}`}
          data-tip-id="flow-target-3"
          data-tip="View your profile"
        >
          <span className="flow-target-icon">👤</span>
          <span>Profile</span>
        </div>

        <div
          className={`flow-target ${flowActive && helper.currentStep === 3 ? 'flow-target-active' : ''}`}
          data-tip-id="flow-target-4"
          data-tip="Get help and support"
        >
          <span className="flow-target-icon">❓</span>
          <span>Help</span>
        </div>
      </div>

      {/* Code example */}
      <pre className="story-code">
        {`const { helper, tooltip } = useTipMagic();

const steps = [
  {
    id: 'step-1',
    targetId: 'my-element',
    title: 'Welcome!',
    message: 'This is the first step.',
    actions: [{ label: 'Next', action: 'next' }],
    // Customize tooltip for this step
    tooltipOptions: {
      maxWidth: 300,
      maxLines: 2,
      ellipsis: true,
      wordWrap: true,
      placement: 'bottom',
    },
  },
];

// Show tooltip with options
tooltip.show('#my-element', {
  content: 'Tooltip with options',
  maxLines: 2,
  ellipsis: true,
  wordWrap: true,
});

// Start flow
helper.startFlow(steps);
helper.nextStep();
helper.endFlow();`}
      </pre>
    </div>
  );
};

export const GuidedFlow: Story = {
  render: () => (
    <TipMagicProvider>
      <FlowDemo />
    </TipMagicProvider>
  ),
};

/**
 * Interactive Tour with in-tooltip navigation.
 *
 * This demo shows a tour where users navigate using buttons
 * inside the tooltip itself. The tooltip is interactive,
 * allowing clicks on Next/Close buttons.
 */
const InteractiveTourDemo = () => {
  const { helper, tooltip } = useTipMagic();
  const [tourActive, setTourActive] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    {
      targetId: 'tour-sidebar',
      title: 'Navigation Sidebar',
      message: 'Access all your main sections from here. Click on any item to navigate.',
    },
    {
      targetId: 'tour-search',
      title: 'Search Bar',
      message: 'Quickly find anything in your workspace. Supports filters and advanced queries.',
    },
    {
      targetId: 'tour-stats',
      title: 'Statistics Overview',
      message: 'Monitor your key metrics at a glance. Click any card for detailed analytics.',
    },
    {
      targetId: 'tour-actions',
      title: 'Quick Actions',
      message: 'Common actions are just one click away. Customize these in settings.',
    },
    {
      targetId: 'tour-profile',
      title: 'Your Profile',
      message: "You're all set! Access your account settings and preferences here.",
    },
  ];

  const buildTooltipContent = (stepIndex: number) => {
    const step = steps[stepIndex];
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === steps.length - 1;

    return `<div class="tour-tooltip-content">
      <button class="tour-close-btn" data-tour-action="close" aria-label="Close tour">×</button>
      <div class="tour-step-badge">Step ${stepIndex + 1} of ${steps.length}</div>
      <h4 class="tour-title">${step.title}</h4>
      <p class="tour-message">${step.message}</p>
      <div class="tour-buttons">
        ${!isFirst ? '<button class="tour-btn tour-btn-secondary" data-tour-action="prev">← Back</button>' : ''}
        <button class="tour-btn tour-btn-primary" data-tour-action="${isLast ? 'finish' : 'next'}">
          ${isLast ? '✓ Finish' : 'Next →'}
        </button>
      </div>
    </div>`;
  };

  const showStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    const target = document.querySelector(`[data-tip-id="${step.targetId}"]`);
    if (target) {
      tooltip.show(target, {
        content: buildTooltipContent(stepIndex),
        html: true,
        interactive: true,
        maxWidth: 340,
        placement: 'bottom',
        showArrow: true,
        wordWrap: true,
        ellipsis: false,
      });
      setCurrentStep(stepIndex);
    }
  };

  const handleStartTour = () => {
    helper.startFlow(steps.map((s, i) => ({ ...s, id: `step-${i}`, actions: [] })));
    setTourActive(true);
    showStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      showStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  };

  const handleEndTour = () => {
    helper.endFlow();
    tooltip.hide();
    setTourActive(false);
    setCurrentStep(0);
  };

  // Handle clicks on tour buttons inside the tooltip
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute('data-tour-action');
      if (action === 'next') handleNext();
      else if (action === 'prev') handlePrev();
      else if (action === 'finish' || action === 'close') handleEndTour();
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  });

  return (
    <div className="tour-demo-container">
      {/* Start Tour Button */}
      <button
        className={`tour-start-btn ${tourActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={handleStartTour}
        disabled={tourActive}
      >
        {tourActive ? '🎯 Tour in Progress...' : '🎯 Start Interactive Tour'}
      </button>

      {/* Mock Dashboard UI */}
      <div className="mock-dashboard">
        {/* Sidebar */}
        <aside
          className={`mock-sidebar ${tourActive && currentStep === 0 ? 'tour-highlight' : ''}`}
          data-tip-id="tour-sidebar"
        >
          <div className="mock-logo">📊 Dashboard</div>
          <nav className="mock-nav">
            <a className="mock-nav-item active">🏠 Home</a>
            <a className="mock-nav-item">📈 Analytics</a>
            <a className="mock-nav-item">📁 Projects</a>
            <a className="mock-nav-item">👥 Team</a>
            <a className="mock-nav-item">⚙️ Settings</a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="mock-main">
          {/* Header */}
          <header className="mock-header">
            <div
              className={`mock-search ${tourActive && currentStep === 1 ? 'tour-highlight' : ''}`}
              data-tip-id="tour-search"
            >
              <span className="mock-search-icon">🔍</span>
              <input type="text" placeholder="Search..." className="mock-search-input" />
            </div>
            <div
              className={`mock-profile ${tourActive && currentStep === 4 ? 'tour-highlight' : ''}`}
              data-tip-id="tour-profile"
            >
              <span className="mock-avatar">👤</span>
              <span className="mock-username">John Doe</span>
            </div>
          </header>

          {/* Stats Cards */}
          <div
            className={`mock-stats ${tourActive && currentStep === 2 ? 'tour-highlight' : ''}`}
            data-tip-id="tour-stats"
          >
            <div className="mock-stat-card">
              <span className="mock-stat-value">1,234</span>
              <span className="mock-stat-label">Total Users</span>
            </div>
            <div className="mock-stat-card">
              <span className="mock-stat-value">567</span>
              <span className="mock-stat-label">Active Now</span>
            </div>
            <div className="mock-stat-card">
              <span className="mock-stat-value">89%</span>
              <span className="mock-stat-label">Satisfaction</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={`mock-actions ${tourActive && currentStep === 3 ? 'tour-highlight' : ''}`}
            data-tip-id="tour-actions"
          >
            <h3 className="mock-section-title">Quick Actions</h3>
            <div className="mock-action-buttons">
              <button className="mock-action-btn">+ New Project</button>
              <button className="mock-action-btn">📤 Export Data</button>
              <button className="mock-action-btn">📧 Send Report</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const InteractiveTour: Story = {
  render: () => (
    <TipMagicProvider>
      <InteractiveTourDemo />
    </TipMagicProvider>
  ),
};
