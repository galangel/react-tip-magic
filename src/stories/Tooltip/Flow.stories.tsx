import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTour } from '../../hooks/useTour';
import '../../styles/index.css';
import type { TourStep } from '../../types/tour';
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

// =============================================================================
// Simple Tour Demo
// =============================================================================

/**
 * Simple Tour - Minimal Setup
 *
 * The `useTour` hook provides a simplified API for creating guided tours.
 * Just define your steps and use the returned controls.
 *
 * **Before (with useTipMagic):** ~80 lines of boilerplate
 * **After (with useTour):** ~15 lines total
 */
const SimpleTourDemo = () => {
  const tour = useTour({
    steps: [
      { target: 'simple-sidebar', content: 'Navigate through all your main sections from here.' },
      { target: 'simple-search', content: 'Quickly find anything in your workspace.' },
      { target: 'simple-stats', content: 'Monitor your key metrics at a glance.' },
      { target: 'simple-actions', content: 'Common actions are just one click away.' },
      { target: 'simple-profile', content: 'Access your account settings and preferences.' },
    ],
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 280,
      wordWrap: true,
      transitionBehavior: 'move',
    },
    navigation: { showClose: false },
  });

  return (
    <div className="tour-demo-container">
      <div className="tour-controls">
        {!tour.isActive ? (
          <button className="tour-start-btn" onClick={tour.start}>
            Start Simple Tour
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {tour.progress.current} of {tour.progress.total}
            </span>
            <button
              className="tour-control-btn tour-control-btn-secondary"
              onClick={tour.prev}
              disabled={tour.currentStep?.isFirst}
            >
              Back
            </button>
            <button className="tour-control-btn tour-control-btn-primary" onClick={tour.next}>
              {tour.currentStep?.isLast ? 'Finish' : 'Next'}
            </button>
            <button className="tour-control-btn tour-control-btn-ghost" onClick={tour.end}>
              Exit
            </button>
          </div>
        )}
      </div>

      <MockDashboard
        contentTitle="Simple Tour Demo"
        contentDescription="This demo shows the minimal setup needed for a tour."
        elementIds={{
          sidebar: 'simple-sidebar',
          search: 'simple-search',
          profile: 'simple-profile',
          stats: 'simple-stats',
          actions: 'simple-actions',
        }}
      />
    </div>
  );
};

export const SimpleTour: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <SimpleTourDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Tour with Titles
// =============================================================================

/**
 * Tour with Titles
 *
 * Add titles to each step for a more structured experience.
 * Titles are automatically bolded when displayed.
 */
const TourWithTitlesDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'titled-sidebar',
        title: 'Navigation Sidebar',
        content: 'Access all your main sections from here. Click on any item to navigate.',
      },
      {
        target: 'titled-search',
        title: 'Search Bar',
        content: 'Quickly find anything in your workspace. Supports filters and advanced queries.',
      },
      {
        target: 'titled-stats',
        title: 'Statistics Overview',
        content: 'Monitor your key metrics at a glance. Click any card for detailed analytics.',
      },
      {
        target: 'titled-actions',
        title: 'Quick Actions',
        content: 'Common actions are just one click away. Customize these in settings.',
      },
      {
        target: 'titled-profile',
        title: 'Your Profile',
        content: "You're all set! Access your account settings and preferences here.",
      },
    ],
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 300,
      wordWrap: true,
      html: true, // Enable HTML for bold titles
    },
  });

  return (
    <div className="tour-demo-container">
      <div className="tour-controls">
        {!tour.isActive ? (
          <button className="tour-start-btn" onClick={tour.start}>
            Start Tour with Titles
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {tour.progress.current} of {tour.progress.total}
            </span>
            <button
              className="tour-control-btn tour-control-btn-secondary"
              onClick={tour.prev}
              disabled={tour.currentStep?.isFirst}
            >
              Back
            </button>
            <button className="tour-control-btn tour-control-btn-primary" onClick={tour.next}>
              {tour.currentStep?.isLast ? 'Finish' : 'Next'}
            </button>
            <button className="tour-control-btn tour-control-btn-ghost" onClick={tour.end}>
              Exit
            </button>
          </div>
        )}
      </div>

      <MockDashboard
        contentTitle="Tour with Titles"
        contentDescription="Each step has a title that's automatically bolded."
        elementIds={{
          sidebar: 'titled-sidebar',
          search: 'titled-search',
          profile: 'titled-profile',
          stats: 'titled-stats',
          actions: 'titled-actions',
        }}
      />
    </div>
  );
};

export const TourWithTitles: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <TourWithTitlesDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Advanced Tour with Callbacks
// =============================================================================

/**
 * Advanced Tour with Callbacks
 *
 * The `useTour` hook supports various callbacks for analytics and custom behavior:
 * - `onStart` - Called when the tour starts
 * - `onEnd(completed)` - Called when the tour ends (completed = true if finished all steps)
 * - `onStepChange(step, direction)` - Called when navigating between steps
 * - Per-step `onEnter` and `onExit` callbacks
 */
const AdvancedTourDemo = () => {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog((prev) => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const tour = useTour({
    steps: [
      {
        target: 'adv-sidebar',
        title: 'Navigation',
        content: 'Your navigation hub with all sections.',
        placement: 'right',
        onEnter: () => addLog('Entered: Navigation step'),
        onExit: () => addLog('Exited: Navigation step'),
      },
      {
        target: 'adv-search',
        title: 'Search',
        content: 'Find anything with powerful search.',
        onEnter: () => addLog('Entered: Search step'),
        onExit: () => addLog('Exited: Search step'),
      },
      {
        target: 'adv-profile',
        title: 'Profile',
        content: 'Manage your account settings.',
        onEnter: () => addLog('Entered: Profile step'),
        onExit: () => addLog('Exited: Profile step'),
      },
    ],
    onStart: () => addLog('Tour started!'),
    onEnd: (completed) => addLog(`Tour ended - ${completed ? 'Completed' : 'Skipped'}`),
    onStepChange: (step, direction) => addLog(`Step ${step.index + 1} (${direction})`),
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 280,
      wordWrap: true,
      html: true,
      interactive: true,
      moveTransitionDuration: 300,
      transitionBehavior: 'move',
    },
  });

  return (
    <div className="tour-demo-container">
      <div className="tour-controls">
        {!tour.isActive ? (
          <button className="tour-start-btn" onClick={tour.start}>
            Start Advanced Tour
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {tour.progress.current} of {tour.progress.total}
            </span>
            <button
              className="tour-control-btn tour-control-btn-secondary"
              onClick={tour.prev}
              disabled={tour.currentStep?.isFirst}
            >
              Back
            </button>
            <button className="tour-control-btn tour-control-btn-primary" onClick={tour.next}>
              {tour.currentStep?.isLast ? 'Finish' : 'Next'}
            </button>
            <button className="tour-control-btn tour-control-btn-ghost" onClick={tour.end}>
              Exit
            </button>
          </div>
        )}
      </div>

      {/* Event Log */}
      {log.length > 0 && (
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            padding: 12,
            background: '#1f2937',
            borderRadius: 8,
            fontFamily: 'monospace',
            fontSize: 12,
            color: '#9ca3af',
          }}
        >
          <div style={{ marginBottom: 8, color: '#6b7280', fontWeight: 600 }}>Event Log:</div>
          {log.map((entry, i) => (
            <div key={i} style={{ color: '#e5e7eb' }}>
              {entry}
            </div>
          ))}
        </div>
      )}

      <MockDashboard
        contentTitle="Advanced Tour"
        contentDescription="Watch the event log to see callbacks in action."
        elementIds={{
          sidebar: 'adv-sidebar',
          search: 'adv-search',
          profile: 'adv-profile',
        }}
      />
    </div>
  );
};

export const AdvancedTour: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <AdvancedTourDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Conditional Steps Tour
// =============================================================================

/**
 * Conditional Steps
 *
 * Steps can have a `condition` function that determines if they should be shown.
 * This is useful for feature flags, user roles, or dynamic content.
 */
const ConditionalTourDemo = () => {
  const [showAdvanced, setShowAdvanced] = useState(true);

  const steps: TourStep[] = [
    {
      target: 'cond-sidebar',
      title: 'Navigation',
      content: 'Your main navigation hub.',
    },
    {
      target: 'cond-search',
      title: 'Search',
      content: 'Find anything quickly.',
    },
    {
      target: 'cond-stats',
      title: 'Advanced Analytics',
      content: 'Deep dive into your metrics. (This step is conditionally shown)',
      condition: () => showAdvanced,
    },
    {
      target: 'cond-profile',
      title: 'Profile',
      content: 'Manage your settings.',
    },
  ];

  const tour = useTour({
    steps,
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 280,
      wordWrap: true,
      html: true,
    },
  });

  return (
    <div className="tour-demo-container">
      {/* Toggle for conditional step */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          <span style={{ fontSize: 14, color: '#374151' }}>
            Show Advanced Analytics step ({tour.totalSteps} steps total)
          </span>
        </label>
      </div>

      <div className="tour-controls">
        {!tour.isActive ? (
          <button className="tour-start-btn" onClick={tour.start}>
            Start Conditional Tour
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {tour.progress.current} of {tour.progress.total}
            </span>
            <button
              className="tour-control-btn tour-control-btn-secondary"
              onClick={tour.prev}
              disabled={tour.currentStep?.isFirst}
            >
              Back
            </button>
            <button className="tour-control-btn tour-control-btn-primary" onClick={tour.next}>
              {tour.currentStep?.isLast ? 'Finish' : 'Next'}
            </button>
            <button className="tour-control-btn tour-control-btn-ghost" onClick={tour.end}>
              Exit
            </button>
          </div>
        )}
      </div>

      <MockDashboard
        contentTitle="Conditional Steps"
        contentDescription="Toggle the checkbox above to show/hide the Advanced Analytics step."
        elementIds={{
          sidebar: 'cond-sidebar',
          search: 'cond-search',
          stats: 'cond-stats',
          profile: 'cond-profile',
        }}
      />
    </div>
  );
};

export const ConditionalSteps: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <ConditionalTourDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Dynamic Content Tour
// =============================================================================

/**
 * Dynamic Content
 *
 * Step content can be a function that receives the current step info.
 * This allows for dynamic content based on step index, progress, etc.
 */
const DynamicContentDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'dyn-sidebar',
        content: (step) =>
          `Step ${step.index + 1} of ${step.total}: This is the navigation sidebar.`,
      },
      {
        target: 'dyn-search',
        content: (step) =>
          step.isLast
            ? 'Almost there! This is the search bar.'
            : `${step.total - step.index - 1} more steps to go. This is the search bar.`,
      },
      {
        target: 'dyn-stats',
        content: (step) =>
          `You're ${Math.round(((step.index + 1) / step.total) * 100)}% through the tour!`,
      },
      {
        target: 'dyn-profile',
        content: (step) =>
          step.isLast
            ? "Congratulations! You've reached the final step. This is your profile area."
            : 'Keep going! This is the profile section.',
      },
    ],
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 300,
      wordWrap: true,
    },
  });

  return (
    <div className="tour-demo-container">
      <div className="tour-controls">
        {!tour.isActive ? (
          <button className="tour-start-btn" onClick={tour.start}>
            Start Dynamic Content Tour
          </button>
        ) : (
          <div className="tour-control-buttons">
            <span className="tour-step-indicator">
              Step {tour.progress.current} of {tour.progress.total}
            </span>
            <button
              className="tour-control-btn tour-control-btn-secondary"
              onClick={tour.prev}
              disabled={tour.currentStep?.isFirst}
            >
              Back
            </button>
            <button className="tour-control-btn tour-control-btn-primary" onClick={tour.next}>
              {tour.currentStep?.isLast ? 'Finish' : 'Next'}
            </button>
            <button className="tour-control-btn tour-control-btn-ghost" onClick={tour.end}>
              Exit
            </button>
          </div>
        )}
      </div>

      <MockDashboard
        contentTitle="Dynamic Content"
        contentDescription="Each tooltip shows different content based on current progress."
        elementIds={{
          sidebar: 'dyn-sidebar',
          search: 'dyn-search',
          stats: 'dyn-stats',
          profile: 'dyn-profile',
        }}
      />
    </div>
  );
};

export const DynamicContent: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <DynamicContentDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Jump to Step Demo
// =============================================================================

/**
 * Jump to Step
 *
 * Use `tour.goTo(index)` to jump to any step directly.
 * This is useful for step indicators or allowing users to skip ahead.
 */
const JumpToStepDemo = () => {
  const tour = useTour({
    steps: [
      { target: 'jump-sidebar', title: 'Step 1', content: 'Navigation sidebar' },
      { target: 'jump-search', title: 'Step 2', content: 'Search bar' },
      { target: 'jump-stats', title: 'Step 3', content: 'Statistics overview' },
      { target: 'jump-actions', title: 'Step 4', content: 'Quick actions' },
      { target: 'jump-profile', title: 'Step 5', content: 'Your profile' },
    ],
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 250,
      wordWrap: true,
      html: true,
    },
  });

  return (
    <div className="tour-demo-container">
      <div className="tour-controls">
        {!tour.isActive ? (
          <button className="tour-start-btn" onClick={tour.start}>
            Start Tour
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Step dots - clickable to jump */}
            <div style={{ display: 'flex', gap: 8 }}>
              {Array.from({ length: tour.totalSteps }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => tour.goTo(index)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    background:
                      tour.currentStep?.index === index
                        ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                        : '#e5e7eb',
                    color: tour.currentStep?.index === index ? 'white' : '#374151',
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="tour-control-buttons">
              <button
                className="tour-control-btn tour-control-btn-secondary"
                onClick={tour.prev}
                disabled={tour.currentStep?.isFirst}
              >
                Back
              </button>
              <button className="tour-control-btn tour-control-btn-primary" onClick={tour.next}>
                {tour.currentStep?.isLast ? 'Finish' : 'Next'}
              </button>
              <button className="tour-control-btn tour-control-btn-ghost" onClick={tour.end}>
                Exit
              </button>
            </div>
          </div>
        )}
      </div>

      <MockDashboard
        contentTitle="Jump to Step"
        contentDescription="Click any numbered dot above to jump directly to that step."
        elementIds={{
          sidebar: 'jump-sidebar',
          search: 'jump-search',
          stats: 'jump-stats',
          actions: 'jump-actions',
          profile: 'jump-profile',
        }}
      />
    </div>
  );
};

export const JumpToStep: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <JumpToStepDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Built-in Navigation Controls
// =============================================================================

/**
 * Built-in Navigation Controls
 *
 * Enable `navigation.showControls` to render navigation buttons
 * directly inside the tooltip. No need to manage external controls!
 *
 * The navigation includes:
 * - Close button (top right)
 * - Back button (previous step)
 * - Next/Finish button (next step or complete)
 */
const BuiltInNavigationDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'nav-sidebar',
        title: 'Navigation Sidebar',
        content: 'Access all your main sections from here.',
      },
      {
        target: 'nav-search',
        title: 'Search Bar',
        content: 'Quickly find anything in your workspace.',
      },
      {
        target: 'nav-stats',
        title: 'Statistics',
        content: 'Monitor your key metrics at a glance.',
      },
      {
        target: 'nav-profile',
        title: 'Your Profile',
        content: "You're all set! Access your account here.",
      },
    ],
    navigation: {
      showControls: true,
      showClose: true,
    },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Built-in Navigation'}
      </button>

      <MockDashboard
        contentTitle="Built-in Navigation"
        contentDescription="Navigation controls are rendered inside the tooltip."
        elementIds={{
          sidebar: 'nav-sidebar',
          search: 'nav-search',
          stats: 'nav-stats',
          profile: 'nav-profile',
        }}
      />
    </div>
  );
};

export const BuiltInNavigation: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <BuiltInNavigationDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Progress Indicator
// =============================================================================

/**
 * Progress Indicator
 *
 * Show step progress in the tooltip footer (e.g., "Step 1 of 6").
 * - `showProgress: true` in tour options enables it for all steps
 * - Can be overridden per step with `showProgress: false`
 *
 * The progress indicator appears on the bottom left, with navigation buttons on the right.
 */
const ProgressIndicatorDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'progress-sidebar',
        title: 'Navigation',
        content: 'Access all sections from the sidebar.',
      },
      {
        target: 'progress-search',
        title: 'Search',
        content: 'Find anything with our smart search.',
      },
      {
        target: 'progress-stats',
        title: 'Analytics',
        content: 'View your key metrics at a glance.',
      },
      {
        target: 'progress-profile',
        title: 'Profile',
        content: 'Manage your account settings.',
      },
    ],
    navigation: {
      showControls: true,
    },
    progress: { show: true, type: 'steps' },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
      transitionBehavior: 'move',
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Progress (Steps)'}
      </button>

      <MockDashboard
        contentTitle="Progress Indicator (Steps)"
        contentDescription="The tooltip shows 'Step X of Y' progress."
        elementIds={{
          sidebar: 'progress-sidebar',
          search: 'progress-search',
          stats: 'progress-stats',
          profile: 'progress-profile',
        }}
      />
    </div>
  );
};

export const ProgressIndicator: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <ProgressIndicatorDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Ring Progress Indicator
// =============================================================================

/**
 * Ring Progress Indicator
 *
 * Use a circular ring to show progress.
 * Set `progress: { show: true, type: 'ring' }` in tour options.
 */
const RingProgressDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'ring-sidebar',
        title: 'Navigation',
        content: 'Access all sections from the sidebar.',
      },
      {
        target: 'ring-search',
        title: 'Search',
        content: 'Find anything with our smart search.',
      },
      {
        target: 'ring-stats',
        title: 'Analytics',
        content: 'View your key metrics at a glance.',
      },
      {
        target: 'ring-profile',
        title: 'Profile',
        content: 'Manage your account settings.',
      },
    ],
    navigation: {
      showControls: true,
    },
    progress: { show: true, type: 'ring' },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
      transitionBehavior: 'move',
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Ring Progress'}
      </button>

      <MockDashboard
        contentTitle="Ring Progress Indicator"
        contentDescription="A circular progress ring shows completion."
        elementIds={{
          sidebar: 'ring-sidebar',
          search: 'ring-search',
          stats: 'ring-stats',
          profile: 'ring-profile',
        }}
      />
    </div>
  );
};

export const RingProgress: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <RingProgressDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Custom Progress Render
// =============================================================================

/**
 * Custom Progress Render
 *
 * Use a custom render function for complete control over progress display.
 * The render function receives `{ currentStep, totalSteps }` and returns an HTML string.
 *
 * **Note:** Avoid using semicolons (`;`) in inline styles within the returned HTML,
 * as they conflict with the tooltip content parsing. Use CSS classes for complex styling.
 */
const CustomProgressDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'custom-sidebar',
        title: 'Navigation',
        content: 'Access all sections from the sidebar.',
      },
      {
        target: 'custom-search',
        title: 'Search',
        content: 'Find anything with our smart search.',
      },
      {
        target: 'custom-stats',
        title: 'Analytics',
        content: 'View your key metrics at a glance.',
      },
      {
        target: 'custom-profile',
        title: 'Profile',
        content: 'Manage your account settings.',
      },
    ],
    navigation: {
      showControls: true,
    },
    progress: {
      show: true,
      // Note: Avoid semicolons in inline styles (they conflict with content parsing)
      // Use CSS classes for styling, or simple inline styles without semicolons
      render: ({ currentStep, totalSteps }) =>
        `<span class="tip-magic-tour-progress">📍 ${currentStep} / ${totalSteps}</span>`,
    },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
      transitionBehavior: 'move',
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Custom Progress'}
      </button>

      <MockDashboard
        contentTitle="Custom Progress Render"
        contentDescription="Use a custom render function for progress display."
        elementIds={{
          sidebar: 'custom-sidebar',
          search: 'custom-search',
          stats: 'custom-stats',
          profile: 'custom-profile',
        }}
      />
    </div>
  );
};

export const CustomProgress: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <CustomProgressDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Custom Navigation Labels
// =============================================================================

/**
 * Custom Navigation Labels
 *
 * Customize the labels for navigation buttons:
 * - `nextLabel` - Default: "Next"
 * - `backLabel` - Default: "Back"
 * - `finishLabel` - Default: "Finish" (shown on last step)
 */
const CustomLabelsDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'labels-sidebar',
        title: 'Welcome!',
        content: "Let's take a quick tour of the dashboard.",
      },
      {
        target: 'labels-search',
        title: 'Search',
        content: 'Find anything with our powerful search.',
      },
      {
        target: 'labels-profile',
        title: 'All Done!',
        content: "You're ready to explore. Enjoy!",
      },
    ],
    navigation: {
      showControls: true,
      nextLabel: 'Continue →',
      backLabel: '← Go Back',
      finishLabel: "Let's Go! 🚀",
      showClose: true,
    },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Custom Labels'}
      </button>

      <MockDashboard
        contentTitle="Custom Labels"
        contentDescription="Notice the custom button labels in the tooltip."
        elementIds={{
          sidebar: 'labels-sidebar',
          search: 'labels-search',
          profile: 'labels-profile',
        }}
      />
    </div>
  );
};

export const CustomLabels: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <CustomLabelsDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Per-Step Navigation Overrides
// =============================================================================

/**
 * Per-Step Navigation Overrides
 *
 * Override navigation settings for individual steps.
 * Useful for customizing specific steps in the flow.
 */
const PerStepOverridesDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'override-sidebar',
        title: 'Step 1',
        content: 'This step uses default labels.',
      },
      {
        target: 'override-search',
        title: 'Important Step!',
        content: 'This step has a custom next label.',
        navigation: {
          nextLabel: 'I understand, continue →',
        },
      },
      {
        target: 'override-stats',
        title: 'Step 3',
        content: 'Back to default labels.',
      },
      {
        target: 'override-profile',
        title: 'Final Step',
        content: 'Custom finish button!',
        navigation: {
          finishLabel: 'Complete Tour ✓',
        },
      },
    ],
    navigation: {
      showControls: true,
    },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Per-Step Overrides'}
      </button>

      <MockDashboard
        contentTitle="Per-Step Overrides"
        contentDescription="Some steps have custom navigation labels."
        elementIds={{
          sidebar: 'override-sidebar',
          search: 'override-search',
          stats: 'override-stats',
          profile: 'override-profile',
        }}
      />
    </div>
  );
};

export const PerStepOverrides: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <PerStepOverridesDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Tour with Images
// =============================================================================

/**
 * Tour with Images
 *
 * Add images to steps for a richer experience (Pokemon card style).
 * Images appear above the content in the tooltip.
 */
const TourWithImagesDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'img-sidebar',
        title: 'Navigation',
        content: 'Access all your main sections from the sidebar.',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
      },
      {
        target: 'img-search',
        title: 'Search',
        content: 'Find anything with our powerful search feature.',
        image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
      },
      {
        target: 'img-stats',
        title: 'Analytics',
        content: 'Monitor your key metrics at a glance.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
      },
      {
        target: 'img-profile',
        title: 'Profile',
        content: 'Manage your account settings and preferences.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=200&fit=crop',
      },
    ],
    navigation: {
      showControls: true,
    },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 350,
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Images'}
      </button>

      <MockDashboard
        contentTitle="Tour with Images"
        contentDescription="Each step shows an image above the content."
        elementIds={{
          sidebar: 'img-sidebar',
          search: 'img-search',
          stats: 'img-stats',
          profile: 'img-profile',
        }}
      />
    </div>
  );
};

export const TourWithImages: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <TourWithImagesDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Focus Mode (Backdrop Blur)
// =============================================================================

/**
 * Focus Mode (Backdrop Blur)
 *
 * Enable `focus: true` to add a blurred backdrop that highlights
 * the target element and tooltip. Great for onboarding!
 *
 * The backdrop can be customized via CSS:
 * - `.tip-magic-tour-backdrop` - The overlay element
 * - `--tip-magic-tour-backdrop-blur` - Blur amount
 * - `--tip-magic-tour-backdrop-bg` - Background color/opacity
 */
const FocusModeDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'focus-sidebar',
        title: 'Navigation',
        content: 'Notice how the background is blurred to help you focus.',
        tooltipOptions: {
          ellipsis: false,
          maxLines: 2,
          wordWrap: true,
          textBreak: 'normal',
        },
      },
      {
        target: 'focus-search',
        title: 'Search',
        content: 'The target element stands out from the rest.',
      },
      {
        target: 'focus-stats',
        title: 'Statistics',
        content: 'Great for drawing attention to important elements.',
      },
      {
        target: 'focus-profile',
        title: 'Profile',
        content: 'Focus mode makes your tour feel more immersive.',
      },
    ],
    navigation: {
      showControls: true,
    },
    focus: true, // Enable focus for entire tour
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
      transitionBehavior: 'move',
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Focus Mode Tour'}
      </button>

      <MockDashboard
        contentTitle="Focus Mode"
        contentDescription="The background is blurred during the tour."
        elementIds={{
          sidebar: 'focus-sidebar',
          search: 'focus-search',
          stats: 'focus-stats',
          profile: 'focus-profile',
        }}
      />
    </div>
  );
};

export const FocusMode: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <FocusModeDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Focus on Specific Steps
// =============================================================================

/**
 * Focus on Specific Steps
 *
 * Enable focus only for important steps by setting `focus: true`
 * on individual steps instead of the entire tour.
 */
const FocusSpecificStepsDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'specific-sidebar',
        title: 'Navigation',
        content: 'This step has no focus backdrop.',
      },
      {
        target: 'specific-search',
        title: 'Important: Search',
        content: 'This step has focus enabled to draw attention!',
        focus: true, // Focus only on this step
      },
      {
        target: 'specific-stats',
        title: 'Statistics',
        content: 'Back to normal - no focus on this step.',
      },
      {
        target: 'specific-profile',
        title: 'Critical: Profile Setup',
        content: 'Focus is back for this important step!',
        focus: true, // Focus only on this step
      },
    ],
    navigation: {
      showControls: true,
    },
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 320,
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour (Focus on Specific Steps)'}
      </button>

      <MockDashboard
        contentTitle="Focus on Specific Steps"
        contentDescription="Steps 2 and 4 have focus enabled."
        elementIds={{
          sidebar: 'specific-sidebar',
          search: 'specific-search',
          stats: 'specific-stats',
          profile: 'specific-profile',
        }}
      />
    </div>
  );
};

export const FocusSpecificSteps: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <FocusSpecificStepsDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Always Visible Elements
// =============================================================================

/**
 * Always Visible Elements
 *
 * Use `data-tip-always-visible` on elements that should remain visible
 * (not masked) during tour focus mode. Perfect for:
 * - Application headers
 * - Navigation sidebars
 * - Important persistent UI elements
 *
 * These elements will appear above the backdrop alongside the tour target.
 */
const AlwaysVisibleDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'always-stats',
        title: 'Statistics Overview',
        content:
          'Notice how the header and sidebar remain visible and accessible during this tour.',
      },
      {
        target: 'always-actions',
        title: 'Quick Actions',
        content:
          'The header stays visible so users can still access navigation or exit the app if needed.',
      },
      {
        target: 'always-search',
        title: 'Search',
        content:
          'Elements with data-tip-always-visible are never masked, even when focus mode is active.',
      },
    ],
    navigation: {
      showControls: true,
    },
    focus: true, // Enable focus for entire tour
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 340,
      textBreak: 'normal',
      wordWrap: true,
      transitionBehavior: 'move',
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Tour with Always Visible Elements'}
      </button>

      {/* Custom dashboard with always-visible header */}
      <div className="mock-dashboard">
        {/* Sidebar - marked as always visible */}
        <aside className="mock-sidebar" data-tip-always-visible data-tip-id="always-sidebar">
          <div className="mock-logo">📊 Dashboard</div>
          <nav className="mock-nav">
            <a
              className="mock-nav-item active"
              data-tip="Go to home page"
              data-tip-placement="right"
            >
              🏠 Home
            </a>
            <a
              className="mock-nav-item"
              data-tip="View analytics and reports"
              data-tip-placement="right"
            >
              📊 Analytics
            </a>
            <a className="mock-nav-item" data-tip="Manage user accounts" data-tip-placement="right">
              👥 Users
            </a>
            <a className="mock-nav-item" data-tip="Browse all projects" data-tip-placement="right">
              📁 Projects
            </a>
            <a
              className="mock-nav-item"
              data-tip="Configure preferences"
              data-tip-placement="right"
            >
              ⚙️ Settings
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="mock-main">
          {/* Header - marked as always visible */}
          <header className="mock-header" data-tip-always-visible>
            <div className="mock-search" data-tip-id="always-search">
              <span className="mock-search-icon">🔍</span>
              <input type="text" placeholder="Search..." className="mock-search-input" />
            </div>
            <div className="mock-profile" data-tip-id="always-profile">
              <span className="mock-avatar">👤</span>
              <span className="mock-username">John Doe</span>
            </div>
          </header>

          {/* Content Title */}
          <div className="mock-content-header">
            <h1 className="mock-content-title">Always Visible Elements</h1>
            <p className="mock-content-description">
              The header and sidebar have <code>data-tip-always-visible</code> - they stay visible
              during focus mode.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mock-stats" data-tip-id="always-stats">
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
          <div className="mock-actions" data-tip-id="always-actions">
            <h3 className="mock-section-title">Quick Actions</h3>
            <div className="mock-action-buttons">
              <button className="mock-action-btn" data-tip="Create a new project">
                + New Project
              </button>
              <button className="mock-action-btn" data-tip="Export data to CSV">
                📤 Export Data
              </button>
              <button className="mock-action-btn" data-tip="Email report to team">
                📧 Send Report
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export const AlwaysVisibleElements: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <AlwaysVisibleDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Complete Tour Example
// =============================================================================

/**
 * Complete Tour Example
 *
 * A comprehensive example combining:
 * - Built-in navigation
 * - Static images
 * - Animated GIFs
 * - Embedded YouTube video
 * - Native video (mp4)
 * - Focus mode
 * - Custom labels
 * - Callbacks
 */
const CompleteTourDemo = () => {
  const tour = useTour({
    steps: [
      {
        target: 'complete-sidebar',
        title: 'Welcome to Your Dashboard!',
        content: "Let's take a quick tour of the main features.",
        // Static image
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=150&fit=crop',
        focus: true,
      },
      {
        target: 'complete-search',
        title: 'Powerful Search',
        content: 'Find anything instantly with our smart search.',
        // Animated GIF
        image: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
      },
      {
        target: 'complete-stats',
        title: 'Real-time Analytics',
        content: 'Monitor your key metrics at a glance.',
        // Embedded YouTube video
        video: {
          src: 'https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0&autoplay=1&mute=1',
          type: 'embed',
        },
        focus: true,
      },
      {
        target: 'complete-actions',
        title: 'Quick Actions',
        content: 'Common tasks are just one click away.',
        // Native video (mp4)
        video: {
          src: 'https://www.w3schools.com/html/mov_bbb.mp4',
          type: 'native',
          autoplay: true,
          loop: true,
          muted: true,
        },
      },
      {
        target: 'complete-profile',
        title: "You're All Set!",
        content: 'Explore your dashboard and make it yours.',
        focus: true,
        navigation: {
          finishLabel: 'Start Exploring! 🎉',
        },
      },
    ],
    navigation: {
      showControls: true,
      nextLabel: 'Continue',
      backLabel: 'Back',
    },
    onStart: () => console.log('Tour started'),
    onEnd: (completed) => console.log(completed ? 'Tour completed!' : 'Tour skipped'),
    tooltipOptions: {
      placement: 'bottom',
      maxWidth: 400,
      transitionBehavior: 'move',
    },
  });

  return (
    <div className="tour-demo-container">
      <button
        className={`tour-start-btn ${tour.isActive ? 'tour-start-btn-disabled' : ''}`}
        onClick={tour.start}
        disabled={tour.isActive}
      >
        {tour.isActive ? 'Tour in Progress...' : 'Start Complete Tour Experience'}
      </button>

      <MockDashboard
        contentTitle="Complete Tour Example"
        contentDescription="Features: navigation, images, GIFs, videos, focus mode."
        elementIds={{
          sidebar: 'complete-sidebar',
          search: 'complete-search',
          stats: 'complete-stats',
          actions: 'complete-actions',
          profile: 'complete-profile',
        }}
      />
    </div>
  );
};

export const CompleteTour: Story = {
  render: () => (
    <TipMagicProvider options={{ tourHighlightClass: 'tour-highlight' }}>
      <CompleteTourDemo />
    </TipMagicProvider>
  ),
};
