import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TipAdvisor } from '../../components/TipAdvisor';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { useTipAdvisor } from '../../hooks/useTipAdvisor';
import '../../styles/index.css';
import type { TipAdvisorPresetItem } from '../../types';
import './tooltip-stories.css';

const meta: Meta = {
  title: 'Tooltip/TipAdvisor',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj;

// =============================================================================
// Toolbar Shortcuts
// =============================================================================

/**
 * Toolbar Shortcuts
 *
 * A common use case: text editor toolbar with formatting actions.
 * Press F1 to see all available shortcuts in a discoverable menu with fuzzy search.
 */
const ToolbarShortcutsDemo = () => {
  return (
    <div className="story-container">
      <p className="story-description">
        Press <kbd>F1</kbd> to open the TipAdvisor. Start typing to search!
        <br />
        Hover over menu items to highlight the corresponding toolbar button.
      </p>

      <div className="story-editor-toolbar">
        <div className="story-toolbar-group">
          <button
            className="story-toolbar-btn"
            data-tip="Bold"
            data-tip-shortcut="⌘B"
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className="story-toolbar-btn"
            data-tip="Italic"
            data-tip-shortcut="⌘I"
            aria-label="Italic"
          >
            <em>I</em>
          </button>
          <button
            className="story-toolbar-btn"
            data-tip="Underline"
            data-tip-shortcut="⌘U"
            aria-label="Underline"
          >
            <u>U</u>
          </button>
        </div>
        <div className="story-toolbar-divider" />
        <div className="story-toolbar-group">
          <button
            className="story-toolbar-btn"
            data-tip="Insert link"
            data-tip-shortcut="⌘K"
            aria-label="Insert link"
          >
            🔗
          </button>
          <button
            className="story-toolbar-btn"
            data-tip="Insert image"
            data-tip-shortcut="⌘⇧I"
            aria-label="Insert image"
          >
            🖼️
          </button>
        </div>
      </div>

      <TipAdvisor position="center" />
    </div>
  );
};

export const ToolbarShortcuts: Story = {
  render: () => (
    <TipMagicProvider>
      <ToolbarShortcutsDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Navigation Menu
// =============================================================================

/**
 * Navigation Menu
 *
 * Application navigation with keyboard shortcuts for quick access.
 */
const NavigationMenuDemo = () => {
  return (
    <div className="story-container">
      <p className="story-description">
        Press <kbd>F1</kbd> to see navigation shortcuts.
      </p>

      <nav
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px',
          background: '#1f2937',
          borderRadius: '8px',
        }}
      >
        <a
          href="#"
          data-tip="Go to Home"
          data-tip-shortcut="G H"
          style={{ color: '#fff', textDecoration: 'none', padding: '8px 16px' }}
        >
          🏠 Home
        </a>
        <a
          href="#"
          data-tip="Search"
          data-tip-shortcut="/"
          style={{ color: '#fff', textDecoration: 'none', padding: '8px 16px' }}
        >
          🔍 Search
        </a>
        <a
          href="#"
          data-tip="Notifications"
          data-tip-shortcut="G N"
          style={{ color: '#fff', textDecoration: 'none', padding: '8px 16px' }}
        >
          🔔 Notifications
        </a>
        <a
          href="#"
          data-tip="Settings"
          data-tip-shortcut="G S"
          style={{ color: '#fff', textDecoration: 'none', padding: '8px 16px' }}
        >
          ⚙️ Settings
        </a>
      </nav>

      <TipAdvisor position="bottom-right" searchPlaceholder="Search navigation..." />
    </div>
  );
};

export const NavigationMenu: Story = {
  render: () => (
    <TipMagicProvider>
      <NavigationMenuDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Custom Toggle Button
// =============================================================================

/**
 * Custom Toggle Button
 *
 * Using the `useTipAdvisor` hook for programmatic control.
 * You can create your own UI to open/close the TipAdvisor.
 */
const CustomToggleDemo = () => {
  const advisor = useTipAdvisor();

  return (
    <div className="story-container">
      <p className="story-description">
        Use <code>useTipAdvisor()</code> hook for custom toggle buttons.
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="story-button" onClick={advisor.open}>
          Open Shortcuts
        </button>
        <button
          className="story-button"
          onClick={advisor.toggle}
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          Toggle (F1)
        </button>
      </div>

      <div className="story-toolbar">
        <button
          className="story-icon-button"
          data-tip="New file"
          data-tip-shortcut="⌘N"
          aria-label="New file"
        >
          📄
        </button>
        <button
          className="story-icon-button"
          data-tip="Open file"
          data-tip-shortcut="⌘O"
          aria-label="Open file"
        >
          📂
        </button>
        <button
          className="story-icon-button"
          data-tip="Save"
          data-tip-shortcut="⌘S"
          aria-label="Save"
        >
          💾
        </button>
      </div>

      <pre
        className="story-code"
        style={{ fontSize: '11px', textAlign: 'left', marginTop: '20px' }}
      >
        {`const advisor = useTipAdvisor();

<button onClick={advisor.open}>Open</button>
<button onClick={advisor.toggle}>Toggle</button>
<button onClick={advisor.close}>Close</button>

<TipAdvisor ref={advisor.ref} />`}
      </pre>

      <TipAdvisor ref={advisor.ref} position="center" />
    </div>
  );
};

export const CustomToggleButton: Story = {
  render: () => (
    <TipMagicProvider>
      <CustomToggleDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Different Positions
// =============================================================================

/**
 * Different Positions
 *
 * The TipAdvisor can be positioned in different corners or centered.
 */
const DifferentPositionsDemo = () => {
  return (
    <div className="story-container">
      <p className="story-description">
        Click a button to see the TipAdvisor in different positions.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <PositionButton position="center" />
        <PositionButton position="top" />
        <PositionButton position="bottom" />
        <PositionButton position="top-left" />
        <PositionButton position="top-right" />
        <PositionButton position="bottom-left" />
        <PositionButton position="bottom-right" />
      </div>

      {/* Demo items */}
      <div className="story-toolbar">
        <button
          className="story-icon-button"
          data-tip="Copy"
          data-tip-shortcut="⌘C"
          aria-label="Copy"
        >
          📋
        </button>
        <button
          className="story-icon-button"
          data-tip="Paste"
          data-tip-shortcut="⌘V"
          aria-label="Paste"
        >
          📄
        </button>
        <button
          className="story-icon-button"
          data-tip="Cut"
          data-tip-shortcut="⌘X"
          aria-label="Cut"
        >
          ✂️
        </button>
      </div>
    </div>
  );
};

const PositionButton = ({
  position,
}: {
  position: 'center' | 'top' | 'bottom' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}) => {
  const advisor = useTipAdvisor();

  return (
    <>
      <button className="story-button" onClick={advisor.toggle}>
        {position}
      </button>
      <TipAdvisor ref={advisor.ref} position={position} />
    </>
  );
};

export const DifferentPositions: Story = {
  render: () => (
    <TipMagicProvider>
      <DifferentPositionsDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Custom Styling
// =============================================================================

/**
 * Custom Styling
 *
 * Override CSS custom properties to customize the appearance.
 */
const CustomStylingDemo = () => {
  return (
    <div className="story-container">
      <p className="story-description">
        Override CSS custom properties to customize the TipAdvisor.
        <br />
        Press <kbd>F1</kbd> to see the custom styled menu.
      </p>

      {/* Custom styles applied via inline style for demo */}
      <style>
        {`
          .custom-tip-advisor {
            --tip-advisor-bg: rgba(99, 102, 241, 0.95);
            --tip-advisor-item-hover-bg: rgba(255, 255, 255, 0.2);
            --tip-advisor-item-focus-bg: rgba(255, 255, 255, 0.25);
            --tip-advisor-border: 1px solid rgba(255, 255, 255, 0.2);
            --tip-advisor-border-radius: 16px;
            --tip-advisor-shortcut-bg: rgba(255, 255, 255, 0.25);
            /* Search input styling */
            --tip-advisor-search-bg: rgba(255, 255, 255, 0.15);
            --tip-advisor-search-border: rgba(255, 255, 255, 0.25);
            --tip-advisor-search-focus-border: rgba(255, 255, 255, 0.4);
            --tip-advisor-search-placeholder: rgba(255, 255, 255, 0.5);
            /* Highlight styling */
            --tip-advisor-highlight-bg: rgba(255, 255, 255, 0.3);
          }
        `}
      </style>

      <div className="story-toolbar">
        <button
          className="story-icon-button"
          data-tip="Star"
          data-tip-shortcut="S"
          aria-label="Star"
        >
          ⭐
        </button>
        <button
          className="story-icon-button"
          data-tip="Heart"
          data-tip-shortcut="H"
          aria-label="Heart"
        >
          ❤️
        </button>
        <button
          className="story-icon-button"
          data-tip="Bookmark"
          data-tip-shortcut="B"
          aria-label="Bookmark"
        >
          🔖
        </button>
      </div>

      <pre
        className="story-code"
        style={{ fontSize: '11px', textAlign: 'left', marginTop: '20px' }}
      >
        {`:root {
  --tip-advisor-bg: rgba(99, 102, 241, 0.95);
  --tip-advisor-item-hover-bg: rgba(255, 255, 255, 0.2);
  --tip-advisor-border-radius: 16px;
  /* Search input */
  --tip-advisor-search-bg: rgba(255, 255, 255, 0.15);
  --tip-advisor-search-border: rgba(255, 255, 255, 0.25);
  /* Highlight */
  --tip-advisor-highlight-bg: rgba(255, 255, 255, 0.3);
}`}
      </pre>

      <TipAdvisor position="center" className="custom-tip-advisor" />
    </div>
  );
};

export const CustomStyling: Story = {
  render: () => (
    <TipMagicProvider>
      <CustomStylingDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Many Items with Scrolling
// =============================================================================

/**
 * With Scrolling
 *
 * When there are many items, the menu becomes scrollable.
 * Hovering an item scrolls it into view and shows the tooltip.
 */
const WithScrollingDemo = () => {
  const items = [
    { icon: '📋', label: 'Copy', shortcut: '⌘C' },
    { icon: '📄', label: 'Paste', shortcut: '⌘V' },
    { icon: '✂️', label: 'Cut', shortcut: '⌘X' },
    { icon: '↩️', label: 'Undo', shortcut: '⌘Z' },
    { icon: '↪️', label: 'Redo', shortcut: '⇧⌘Z' },
    { icon: '💾', label: 'Save', shortcut: '⌘S' },
    { icon: '📂', label: 'Open', shortcut: '⌘O' },
    { icon: '🔍', label: 'Find', shortcut: '⌘F' },
    { icon: '🔄', label: 'Replace', shortcut: '⌘H' },
    { icon: '📝', label: 'New', shortcut: '⌘N' },
    { icon: '🗑️', label: 'Delete', shortcut: '⌫' },
    { icon: '📤', label: 'Share', shortcut: '⌘⇧S' },
    { icon: '🖨️', label: 'Print', shortcut: '⌘P' },
    { icon: '📊', label: 'Statistics', shortcut: '⌘⇧T' },
    { icon: '⚙️', label: 'Settings', shortcut: '⌘,' },
  ];

  return (
    <div className="story-container">
      <p className="story-description">
        Press <kbd>F1</kbd> to open the menu with many items.
        <br />
        Use arrow keys to navigate through the scrollable list.
      </p>

      <div
        className="story-toolbar"
        style={{ flexWrap: 'wrap', maxWidth: '400px', justifyContent: 'flex-start' }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            className="story-icon-button"
            data-tip={item.label}
            data-tip-shortcut={item.shortcut}
            aria-label={item.label}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <TipAdvisor position="center" searchPlaceholder="Search all shortcuts..." />
    </div>
  );
};

export const WithScrolling: Story = {
  render: () => (
    <TipMagicProvider>
      <WithScrollingDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Command Palette Style
// =============================================================================

/**
 * Command Palette
 *
 * VS Code-style command palette using TipAdvisor with predefined items.
 * Uses the `items` prop for actions not tied to DOM elements.
 */
const CommandPaletteDemo = () => {
  const advisor = useTipAdvisor();
  const [lastAction, setLastAction] = useState<string | null>(null);

  const commandItems: TipAdvisorPresetItem[] = [
    {
      id: 'toggle-sidebar',
      label: 'Toggle sidebar',
      shortcut: '⌘B',
      onSelect: () => setLastAction('Toggled sidebar'),
    },
    {
      id: 'go-to-file',
      label: 'Go to file',
      shortcut: '⌘P',
      onSelect: () => setLastAction('Opening file picker...'),
    },
    {
      id: 'find-in-files',
      label: 'Find in files',
      shortcut: '⌘⇧F',
      onSelect: () => setLastAction('Opening search...'),
    },
    {
      id: 'toggle-terminal',
      label: 'Toggle terminal',
      shortcut: '⌘`',
      onSelect: () => setLastAction('Toggled terminal'),
    },
    {
      id: 'command-palette',
      label: 'Command palette',
      shortcut: '⌘⇧P',
      onSelect: () => setLastAction('Opening command palette...'),
    },
    {
      id: 'settings',
      label: 'Open settings',
      shortcut: '⌘,',
      onSelect: () => setLastAction('Opening settings...'),
    },
    {
      id: 'new-file',
      label: 'New file',
      shortcut: '⌘N',
      onSelect: () => setLastAction('Creating new file...'),
    },
    {
      id: 'save-all',
      label: 'Save all',
      shortcut: '⌘⌥S',
      onSelect: () => setLastAction('All files saved!'),
    },
  ];

  return (
    <div className="story-container">
      <p className="story-description">
        Press <kbd>⌘K</kbd> or click the button to open a command palette.
        <br />
        Uses <code>items</code> prop with predefined actions (no DOM elements needed).
      </p>

      <button
        className="story-button"
        onClick={advisor.toggle}
        style={{
          background: '#1f2937',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: '200px',
        }}
      >
        <span>🔍</span>
        <span style={{ flex: 1, textAlign: 'left' }}>Quick actions...</span>
        <kbd
          style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px',
          }}
        >
          ⌘K
        </kbd>
      </button>

      {lastAction && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: '#10b981',
            color: 'white',
            borderRadius: '8px',
            fontWeight: 500,
          }}
        >
          ✓ {lastAction}
        </div>
      )}

      <TipAdvisor
        ref={advisor.ref}
        position="top"
        triggerKey="k"
        selector={null}
        items={commandItems}
        searchPlaceholder="Search quick actions..."
        className="command-palette-wide"
      />

      <style>{`
        .command-palette-wide {
          --tip-advisor-width: 600px;
        }
      `}</style>
    </div>
  );
};

export const CommandPalette: Story = {
  render: () => (
    <TipMagicProvider>
      <CommandPaletteDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Without Backdrop
// =============================================================================

/**
 * Without Backdrop
 *
 * The TipAdvisor can be displayed without the backdrop overlay.
 * This is useful for floating panels that don't block the page.
 */
const WithoutBackdropDemo = () => {
  return (
    <div className="story-container">
      <p className="story-description">
        Press <kbd>F1</kbd> to open the TipAdvisor without a backdrop.
        <br />
        The page behind remains interactive.
      </p>

      <div className="story-toolbar">
        <button
          className="story-icon-button"
          data-tip="Home"
          data-tip-shortcut="G H"
          aria-label="Home"
        >
          🏠
        </button>
        <button
          className="story-icon-button"
          data-tip="Settings"
          data-tip-shortcut="G S"
          aria-label="Settings"
        >
          ⚙️
        </button>
        <button
          className="story-icon-button"
          data-tip="Profile"
          data-tip-shortcut="G P"
          aria-label="Profile"
        >
          👤
        </button>
      </div>

      <TipAdvisor position="bottom-right" showBackdrop={false} />
    </div>
  );
};

export const WithoutBackdrop: Story = {
  render: () => (
    <TipMagicProvider>
      <WithoutBackdropDemo />
    </TipMagicProvider>
  ),
};

// =============================================================================
// Dual Advisors: Shortcuts + Command Palette
// =============================================================================

/**
 * Dual Advisors
 *
 * This demonstrates using two TipAdvisors on the same page:
 * - One for element-based keyboard shortcuts (F1)
 * - One for preset command palette actions (F2)
 */
const DualAdvisorsDemo = () => {
  const commandPalette = useTipAdvisor();
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Preset items for the command palette (not tied to DOM elements)
  const commandItems = [
    {
      id: 'cmd-new-file',
      label: 'New File',
      shortcut: '⌘N',
      onSelect: () => setLastAction('Created new file'),
    },
    {
      id: 'cmd-open-file',
      label: 'Open File',
      shortcut: '⌘O',
      onSelect: () => setLastAction('Opening file picker...'),
    },
    {
      id: 'cmd-save',
      label: 'Save',
      shortcut: '⌘S',
      onSelect: () => setLastAction('File saved!'),
    },
    {
      id: 'cmd-save-as',
      label: 'Save As...',
      shortcut: '⇧⌘S',
      onSelect: () => setLastAction('Opening save dialog...'),
    },
    {
      id: 'cmd-find',
      label: 'Find in Files',
      shortcut: '⇧⌘F',
      onSelect: () => setLastAction('Opening search...'),
    },
    {
      id: 'cmd-terminal',
      label: 'Toggle Terminal',
      shortcut: '⌘`',
      onSelect: () => setLastAction('Terminal toggled'),
    },
    {
      id: 'cmd-settings',
      label: 'Open Settings',
      onSelect: () => setLastAction('Opening settings...'),
    },
    {
      id: 'cmd-themes',
      label: 'Change Theme',
      onSelect: () => setLastAction('Theme picker opened'),
    },
  ];

  return (
    <div className="story-container">
      <p className="story-description">
        Two TipAdvisors on the same page:
        <br />
        <kbd>F1</kbd> — Toolbar shortcuts (element-based)
        <br />
        <kbd>F2</kbd> — Command palette (preset actions)
      </p>

      {/* Toolbar with element-based shortcuts */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '12px' }}>
          TOOLBAR (F1 to see shortcuts)
        </h4>
        <div className="story-toolbar">
          <button
            className="story-icon-button"
            data-tip="Bold"
            data-tip-shortcut="⌘B"
            aria-label="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            className="story-icon-button"
            data-tip="Italic"
            data-tip-shortcut="⌘I"
            aria-label="Italic"
          >
            <em>I</em>
          </button>
          <button
            className="story-icon-button"
            data-tip="Underline"
            data-tip-shortcut="⌘U"
            aria-label="Underline"
          >
            <u>U</u>
          </button>
          <button
            className="story-icon-button"
            data-tip="Link"
            data-tip-shortcut="⌘K"
            aria-label="Link"
          >
            🔗
          </button>
        </div>
      </div>

      {/* Command palette trigger */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ color: '#9ca3af', margin: '0 0 8px 0', fontSize: '12px' }}>
          COMMAND PALETTE (F2 to open)
        </h4>
        <button
          className="story-button"
          onClick={commandPalette.toggle}
          style={{
            background: '#1f2937',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '240px',
          }}
        >
          <span>⌘</span>
          <span style={{ flex: 1, textAlign: 'left' }}>Run command...</span>
          <kbd
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
            }}
          >
            F2
          </kbd>
        </button>
      </div>

      {/* Action feedback */}
      {lastAction && (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '8px',
            color: '#22c55e',
            fontSize: '14px',
          }}
        >
          ✓ {lastAction}
        </div>
      )}

      {/* TipAdvisor for toolbar shortcuts */}
      <TipAdvisor
        position="bottom-left"
        triggerKey="F1"
        searchPlaceholder="Search toolbar shortcuts..."
        showBackdrop={false}
      />

      {/* TipAdvisor for command palette (preset items only) */}
      <TipAdvisor
        ref={commandPalette.ref}
        position="top"
        triggerKey="F2"
        selector={null}
        items={commandItems}
        searchPlaceholder="Type a command..."
        className="command-palette-wide"
        closeOnBackdropClick={true}
      />

      <style>{`
        .command-palette-wide {
          --tip-advisor-width: 600px;
        }
      `}</style>
    </div>
  );
};

export const DualAdvisors: Story = {
  render: () => (
    <TipMagicProvider>
      <DualAdvisorsDemo />
    </TipMagicProvider>
  ),
};
