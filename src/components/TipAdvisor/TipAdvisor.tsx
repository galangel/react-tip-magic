import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTipMagicContext } from '../../context/TipMagicContext';
import type { TipAdvisorAPI, TipAdvisorProps } from '../../types/tipAdvisor';
import { useTipAdvisorState } from './useTipAdvisorState';
import { highlightFuzzyMatch } from './utils';

const DEFAULT_TRIGGER_KEY = 'F1';
const DEFAULT_SELECTOR = '[data-tip][data-tip-shortcut]';
const DEFAULT_POSITION = 'center';
const DEFAULT_SEARCH_PLACEHOLDER = 'Search shortcuts...';

/**
 * TipAdvisor - An optional menu component that displays all tooltips with shortcuts.
 *
 * Features:
 * - Fuzzy search with highlighting
 * - Keyboard navigation (arrow keys, enter)
 * - Hover preview of tooltips
 * - Click to trigger target element
 *
 * @example
 * ```tsx
 * <TipMagicProvider>
 *   <App />
 *   <TipAdvisor position="center" triggerKey="F1" />
 * </TipMagicProvider>
 * ```
 */
export const TipAdvisor = forwardRef<TipAdvisorAPI, TipAdvisorProps>(function TipAdvisor(
  {
    triggerKey = DEFAULT_TRIGGER_KEY,
    position = DEFAULT_POSITION,
    showCloseButton = true,
    showBackdrop = true,
    closeOnBackdropClick = true,
    className,
    itemClassName,
    selector = DEFAULT_SELECTOR,
    onOpen,
    onClose,
    searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
    items: presetItems,
  },
  ref
) {
  const { state, dispatch } = useTipMagicContext();
  const menuRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    items,
    searchQuery,
    focusedIndex,
    filteredResults,
    searchInputRef,
    itemRefs,
    open,
    close,
    toggle,
    setSearchQuery,
    handleItemClick,
    handleItemHover,
    handleItemLeave,
    handleKeyDown,
  } = useTipAdvisorState({
    selector,
    triggerKey,
    presetItems,
    onOpen,
    onClose,
    dispatch,
  });

  // Expose API via ref
  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
      toggle,
      isOpen,
      items,
    }),
    [open, close, toggle, isOpen, items]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (!closeOnBackdropClick) return;

      // Close if clicking directly on the container or the backdrop element
      const target = event.target;
      if (target === event.currentTarget || target === backdropRef.current) {
        close();
      }
    },
    [closeOnBackdropClick, close]
  );

  // Render highlighted text
  const renderHighlightedText = (
    text: string,
    result: Fuzzysort.Result | null
  ): React.ReactNode => {
    const highlighted = highlightFuzzyMatch(text, result);

    if (highlighted === text) {
      return text;
    }

    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const positionClass = `tip-advisor-menu--${position}`;

  return createPortal(
    <div
      className={`tip-advisor ${showBackdrop ? '' : 'tip-advisor--no-backdrop'} ${className || ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
    >
      {showBackdrop && <div ref={backdropRef} className="tip-advisor-backdrop" />}
      <div
        ref={menuRef}
        className={`tip-advisor-menu ${positionClass}`}
        role="menu"
        style={{ zIndex: state.config.zIndex + 1 }}
        onKeyDown={handleKeyDown}
      >
        <div className="tip-advisor-header">
          <input
            ref={searchInputRef}
            type="text"
            className="tip-advisor-search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search shortcuts"
          />
          {showCloseButton && (
            <button className="tip-advisor-close" onClick={close} aria-label="Close" type="button">
              ×
            </button>
          )}
        </div>
        <div className="tip-advisor-list">
          {filteredResults.length === 0 ? (
            <div className="tip-advisor-empty">
              {searchQuery ? 'No matching shortcuts' : 'No shortcuts available'}
            </div>
          ) : (
            filteredResults.map(({ item, contentResult, shortcutResult }, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) {
                    itemRefs.current.set(index, el);
                  } else {
                    itemRefs.current.delete(index);
                  }
                }}
                className={`tip-advisor-item ${itemClassName || ''} ${
                  focusedIndex === index ? 'tip-advisor-item--focus' : ''
                }`}
                role="menuitem"
                tabIndex={-1}
                onMouseEnter={() => handleItemHover(item, index)}
                onMouseLeave={handleItemLeave}
                onClick={() => handleItemClick(item)}
              >
                <span className="tip-advisor-item-content">
                  {renderHighlightedText(item.content, contentResult)}
                </span>
                {item.shortcut && (
                  <kbd className="tip-advisor-item-shortcut">
                    {renderHighlightedText(item.shortcut, shortcutResult)}
                  </kbd>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
});
