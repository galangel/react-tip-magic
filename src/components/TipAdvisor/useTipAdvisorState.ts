import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TipMagicAction } from '../../context/TipMagicContext';
import type { TipAdvisorItem, TipAdvisorPresetItem } from '../../types/tipAdvisor';
import {
  buildTooltipPayload,
  collectTipAdvisorItems,
  filterItemsWithFuzzy,
  getNextFocusedIndex,
  type FuzzySearchResult,
} from './utils';

export interface UseTipAdvisorStateOptions {
  /** CSS selector for finding tip elements, or null to skip DOM scanning */
  selector: string | null | undefined;
  /** Key to toggle the advisor */
  triggerKey: string;
  /** Preset items to include (not tied to DOM elements) */
  presetItems?: TipAdvisorPresetItem[];
  /** Callback when advisor opens */
  onOpen?: () => void;
  /** Callback when advisor closes */
  onClose?: () => void;
  /** Context dispatch function */
  dispatch: React.Dispatch<TipMagicAction>;
}

export interface UseTipAdvisorStateReturn {
  // State
  isOpen: boolean;
  items: TipAdvisorItem[];
  searchQuery: string;
  focusedIndex: number;
  filteredResults: FuzzySearchResult[];

  // Refs
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;

  // Actions
  open: () => void;
  close: () => void;
  toggle: () => void;
  setSearchQuery: (query: string) => void;
  setFocusedIndex: (index: number) => void;

  // Handlers
  handleItemClick: (item: TipAdvisorItem) => void;
  handleItemHover: (item: TipAdvisorItem, index: number) => void;
  handleItemLeave: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Hook that manages TipAdvisor state, keyboard navigation, and tooltip display.
 */
export function useTipAdvisorState(options: UseTipAdvisorStateOptions): UseTipAdvisorStateReturn {
  const { selector, triggerKey, presetItems, onOpen, onClose, dispatch } = options;

  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<TipAdvisorItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Filter items using fuzzy search
  const filteredResults = useMemo(
    () => filterItemsWithFuzzy(items, searchQuery),
    [items, searchQuery]
  );

  // Show tooltip for an item (only for element-based items)
  const showTooltipForItem = useCallback(
    (item: TipAdvisorItem) => {
      // Build payload - returns null for preset items (no element)
      const payload = buildTooltipPayload(item);

      if (!payload) {
        dispatch({ type: 'HIDE_TOOLTIP' });
        return;
      }

      // Scroll element into view if needed
      item.element?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Show tooltip on the target element
      dispatch({ type: 'SHOW_TOOLTIP', payload });
    },
    [dispatch]
  );

  // Open the advisor
  const open = useCallback(() => {
    const collectedItems = collectTipAdvisorItems(selector, presetItems);
    setItems(collectedItems);
    setSearchQuery('');
    setIsOpen(true);
    setFocusedIndex(0);
    onOpen?.();

    // Focus search input after render
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  }, [selector, presetItems, onOpen]);

  // Close the advisor
  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(0);
    setSearchQuery('');
    dispatch({ type: 'HIDE_TOOLTIP' });
    onClose?.();
  }, [dispatch, onClose]);

  // Toggle the advisor
  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Handle item click
  const handleItemClick = useCallback(
    (item: TipAdvisorItem) => {
      close();

      // For preset items, call the onSelect callback
      if (item.onSelect) {
        item.onSelect();
        return;
      }

      // For element-based items, trigger click on the element
      if (item.element instanceof HTMLElement) {
        item.element.click();
      }
    },
    [close]
  );

  // Handle item hover
  const handleItemHover = useCallback(
    (item: TipAdvisorItem, index: number) => {
      setFocusedIndex(index);
      showTooltipForItem(item);
    },
    [showTooltipForItem]
  );

  // Handle item leave
  const handleItemLeave = useCallback(() => {
    dispatch({ type: 'HIDE_TOOLTIP' });
  }, [dispatch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const itemCount = filteredResults.length;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          close();
          break;

        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => getNextFocusedIndex(prev, itemCount, 'down'));
          break;

        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => getNextFocusedIndex(prev, itemCount, 'up'));
          break;

        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < itemCount) {
            handleItemClick(filteredResults[focusedIndex].item);
          }
          break;
      }
    },
    [close, filteredResults, focusedIndex, handleItemClick]
  );

  // Global trigger key listener
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === triggerKey) {
        event.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [triggerKey, toggle]);

  // Reset focused index when search changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [searchQuery]);

  // Update tooltip and scroll menu item when focused index changes
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < filteredResults.length) {
      showTooltipForItem(filteredResults[focusedIndex].item);

      // Scroll the focused menu item into view within the list
      const itemElement = itemRefs.current.get(focusedIndex);
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      dispatch({ type: 'HIDE_TOOLTIP' });
    }
  }, [focusedIndex, filteredResults, showTooltipForItem, dispatch]);

  return {
    // State
    isOpen,
    items,
    searchQuery,
    focusedIndex,
    filteredResults,

    // Refs
    searchInputRef,
    itemRefs,

    // Actions
    open,
    close,
    toggle,
    setSearchQuery,
    setFocusedIndex,

    // Handlers
    handleItemClick,
    handleItemHover,
    handleItemLeave,
    handleKeyDown,
  };
}
