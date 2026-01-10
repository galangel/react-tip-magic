import React from 'react';

/**
 * Navigation item configuration
 */
export interface NavItem {
  icon: string;
  label: string;
  tip: string;
  id?: string;
}

/**
 * Tab item configuration
 */
export interface TabItem {
  label: string;
  tip: string;
  active?: boolean;
  id?: string;
}

/**
 * Stat card configuration
 */
export interface StatItem {
  value: string;
  label: string;
}

/**
 * Action button configuration
 */
export interface ActionItem {
  label: string;
  tip?: string;
}

/**
 * Props for MockDashboard component
 */
export interface MockDashboardProps {
  /** Navigation items in the sidebar */
  navItems?: NavItem[];
  /** Tab items in the main content */
  tabs?: TabItem[];
  /** Stat cards to display */
  stats?: StatItem[];
  /** Quick action buttons */
  actions?: ActionItem[];

  /** Title shown in the sidebar */
  sidebarTitle?: string;
  /** Title shown in the main content area */
  contentTitle?: string;
  /** Description shown below the content title */
  contentDescription?: string;

  /** Enable tooltip group behavior for navigation items */
  navTooltipGroup?: string;
  /** Enable tooltip group behavior for tabs */
  tabTooltipGroup?: string;

  /** Enable data-tip-move on navigation items */
  navMove?: boolean;
  /** Enable data-tip-move on tabs */
  tabMove?: boolean;

  /** Current highlighted element ID (for tour mode) */
  highlightedId?: string;

  /** Data attributes to add to nav items (for tour targets) */
  navDataTipId?: boolean;
  /** Data attributes to add to tabs (for tour targets) */
  tabDataTipId?: boolean;
  /** Data attributes to add to other elements */
  elementIds?: {
    sidebar?: string;
    search?: string;
    profile?: string;
    stats?: string;
    actions?: string;
  };

  /** Custom content to render inside the main content area */
  children?: React.ReactNode;
}

/**
 * Default navigation items
 */
const defaultNavItems: NavItem[] = [
  { icon: '🏠', label: 'Home', tip: 'Go to home page' },
  { icon: '📊', label: 'Analytics', tip: 'View analytics and reports' },
  { icon: '👥', label: 'Users', tip: 'Manage user accounts' },
  { icon: '📁', label: 'Projects', tip: 'Browse all projects' },
  { icon: '⚙️', label: 'Settings', tip: 'Configure preferences' },
];

/**
 * Default tab items
 */
const defaultTabs: TabItem[] = [
  { label: 'Overview', tip: 'Project overview and summary', active: true },
  { label: 'Tasks', tip: 'View and manage tasks' },
  { label: 'Team', tip: 'Team members and roles' },
  { label: 'Files', tip: 'Attached files and documents' },
  { label: 'Activity', tip: 'Recent activity log' },
];

/**
 * Default stat items
 */
const defaultStats: StatItem[] = [
  { value: '1,234', label: 'Total Users' },
  { value: '567', label: 'Active Now' },
  { value: '89%', label: 'Satisfaction' },
];

/**
 * Default action items
 */
const defaultActions: ActionItem[] = [
  { label: '+ New Project', tip: 'Create a new project' },
  { label: '📤 Export Data', tip: 'Export data to CSV' },
  { label: '📧 Send Report', tip: 'Email report to team' },
];

/**
 * MockDashboard - A reusable dashboard layout for Storybook demos
 *
 * This component provides a consistent mock UI for demonstrating:
 * - Tooltip transitions and groups
 * - Interactive tours
 * - Various tooltip features
 */
export function MockDashboard({
  navItems = defaultNavItems,
  tabs = defaultTabs,
  stats = defaultStats,
  actions = defaultActions,
  sidebarTitle = '📊 Dashboard',
  contentTitle = 'Project Overview',
  contentDescription,
  navTooltipGroup,
  tabTooltipGroup,
  navMove = false,
  tabMove = false,
  highlightedId,
  navDataTipId = false,
  tabDataTipId = false,
  elementIds = {},
  children,
}: MockDashboardProps) {
  return (
    <div className="mock-dashboard">
      {/* Sidebar */}
      <aside
        className={`mock-sidebar ${highlightedId === elementIds.sidebar ? 'tour-highlight' : ''}`}
        {...(elementIds.sidebar ? { 'data-tip-id': elementIds.sidebar } : {})}
      >
        <div className="mock-logo">{sidebarTitle}</div>
        <nav className="mock-nav">
          {navItems.map((item, index) => {
            const itemId = item.id || `nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`;
            const isHighlighted = highlightedId === itemId;

            return (
              <a
                key={item.label}
                className={`mock-nav-item ${index === 0 ? 'active' : ''} ${isHighlighted ? 'tour-highlight' : ''}`}
                data-tip={item.tip}
                data-tip-placement="right"
                {...(navMove ? { 'data-tip-move': '' } : {})}
                {...(navTooltipGroup ? { 'data-tip-group': navTooltipGroup } : {})}
                {...(navDataTipId ? { 'data-tip-id': itemId } : {})}
              >
                {item.icon} {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="mock-main">
        {/* Header */}
        <header className="mock-header">
          <div
            className={`mock-search ${highlightedId === elementIds.search ? 'tour-highlight' : ''}`}
            {...(elementIds.search ? { 'data-tip-id': elementIds.search } : {})}
          >
            <span className="mock-search-icon">🔍</span>
            <input type="text" placeholder="Search..." className="mock-search-input" />
          </div>
          <div
            className={`mock-profile ${highlightedId === elementIds.profile ? 'tour-highlight' : ''}`}
            {...(elementIds.profile ? { 'data-tip-id': elementIds.profile } : {})}
          >
            <span className="mock-avatar">👤</span>
            <span className="mock-username">John Doe</span>
          </div>
        </header>

        {/* Content Title */}
        <div className="mock-content-header">
          <h1 className="mock-content-title">{contentTitle}</h1>
          {contentDescription && <p className="mock-content-description">{contentDescription}</p>}
        </div>

        {/* Tab Group */}
        {tabs.length > 0 && (
          <div className="mock-tabs">
            {tabs.map((tab) => {
              const tabId = tab.id || `tab-${tab.label.toLowerCase().replace(/\s+/g, '-')}`;
              const isHighlighted = highlightedId === tabId;

              return (
                <button
                  key={tab.label}
                  className={`mock-tab ${tab.active ? 'active' : ''} ${isHighlighted ? 'tour-highlight' : ''}`}
                  data-tip={tab.tip}
                  {...(tabMove ? { 'data-tip-move': '' } : {})}
                  {...(tabTooltipGroup ? { 'data-tip-group': tabTooltipGroup } : {})}
                  {...(tabDataTipId ? { 'data-tip-id': tabId } : {})}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Custom Content or Default Content */}
        {children || (
          <>
            {/* Stats Cards */}
            {stats.length > 0 && (
              <div
                className={`mock-stats ${highlightedId === elementIds.stats ? 'tour-highlight' : ''}`}
                {...(elementIds.stats ? { 'data-tip-id': elementIds.stats } : {})}
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="mock-stat-card">
                    <span className="mock-stat-value">{stat.value}</span>
                    <span className="mock-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions */}
            {actions.length > 0 && (
              <div
                className={`mock-actions ${highlightedId === elementIds.actions ? 'tour-highlight' : ''}`}
                {...(elementIds.actions ? { 'data-tip-id': elementIds.actions } : {})}
              >
                <h3 className="mock-section-title">Quick Actions</h3>
                <div className="mock-action-buttons">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      className="mock-action-btn"
                      {...(action.tip ? { 'data-tip': action.tip } : {})}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
