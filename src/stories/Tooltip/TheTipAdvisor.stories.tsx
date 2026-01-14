import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';
import { TipMagicProvider } from '../../components/TipMagicProvider';
import { TipAdvisor } from '../../components/TipAdvisor';
import type { TipAdvisorAPI, TipAdvisorPosition } from '../../types/tipAdvisor';
import '../../styles/index.css';
import './tooltip-stories.css';

/**
 * The TipAdvisor component provides a discoverable menu of all tooltips
 * with keyboard shortcuts. Users can press F1 (or a custom key) to open
 * the menu, search for shortcuts, and trigger actions.
 *
 * ## Features
 * - **Fuzzy search**: Type to filter shortcuts with highlighted matches
 * - **Keyboard activated**: Press F1 to open (configurable)
 * - **Hover preview**: Hovering a menu item shows the tooltip on the target element
 * - **Click to action**: Clicking a menu item triggers the target element's click
 * - **Keyboard navigation**: Arrow keys to move, Enter to select, Escape to close
 * - **Optional backdrop**: Show or hide the backdrop overlay
 * - **Fully themeable**: All colors and sizing via CSS custom properties
 * - **Position options**: Center, corners (bottom-right, top-left, etc.)
 */
const meta: Meta = {
  title: 'The TipAdvisor',
  tags: ['!autodocs'],
  parameters: {
    layout: 'centered',
    options: {
      panelPosition: 'right',
    },
    viewMode: 'story',
    previewTabs: {
      'storybook/docs/panel': { hidden: true },
    },
  },
};

export default meta;

interface TipAdvisorArgs {
  position: TipAdvisorPosition;
  triggerKey: string;
  showCloseButton: boolean;
  showBackdrop: boolean;
  closeOnBackdropClick: boolean;
  searchPlaceholder: string;
  itemCount: number;
}

type Story = StoryObj<TipAdvisorArgs>;

const DEMO_ITEMS = [
  { icon: '📋', label: 'Copy', shortcut: '⌘C' },
  { icon: '📄', label: 'Paste', shortcut: '⌘V' },
  { icon: '✂️', label: 'Cut', shortcut: '⌘X' },
  { icon: '↩️', label: 'Undo', shortcut: '⌘Z' },
  { icon: '↪️', label: 'Redo', shortcut: '⇧⌘Z' },
  { icon: '💾', label: 'Save', shortcut: '⌘S' },
  { icon: '🔍', label: 'Search', shortcut: '⌘F' },
  { icon: '🗑️', label: 'Delete', shortcut: '⌫' },
];

const TipAdvisorDemo = ({
  position,
  triggerKey,
  showCloseButton,
  showBackdrop,
  closeOnBackdropClick,
  searchPlaceholder,
  itemCount,
}: TipAdvisorArgs) => {
  const advisorRef = useRef<TipAdvisorAPI>(null);
  const hasOpened = useRef(false);

  // Auto-open the advisor when component mounts or args change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasOpened.current) {
        // Close and reopen to apply new settings
        advisorRef.current?.close();
      }
      advisorRef.current?.open();
      hasOpened.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [
    position,
    triggerKey,
    showCloseButton,
    showBackdrop,
    closeOnBackdropClick,
    searchPlaceholder,
    itemCount,
  ]);

  const items = DEMO_ITEMS.slice(0, itemCount);

  const codePreview = `<TipAdvisor
  position="${position}"
  triggerKey="${triggerKey}"
  showCloseButton={${showCloseButton}}
  showBackdrop={${showBackdrop}}
  closeOnBackdropClick={${closeOnBackdropClick}}
  searchPlaceholder="${searchPlaceholder}"
/>

// Toolbar with shortcuts
<button data-tip="Copy" data-tip-shortcut="⌘C">Copy</button>
<button data-tip="Paste" data-tip-shortcut="⌘V">Paste</button>`;

  return (
    <div className="story-container" style={{ minHeight: '400px', paddingTop: '60px' }}>
      <p className="story-description">
        Press <kbd>{triggerKey}</kbd> to toggle the TipAdvisor, then start typing to search.
        <br />
        Use arrow keys to navigate, Enter to select, Escape to close.
      </p>

      {/* Demo toolbar */}
      <div className="story-toolbar" style={{ marginBottom: '20px' }}>
        {items.map((item, index) => (
          <button
            key={index}
            className="story-icon-button"
            data-tip={item.label}
            data-tip-shortcut={item.shortcut}
            aria-label={item.label}
            onClick={() => alert(`${item.label} clicked!`)}
          >
            {item.icon}
          </button>
        ))}
      </div>

      {/* Manual toggle button */}
      <button
        className="story-button"
        onClick={() => advisorRef.current?.toggle()}
        style={{ marginBottom: '20px' }}
      >
        Toggle TipAdvisor
      </button>

      {/* Code preview */}
      <pre className="story-code" style={{ fontSize: '11px', textAlign: 'left' }}>
        {codePreview}
      </pre>

      {/* TipAdvisor component */}
      <TipAdvisor
        ref={advisorRef}
        position={position}
        triggerKey={triggerKey}
        showCloseButton={showCloseButton}
        showBackdrop={showBackdrop}
        closeOnBackdropClick={closeOnBackdropClick}
        searchPlaceholder={searchPlaceholder}
      />
    </div>
  );
};

/**
 * Interactive TipAdvisor playground.
 *
 * The menu is shown automatically - use the controls panel to experiment
 * with all available options. Try typing in the search box to filter shortcuts!
 */
export const TheTipAdvisor: Story = {
  args: {
    position: 'center',
    triggerKey: 'F1',
    showCloseButton: true,
    showBackdrop: true,
    closeOnBackdropClick: true,
    searchPlaceholder: 'Search shortcuts...',
    itemCount: 8,
  },
  argTypes: {
    position: {
      control: 'select',
      options: ['center', 'bottom-right', 'bottom-left', 'top-right', 'top-left'],
      description: 'Position of the menu on screen',
    },
    triggerKey: {
      control: 'text',
      description: 'Key to toggle the TipAdvisor menu',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header',
    },
    showBackdrop: {
      control: 'boolean',
      description: 'Show backdrop overlay behind the menu',
    },
    closeOnBackdropClick: {
      control: 'boolean',
      description: 'Close when clicking the backdrop',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    itemCount: {
      control: { type: 'range', min: 1, max: 8, step: 1 },
      description: 'Number of items in the demo toolbar',
    },
  },
  render: (args) => (
    <TipMagicProvider>
      <TipAdvisorDemo {...args} />
    </TipMagicProvider>
  ),
};
