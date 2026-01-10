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

  const showStepTooltip = (stepIndex: number) => {
    const step = steps[stepIndex];
    const target = document.querySelector(`[data-tip-id="${step.targetId}"]`);
    if (target) {
      tooltip.show(target, {
        content: `<b>${step.title}</b>: ${step.message}`,
        maxWidth: 300,
        wordWrap: true,
        placement: 'bottom',
        html: true,
      });
    }
  };

  const handleStartFlow = () => {
    helper.startFlow(steps);
    // Show first step after starting flow
    setTimeout(() => showStepTooltip(0), 0);
  };

  const handleNext = () => {
    if (helper.currentStep?.isLast) {
      handleEndFlow();
      return;
    }
    helper.nextStep();
    // Show next step tooltip
    setTimeout(() => showStepTooltip(helper.currentStepIndex + 1), 0);
  };

  const handlePrev = () => {
    if (helper.currentStepIndex > 0) {
      showStepTooltip(helper.currentStepIndex - 1);
    }
  };

  const handleEndFlow = () => {
    helper.endFlow();
    tooltip.hide();
  };

  // Use the enhanced helper API
  const { isFlowActive, currentStep } = helper;

  return (
    <div className="tour-demo-container">
      {/* Start/Control Buttons */}
      <div className="tour-controls">
        {!isFlowActive ? (
          <button className="tour-start-btn" onClick={handleStartFlow}>
            🚀 Start Guided Tour
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {(currentStep?.index ?? 0) + 1} of {currentStep?.total ?? steps.length}
            </span>
            <button
              disabled={currentStep?.isFirst}
              className="tour-control-btn tour-control-btn-secondary"
              onClick={handlePrev}
            >
              ← Back
            </button>
            <button className="tour-control-btn tour-control-btn-primary" onClick={handleNext}>
              {currentStep?.isLast ? '✓ Finish' : 'Next →'}
            </button>
            <button className="tour-control-btn tour-control-btn-ghost" onClick={handleEndFlow}>
              ✕ Exit
            </button>
          </div>
        )}
      </div>

      {/* Mock Dashboard UI - highlighting is automatic via tourHighlightClass */}
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
      />
    </div>
  );
};

export const GuidedFlow: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
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

  // Build tooltip content using helper.currentStep data
  const buildTooltipContent = (stepData: typeof helper.currentStep) => {
    if (!stepData) return '';

    return `<div class="tour-tooltip-content">
      <button class="tour-close-btn" data-tour-action="close" aria-label="Close tour">×</button>
      <div class="tour-step-badge">Step ${stepData.index + 1} of ${stepData.total}</div>
      <h4 class="tour-title">${stepData.title}</h4>
      <p class="tour-message">${stepData.message}</p>
      <div class="tour-buttons">
        ${!stepData.isFirst ? '<button class="tour-btn tour-btn-secondary" data-tour-action="prev">← Back</button>' : ''}
        <button class="tour-btn tour-btn-primary" data-tour-action="${stepData.isLast ? 'finish' : 'next'}">
          ${stepData.isLast ? '✓ Finish' : 'Next →'}
        </button>
      </div>
    </div>`;
  };

  const showStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    const target = document.querySelector(`[data-tip-id="${step.targetId}"]`);
    if (target) {
      // We need to build content with step data manually here since helper state
      // hasn't updated yet at this point
      const stepData = {
        ...step,
        index: stepIndex,
        total: steps.length,
        isFirst: stepIndex === 0,
        isLast: stepIndex === steps.length - 1,
      };
      tooltip.show(target, {
        content: buildTooltipContent(stepData),
        html: true,
        interactive: true,
        maxWidth: 340,
        placement: 'bottom',
        showArrow: true,
        wordWrap: true,
        ellipsis: false,
        moveTransitionDuration: 300,
        ...step.tooltipOptions,
      });
    }
  };

  const handleStartTour = () => {
    helper.startFlow(steps);
    showStep(0);
  };

  const handleNext = () => {
    if (!helper.currentStep?.isLast) {
      const nextIndex = helper.currentStepIndex + 1;
      helper.nextStep();
      showStep(nextIndex);
    }
  };

  const handlePrev = () => {
    if (helper.currentStepIndex > 0) {
      showStep(helper.currentStepIndex - 1);
    }
  };

  const handleEndTour = () => {
    helper.endFlow();
    tooltip.hide();
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

  // Use the enhanced helper API
  const { isFlowActive } = helper;

  return (
    <div className="tour-demo-container">
      {/* Start Tour Button */}
      <button
        className={`tour-start-btn ${isFlowActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={handleStartTour}
        disabled={isFlowActive}
      >
        {isFlowActive ? '🎯 Tour in Progress...' : '🎯 Start Interactive Tour'}
      </button>

      {/* Mock Dashboard UI - highlighting is automatic via tourHighlightClass */}
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
      />
    </div>
  );
};

export const InteractiveTour: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <InteractiveTourDemo />
    </TipMagicProvider>
  ),
};
