/**
 * TipAdvisor Types
 *
 * Types for the optional TipAdvisor component that displays a menu
 * of all tooltips with keyboard shortcuts for discoverability.
 */

/**
 * Position options for the TipAdvisor menu
 */
export type TipAdvisorPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left';

/**
 * A preset item that can be added to TipAdvisor without being tied to a DOM element.
 * Useful for command palette-style menus with custom actions.
 */
export interface TipAdvisorPresetItem {
  /** Unique identifier for the item */
  id: string;
  /** Label/content to display */
  label: string;
  /** Optional keyboard shortcut to display */
  shortcut?: string;
  /** Callback executed when the item is clicked */
  onSelect: () => void;
}

/**
 * Represents a single item in the TipAdvisor menu.
 * Can be either element-based (from DOM) or preset (from props).
 */
export interface TipAdvisorItem {
  /** Unique identifier (from data-tip-id or generated) */
  id: string;
  /** The DOM element this item refers to (undefined for preset items) */
  element?: Element;
  /** Tooltip content / label */
  content: string;
  /** Keyboard shortcut (from data-tip-shortcut or preset) */
  shortcut?: string;
  /** Callback for preset items (undefined for element-based items) */
  onSelect?: () => void;
}

/**
 * Props for the TipAdvisor component
 */
export interface TipAdvisorProps {
  /** Key to trigger the advisor (default: 'F1') */
  triggerKey?: string;
  /** Position on screen (default: 'center') */
  position?: TipAdvisorPosition;
  /** Show close button in header (default: true) */
  showCloseButton?: boolean;
  /** Show backdrop overlay behind the menu (default: true) */
  showBackdrop?: boolean;
  /** Close when clicking backdrop (default: true, only applies if showBackdrop is true) */
  closeOnBackdropClick?: boolean;
  /** Custom CSS class for the menu container */
  className?: string;
  /** Custom CSS class for menu items */
  itemClassName?: string;
  /**
   * Selector for elements to include (default: '[data-tip][data-tip-shortcut]').
   * Set to empty string or null to disable DOM scanning (useful for preset-only menus).
   */
  selector?: string | null;
  /** Callback when advisor opens */
  onOpen?: () => void;
  /** Callback when advisor closes */
  onClose?: () => void;
  /** Placeholder text for the search input (default: 'Search shortcuts...') */
  searchPlaceholder?: string;
  /**
   * Preset items to display in the menu.
   * These are command palette-style items not tied to DOM elements.
   * They appear alongside any DOM-scanned items.
   */
  items?: TipAdvisorPresetItem[];
}

/**
 * API exposed by TipAdvisor via ref for programmatic control
 */
export interface TipAdvisorAPI {
  /** Open the TipAdvisor menu */
  open: () => void;
  /** Close the TipAdvisor menu */
  close: () => void;
  /** Toggle the TipAdvisor menu */
  toggle: () => void;
  /** Whether the menu is currently open */
  isOpen: boolean;
  /** Current list of items in the menu */
  items: TipAdvisorItem[];
}
