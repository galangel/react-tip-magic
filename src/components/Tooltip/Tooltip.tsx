import {
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ANIMATION, CSS_CLASSES } from '../../constants';
import { useTipMagicContext } from '../../context/TipMagicContext';
import type { TooltipTransitionBehavior } from '../../types';
import { areGroupsCompatible, shouldAnimatePosition } from '../../utils/groupCompatibility';
import {
  buildTooltipClassNames,
  getArrowStaticSide,
  getArrowStyles,
} from '../../utils/tooltipStyles';

/**
 * Main Tooltip component - renders a single tooltip instance
 * that moves between targets for smooth transitions
 */
export function Tooltip() {
  const { state, dispatch } = useTipMagicContext();
  const { tooltip, config } = state;
  const arrowRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [shouldShow, setShouldShow] = useState(false);
  const [hasBeenPositioned, setHasBeenPositioned] = useState(false);

  // Get the placement from parsed data or default
  const placement: Placement = tooltip.parsedData?.placement ?? config.placement;

  // Determine transition behavior: per-tooltip override or provider default
  const transitionBehavior: TooltipTransitionBehavior =
    tooltip.parsedData?.transitionBehavior ?? config.transitionBehavior;

  // Memoize middleware array to prevent unnecessary recalculations
  const middleware = useMemo(
    () => [
      offset(config.offset),
      flip({
        fallbackAxisSideDirection: 'start',
        padding: 8,
      }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    [config.offset]
  );

  // Floating UI setup
  const { refs, floatingStyles, context, middlewareData, isPositioned } = useFloating({
    placement,
    open: tooltip.visible,
    middleware,
    whileElementsMounted: autoUpdate,
  });

  // Update reference element when target changes
  useEffect(() => {
    if (tooltip.target) {
      refs.setReference(tooltip.target);
    }
  }, [tooltip.target, refs]);

  // Track if we've been positioned at least once (for move transitions)
  useEffect(() => {
    if (isPositioned && tooltip.visible) {
      setHasBeenPositioned(true);
    } else if (!tooltip.visible) {
      setHasBeenPositioned(false);
    }
  }, [isPositioned, tooltip.visible]);

  // Check group compatibility for move transitions
  const groupsCompatible = areGroupsCompatible(tooltip.parsedData?.group, tooltip.previousGroup);

  // Determine if we should animate position (move behavior)
  const animatePosition = shouldAnimatePosition(
    hasBeenPositioned,
    tooltip.isTransitioning,
    transitionBehavior,
    groupsCompatible
  );

  // Control visibility: show only after positioned, hide immediately when not visible
  useEffect(() => {
    if (tooltip.visible && isPositioned) {
      // Small delay to ensure position is applied before fading in
      const timer = setTimeout(() => setShouldShow(true), 16);
      return () => clearTimeout(timer);
    } else {
      // Hide immediately
      setShouldShow(false);
    }
  }, [tooltip.visible, isPositioned]);

  // A tooltip presented as a dialog holds interactive controls, so it needs the focus
  // management a description-only tooltip does not
  const isDialog = tooltip.parsedData?.role === 'dialog';
  const isDialogOpen = isDialog && tooltip.visible;

  // Remember what had focus before the dialog opened, and hand it back on close
  useEffect(() => {
    if (!isDialogOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    return () => {
      const previous = previouslyFocusedRef.current;
      previouslyFocusedRef.current = null;
      if (previous?.isConnected) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [isDialogOpen]);

  // Move focus into the panel on open and on every content change (a tour step change),
  // so the new controls are reachable
  useEffect(() => {
    if (!isDialogOpen || !isPositioned) return;

    const panel = refs.floating.current;
    if (panel && !panel.contains(document.activeElement)) {
      panel.focus({ preventScroll: true });
    }
  }, [isDialogOpen, isPositioned, tooltip.content, refs]);

  // Handle transition end - only clear transitioning state when transform finishes
  // (or opacity if not animating position)
  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (!tooltip.isTransitioning) return;

      // When animating position, wait for transform to finish (it's usually longer)
      // When not animating position, opacity ending is sufficient
      const shouldClear =
        e.propertyName === 'transform' || (e.propertyName === 'opacity' && !animatePosition);

      if (shouldClear) {
        dispatch({ type: 'SET_TOOLTIP_TRANSITIONING', payload: false });
      }
    },
    [tooltip.isTransitioning, dispatch, animatePosition]
  );

  // Don't render if not visible or no content
  if (!tooltip.visible || !tooltip.content) {
    return null;
  }

  // Get content and shortcut from parsed data
  const isHtmlContent = tooltip.parsedData?.html ?? false;
  const mainContent = tooltip.content;
  const shortcut = tooltip.parsedData?.shortcut;

  // Extract text display options
  const isInteractive = tooltip.parsedData?.interactive ?? false;
  const wordWrap = tooltip.parsedData?.wordWrap ?? false;
  const ellipsis = tooltip.parsedData?.ellipsis ?? false;
  const maxLines = tooltip.parsedData?.maxLines ?? 1;
  const textBreak = tooltip.parsedData?.textBreak ?? 'normal';
  const showArrow = tooltip.parsedData?.showArrow ?? true;

  // Build class names using utility
  const classNames = buildTooltipClassNames({
    shouldShow,
    isTransitioning: tooltip.isTransitioning,
    shouldAnimatePosition: animatePosition,
    isInteractive,
    wordWrap,
    ellipsis,
    textBreak,
  });

  // Calculate arrow position
  const staticSide = getArrowStaticSide(context.placement);
  const arrowStyles = getArrowStyles(middlewareData.arrow?.x, middlewareData.arrow?.y, staticSide);

  return (
    <div
      ref={refs.setFloating}
      role={tooltip.parsedData?.role ?? 'tooltip'}
      aria-labelledby={tooltip.parsedData?.ariaLabelledBy}
      // Focusable only as a programmatic focus destination, never in the tab order
      tabIndex={isDialog ? -1 : undefined}
      className={classNames}
      style={
        {
          ...floatingStyles,
          zIndex: config.zIndex,
          maxWidth: tooltip.parsedData?.maxWidth ?? 300,
          // Hide until positioned to prevent flash at wrong position
          visibility: isPositioned ? 'visible' : 'hidden',
          '--animation-duration': `${ANIMATION.TOOLTIP_SHOW}ms`,
          '--move-duration': `${tooltip.parsedData?.moveTransitionDuration ?? config.moveTransitionDuration}ms`,
          '--max-lines': maxLines,
        } as React.CSSProperties
      }
      onTransitionEnd={handleTransitionEnd}
      data-placement={context.placement}
      data-transition-behavior={transitionBehavior}
      data-interactive={isInteractive ? '' : undefined}
      // Opts the stylesheet's prefers-reduced-motion guards back out
      data-tip-magic-motion={config.respectReducedMotion ? undefined : 'always'}
    >
      <div className={CSS_CLASSES.TOOLTIP_CONTENT}>
        {isHtmlContent ? (
          <span className="tip-magic-text" dangerouslySetInnerHTML={{ __html: mainContent }} />
        ) : (
          <span className="tip-magic-text">{mainContent}</span>
        )}
        {shortcut && config.enableShortcutStyle && (
          <kbd className={CSS_CLASSES.TOOLTIP_SHORTCUT}>{shortcut}</kbd>
        )}
      </div>
      {showArrow && (
        <div ref={arrowRef} className={CSS_CLASSES.TOOLTIP_ARROW} style={arrowStyles} />
      )}
    </div>
  );
}
