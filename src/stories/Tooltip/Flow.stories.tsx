import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTipMagic } from '../../hooks/useTipMagic';
import '../../styles/index.css';
import { FlowStep } from '../../types';
import { MockDashboard } from './MockDashboard';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/Flow & Tours',
  tags: ['!autodocs'],
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
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps: FlowStep[] = [
    {
      id: 'step-1',
      targetId: 'guided-sidebar',
      title: 'Navigation Sidebar',
      message: 'Access all your main sections from here. Click on any item to navigate.',
    },
    {
      id: 'step-2',
      targetId: 'guided-search',
      title: 'Search Bar',
      message: 'Quickly find anything in your workspace. Supports filters and advanced queries.',
    },
    {
      id: 'step-3',
      targetId: 'tab-overview',
      title: 'Content Tabs',
      message: 'Switch between different views using these tabs. Each tab shows relevant content.',
    },
    {
      id: 'step-4',
      targetId: 'guided-stats',
      title: 'Statistics Overview',
      message: 'Monitor your key metrics at a glance. Click any card for detailed analytics.',
    },
    {
      id: 'step-5',
      targetId: 'guided-actions',
      title: 'Quick Actions',
      message: 'Common actions are just one click away. Customize these in settings.',
    },
    {
      id: 'step-6',
      targetId: 'guided-profile',
      title: 'Your Profile',
      message: "You're all set! Access your account settings and preferences here.",
    },
  ];

  // Map step index to highlighted element ID
  const getHighlightedId = (stepIndex: number): string | undefined => {
    const step = steps[stepIndex];
    return step?.targetId;
  };

  const showStepTooltip = (stepIndex: number) => {
    const step = steps[stepIndex];
    const target = document.querySelector(`[data-tip-id="${step.targetId}"]`);
    if (target) {
      tooltip.show(target, {
        content: `${step.title}: ${step.message}`,
        maxWidth: 300,
        wordWrap: true,
        placement: 'bottom',
      });
      setCurrentStep(stepIndex);
    }
  };

  const handleStartFlow = () => {
    helper.startFlow(steps);
    setFlowActive(true);
    showStepTooltip(0);
  };

  const handleNext = () => {
    const nextIndex = currentStep + 1;
    if (nextIndex >= steps.length) {
      handleEndFlow();
      return;
    }
    helper.nextStep();
    showStepTooltip(nextIndex);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      showStepTooltip(currentStep - 1);
    }
  };

  const handleEndFlow = () => {
    helper.endFlow();
    tooltip.hide();
    setFlowActive(false);
    setCurrentStep(0);
  };

  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="tour-demo-container">
      {/* Start/Control Buttons */}
      <div className="tour-controls">
        {!flowActive ? (
          <button className="tour-start-btn" onClick={handleStartFlow}>
            🚀 Start Guided Tour
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              disabled={isFirst}
              className="tour-control-btn tour-control-btn-secondary"
              onClick={handlePrev}
            >
              ← Back
            </button>
            <button className="tour-control-btn tour-control-btn-primary" onClick={handleNext}>
              {isLast ? '✓ Finish' : 'Next →'}
            </button>
            <button className="tour-control-btn tour-control-btn-ghost" onClick={handleEndFlow}>
              ✕ Exit
            </button>
          </div>
        )}
      </div>

      {/* Mock Dashboard UI */}
      <MockDashboard
        contentTitle="Project Overview"
        contentDescription="Welcome to your dashboard. Start the tour to learn about the features."
        tabDataTipId
        elementIds={{
          sidebar: 'guided-sidebar',
          search: 'guided-search',
          profile: 'guided-profile',
          stats: 'guided-stats',
          actions: 'guided-actions',
        }}
        highlightedId={flowActive ? getHighlightedId(currentStep) : undefined}
      />
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

  const steps: FlowStep[] = [
    {
      id: 'step-1',
      targetId: 'tour-sidebar',
      title: 'Navigation Sidebar',
      message: 'Access all your main sections from here. Click on any item to navigate.',
    },
    {
      id: 'step-2',
      targetId: 'tour-search',
      title: 'Search Bar',
      message: 'Quickly find anything in your workspace. Supports filters and advanced queries.',
    },
    {
      id: 'step-3',
      targetId: 'tab-overview',
      title: 'Content Tabs',
      message: 'Switch between different views using these tabs. Each tab shows relevant content.',
    },
    {
      id: 'step-4',
      targetId: 'tour-stats',
      title: 'Statistics Overview',
      message: 'Monitor your key metrics at a glance. Click any card for detailed analytics.',
    },
    {
      id: 'step-5',
      targetId: 'tour-actions',
      title: 'Quick Actions',
      message: 'Common actions are just one click away. Customize these in settings.',
    },
    {
      id: 'step-6',
      targetId: 'tour-profile',
      title: 'Your Profile',
      message: "You're all set! Access your account settings and preferences here.",
    },
  ];

  // Map step index to highlighted element ID
  const getHighlightedId = (stepIndex: number): string | undefined => {
    const step = steps[stepIndex];
    return step?.targetId;
  };

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
        // Default options
        content: buildTooltipContent(stepIndex),
        html: true,
        interactive: true,
        maxWidth: 340,
        placement: 'bottom',
        showArrow: true,
        wordWrap: true,
        ellipsis: false,
        moveTransitionDuration: 300,
        // Merge step-specific options (overrides defaults)
        ...step.tooltipOptions,
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
      <MockDashboard
        contentTitle="Project Overview"
        contentDescription="Welcome to your dashboard. Start the tour to learn about the features."
        tabDataTipId
        elementIds={{
          sidebar: 'tour-sidebar',
          search: 'tour-search',
          profile: 'tour-profile',
          stats: 'tour-stats',
          actions: 'tour-actions',
        }}
        highlightedId={tourActive ? getHighlightedId(currentStep) : undefined}
      />
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
