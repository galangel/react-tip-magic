import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DEFAULT_SELECTOR } from '../constants';
import { TipMagicContextProvider, useTipMagicContext } from '../context/TipMagicContext';
import type { TipMagicOptions } from '../types';
import { parseDataAttributes } from '../utils/parseDataAttributes';
import { Tooltip } from './Tooltip';

/**
 * Props for TipMagicProvider
 */
export interface TipMagicProviderProps {
  children: ReactNode;
  options?: TipMagicOptions;
}

/**
 * Internal component that handles event delegation
 */
function TipMagicEventHandler() {
  const { state, dispatch } = useTipMagicContext();
  const { config, tooltip } = state;

  // Refs for timeout management
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentTargetRef = useRef<Element | null>(null);
  // Refs to track current state (avoids stale closure issues in timeouts)
  const isVisibleRef = useRef(tooltip.visible);
  isVisibleRef.current = tooltip.visible;
  // Track parsed data for hide delay (to avoid useEffect re-runs)
  const parsedDataRef = useRef(tooltip.parsedData);
  parsedDataRef.current = tooltip.parsedData;

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  // Show tooltip for a target element
  const showTooltip = useCallback(
    (target: Element) => {
      const parsedData = parseDataAttributes(target);

      // Don't show if disabled
      if (parsedData.disabled || config.disabled) {
        return;
      }

      const content = parsedData.content;
      if (!content) {
        return;
      }

      // Use ref for current visibility to avoid stale closure issues
      const isCurrentlyVisible = isVisibleRef.current;

      // If tooltip is already visible, move it instead of show/hide
      if (isCurrentlyVisible && currentTargetRef.current !== target) {
        dispatch({
          type: 'MOVE_TOOLTIP',
          payload: { target, content, parsedData },
        });
      } else if (!isCurrentlyVisible) {
        dispatch({
          type: 'SHOW_TOOLTIP',
          payload: { target, content, parsedData },
        });
      }

      currentTargetRef.current = target;
    },
    [config.disabled, dispatch]
  );

  // Hide the tooltip
  const hideTooltip = useCallback(() => {
    dispatch({ type: 'HIDE_TOOLTIP' });
    currentTargetRef.current = null;
  }, [dispatch]);

  // Handle mouseover event
  const handleMouseOver = useCallback(
    (event: MouseEvent) => {
      const target = (event.target as Element).closest(DEFAULT_SELECTOR);
      const isOverTooltip = (event.target as Element).closest('.tip-magic-tooltip');

      if (target && target !== currentTargetRef.current) {
        // Clear existing show timeout
        if (showTimeoutRef.current) {
          clearTimeout(showTimeoutRef.current);
        }

        // Get delay from element or use default
        const parsedData = parseDataAttributes(target);
        const delay = parsedData.delay ?? config.showDelay;

        // Use ref for current visibility to avoid stale closure issues
        if (isVisibleRef.current) {
          // Tooltip is already visible - handle transition to new target
          if (delay === 0) {
            // No delay: clear hide timeout and show immediately (smooth transition)
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
            showTooltip(target);
          } else {
            // Has delay: keep hide timeout running, schedule show
            // Whichever fires first wins (hide or show)
            showTimeoutRef.current = setTimeout(() => {
              // Clear any pending hide timeout when showing new target
              if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
              }
              showTooltip(target);
            }, delay);
          }
        } else {
          // Tooltip not visible - just schedule showing with delay
          if (delay === 0) {
            showTooltip(target);
          } else {
            showTimeoutRef.current = setTimeout(() => {
              showTooltip(target);
            }, delay);
          }
        }
      } else if (isOverTooltip) {
        // Hovering over the tooltip itself - cancel hide
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }
    },
    [config.showDelay, showTooltip]
  );

  // Handle mouseout event
  const handleMouseOut = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Element;
      const relatedTarget = event.relatedTarget as Element | null;
      const isLeavingTooltip = target.closest('.tip-magic-tooltip');
      const isLeavingTarget = target.closest(DEFAULT_SELECTOR);

      // Don't hide if moving to the tooltip itself (for interactive tooltips)
      if (relatedTarget?.closest('.tip-magic-tooltip')) {
        return;
      }

      // Don't hide if moving to the helper
      if (relatedTarget?.closest('.tip-magic-helper')) {
        return;
      }

      // Don't hide if moving to another tooltip target
      if (relatedTarget?.closest(DEFAULT_SELECTOR)) {
        return;
      }

      // Don't hide if moving from tooltip back to the original target
      if (isLeavingTooltip && relatedTarget === currentTargetRef.current) {
        return;
      }

      // Clear show timeout if leaving before it triggers
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      // Schedule hide with delay if leaving a tooltip target or the tooltip itself
      // Use refs to avoid stale closures and prevent useEffect from re-running
      if (isVisibleRef.current && (isLeavingTarget || isLeavingTooltip)) {
        // Use per-element hide delay if set, otherwise use provider config
        const hideDelay = parsedDataRef.current?.hideDelay ?? config.hideDelay;

        // Clear any existing hide timeout first
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          hideTooltip();
        }, hideDelay);
      }
    },
    [config.hideDelay, hideTooltip]
  );

  // Handle focus event for accessibility
  const handleFocusIn = useCallback(
    (event: FocusEvent) => {
      const target = (event.target as Element).closest(DEFAULT_SELECTOR);
      if (target) {
        showTooltip(target);
      }
    },
    [showTooltip]
  );

  // Handle blur event
  const handleFocusOut = useCallback(
    (event: FocusEvent) => {
      const target = (event.target as Element).closest(DEFAULT_SELECTOR);
      const relatedTarget = event.relatedTarget as Element | null;

      // Don't hide if moving focus to another tooltip target
      if (relatedTarget?.closest(DEFAULT_SELECTOR)) {
        return;
      }

      if (target) {
        // Use per-element hide delay if set, otherwise use provider config (use ref)
        const hideDelay = parsedDataRef.current?.hideDelay ?? config.hideDelay;
        hideTimeoutRef.current = setTimeout(() => {
          hideTooltip();
        }, hideDelay);
      }
    },
    [config.hideDelay, hideTooltip]
  );

  // Handle escape key to dismiss
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisibleRef.current) {
        clearTimeouts();
        hideTooltip();
      }
    },
    [clearTimeouts, hideTooltip]
  );

  // Set up event delegation
  useEffect(() => {
    if (config.disabled) {
      return;
    }

    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('focusin', handleFocusIn, { passive: true });
    document.addEventListener('focusout', handleFocusOut, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeouts();
    };
  }, [
    config.disabled,
    handleMouseOver,
    handleMouseOut,
    handleFocusIn,
    handleFocusOut,
    handleKeyDown,
    clearTimeouts,
  ]);

  return null;
}

/**
 * Internal component that renders the tooltip portal
 */
function TipMagicPortal() {
  const { state } = useTipMagicContext();
  const portalContainer = state.config.portalContainer ?? document.body;

  return createPortal(<Tooltip />, portalContainer);
}

/**
 * TipMagicProvider - Main provider component
 *
 * Wrap your application with this provider to enable tooltips.
 * Elements with `data-tip` attribute will automatically show tooltips.
 *
 * @example
 * ```tsx
 * <TipMagicProvider>
 *   <button data-tip="Save changes">Save</button>
 * </TipMagicProvider>
 * ```
 */
export function TipMagicProvider({ children, options }: TipMagicProviderProps) {
  return (
    <TipMagicContextProvider options={options}>
      <TipMagicEventHandler />
      {children}
      <TipMagicPortal />
    </TipMagicContextProvider>
  );
}
