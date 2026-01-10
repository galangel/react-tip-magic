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
 * Shared step definitions for tour demos.
 * Takes an ID prefix to generate unique element IDs for each demo.
 */
const createTourSteps = (idPrefix: string): FlowStep[] => [
  {
    id: 'step-1',
    targetId: `${idPrefix}-sidebar`,
    title: 'Navigation Sidebar',
    message: 'Access all your main sections from here. Click on any item to navigate.',
  },
  {
    id: 'step-2',
    targetId: `${idPrefix}-search`,
    title: 'Search Bar',
    message: 'Quickly find anything in your workspace. Supports filters and advanced queries.',
  },
  {
    id: 'step-3',
    targetId: `${idPrefix}-tab-overview`,
    title: 'Content Tabs',
    message: 'Switch between different views using these tabs. Each tab shows relevant content.',
  },
  {
    id: 'step-4',
    targetId: `${idPrefix}-stats`,
    title: 'Statistics Overview',
    message: 'Monitor your key metrics at a glance. Click any card for detailed analytics.',
  },
  {
    id: 'step-5',
    targetId: `${idPrefix}-actions`,
    title: 'Quick Actions',
    message: 'Common actions are just one click away. Customize these in settings.',
  },
  {
    id: 'step-6',
    targetId: `${idPrefix}-profile`,
    title: 'Your Profile',
    message: "You're all set! Access your account settings and preferences here.",
  },
];

/**
 * Shared element ID configuration for MockDashboard
 */
const createElementIds = (idPrefix: string) => ({
  sidebar: `${idPrefix}-sidebar`,
  search: `${idPrefix}-search`,
  profile: `${idPrefix}-profile`,
  stats: `${idPrefix}-stats`,
  actions: `${idPrefix}-actions`,
});

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
  const [stepIndex, setStepIndex] = React.useState(0);

  const steps = React.useMemo(() => createTourSteps('guided'), []);
  const elementIds = React.useMemo(() => createElementIds('guided'), []);

  const showStepTooltip = React.useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step) return;
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
    },
    [steps, tooltip]
  );

  const handleStartFlow = React.useCallback(() => {
    helper.startFlow(steps);
    setStepIndex(0);
    setTimeout(() => showStepTooltip(0), 0);
  }, [helper, steps, showStepTooltip]);

  const handleNext = React.useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      helper.endFlow();
      tooltip.hide();
      setStepIndex(0);
      return;
    }
    const nextIndex = stepIndex + 1;
    helper.nextStep();
    setStepIndex(nextIndex);
    showStepTooltip(nextIndex);
  }, [stepIndex, steps.length, helper, tooltip, showStepTooltip]);

  const handlePrev = React.useCallback(() => {
    if (stepIndex > 0) {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      showStepTooltip(prevIndex);
    }
  }, [stepIndex, showStepTooltip]);

  const handleEndFlow = React.useCallback(() => {
    helper.endFlow();
    tooltip.hide();
    setStepIndex(0);
  }, [helper, tooltip]);

  const isFlowActive = helper.isFlowActive;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  return (
    <div className="tour-demo-container">
      <div className="tour-controls">
        {!isFlowActive ? (
          <button className="tour-start-btn" onClick={handleStartFlow}>
            🚀 Start Guided Tour
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {stepIndex + 1} of {steps.length}
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

      <MockDashboard
        contentTitle="Project Overview"
        contentDescription="Welcome to your dashboard. Start the tour to learn about the features."
        tabDataTipId
        tabIdPrefix="guided"
        elementIds={elementIds}
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
  const stepIndexRef = React.useRef(0);

  const steps = React.useMemo(() => createTourSteps('tour'), []);
  const elementIds = React.useMemo(() => createElementIds('tour'), []);

  const buildTooltipContent = React.useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step) return '';
      const isFirst = index === 0;
      const isLast = index === steps.length - 1;

      return `<div class="tour-tooltip-content">
      <button class="tour-close-btn" data-tour-action="close" aria-label="Close tour">×</button>
      <div class="tour-step-badge">Step ${index + 1} of ${steps.length}</div>
      <h4 class="tour-title">${step.title}</h4>
      <p class="tour-message">${step.message}</p>
      <div class="tour-buttons">
        ${!isFirst ? '<button class="tour-btn tour-btn-secondary" data-tour-action="prev">← Back</button>' : ''}
        <button class="tour-btn tour-btn-primary" data-tour-action="${isLast ? 'finish' : 'next'}">
          ${isLast ? '✓ Finish' : 'Next →'}
        </button>
      </div>
    </div>`;
    },
    [steps]
  );

  const showStep = React.useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step) return;
      const target = document.querySelector(`[data-tip-id="${step.targetId}"]`);
      if (target) {
        tooltip.show(target, {
          content: buildTooltipContent(index),
          html: true,
          interactive: true,
          maxWidth: 340,
          placement: 'bottom',
          showArrow: true,
          wordWrap: true,
          ellipsis: false,
          moveTransitionDuration: 300,
          transitionBehavior: 'move',
        });
      }
    },
    [steps, tooltip, buildTooltipContent]
  );

  const handleStartTour = React.useCallback(() => {
    helper.startFlow(steps);
    stepIndexRef.current = 0;
    showStep(0);
  }, [helper, steps, showStep]);

  const handleNext = React.useCallback(() => {
    const currentIndex = stepIndexRef.current;
    if (currentIndex >= steps.length - 1) {
      helper.endFlow();
      tooltip.hide();
      stepIndexRef.current = 0;
      return;
    }
    const nextIndex = currentIndex + 1;
    helper.nextStep();
    stepIndexRef.current = nextIndex;
    showStep(nextIndex);
  }, [helper, steps.length, tooltip, showStep]);

  const handlePrev = React.useCallback(() => {
    const currentIndex = stepIndexRef.current;
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      stepIndexRef.current = prevIndex;
      showStep(prevIndex);
    }
  }, [showStep]);

  const handleEndTour = React.useCallback(() => {
    helper.endFlow();
    tooltip.hide();
    stepIndexRef.current = 0;
  }, [helper, tooltip]);

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
  }, [handleNext, handlePrev, handleEndTour]);

  const isFlowActive = helper.isFlowActive;

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${isFlowActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={handleStartTour}
        disabled={isFlowActive}
      >
        {isFlowActive ? '🎯 Tour in Progress...' : '🎯 Start Interactive Tour'}
      </button>

      <MockDashboard
        contentTitle="Project Overview"
        contentDescription="Welcome to your dashboard. Start the tour to learn about the features."
        tabDataTipId
        tabIdPrefix="tour"
        elementIds={elementIds}
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
