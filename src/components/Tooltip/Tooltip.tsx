import {
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type Middleware,
  type Placement,
} from '@floating-ui/react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ANIMATION, CENTERED_ATTRIBUTE, CSS_CLASSES } from '../../constants';
import { useTipMagicContext } from '../../context/TipMagicContext';
import type { TooltipTransitionBehavior } from '../../types';
import { resolveAutoFocusTarget } from '../../utils/autoFocusTarget';
import { areGroupsCompatible, shouldAnimatePosition } from '../../utils/groupCompatibility';
import {
  buildTooltipClassNames,
  getArrowStaticSide,
  getArrowStyles,
  getCenteredPosition,
} from '../../utils/tooltipStyles';

/** Set from Floating UI's size() middleware, read by the tour panel's stylesheet */
const AVAILABLE_HEIGHT_PROPERTY = '--tip-magic-available-height';

/**
 * Floating UI middleware that puts the tooltip in the middle of the viewport, for
 * `centered` - with the `fixed` strategy, so it stays there as the page scrolls
 */
const centerInViewport: Middleware = {
  name: 'centerInViewport',
  fn: ({ rects }) =>
    getCenteredPosition(
      {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
      },
      rects.floating
    ),
};

/**
 * Content rendered from an HTML string.
 *
 * Memoised on `html` so the subtree survives re-renders - see CLAUDE.md,
 * "dangerouslySetInnerHTML is re-applied on every render".
 */
const HtmlContent = memo(function HtmlContent({ html }: { html: string }) {
  return <span className={CSS_CLASSES.TOOLTIP_TEXT} dangerouslySetInnerHTML={{ __html: html }} />;
});

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

  // A centered tooltip ignores its target's position, and has no arrow
  const centered = tooltip.parsedData?.centered ?? false;

  // Memoize middleware array to prevent unnecessary recalculations
  const middleware = useMemo(
    () =>
      centered
        ? [centerInViewport]
        : [
            offset(config.offset),
            flip({
              fallbackAxisSideDirection: 'start',
              padding: 8,
            }),
            shift({ padding: 8 }),
            // Exposed as a variable rather than applied as max-height: only the tour panel
            // knows which part of itself can shrink, and a plain tooltip should not clip
            size({
              padding: 8,
              apply({ availableHeight, elements }) {
                elements.floating.style.setProperty(
                  AVAILABLE_HEIGHT_PROPERTY,
                  `${Math.max(0, availableHeight)}px`
                );
              },
            }),
            arrow({ element: arrowRef }),
          ],
    [config.offset, centered]
  );

  // Floating UI setup
  const { refs, floatingStyles, context, middlewareData, isPositioned } = useFloating({
    placement,
    strategy: centered ? 'fixed' : 'absolute',
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

  // Determine if we should animate position (move behavior). Never for a move between
  // centered and anchored: they use different positioning strategies, so the transform
  // would animate between two coordinate systems. Compared with where the tooltip last
  // settled, since the new position only arrives a render or two into the move.
  const settledCenteredRef = useRef(centered);
  useEffect(() => {
    if (!tooltip.isTransitioning) {
      settledCenteredRef.current = centered;
    }
  }, [tooltip.isTransitioning, centered]);
  const animatePosition =
    settledCenteredRef.current === centered &&
    shouldAnimatePosition(
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

  const autoFocus = tooltip.parsedData?.autoFocus ?? 'panel';
  useEffect(() => {
    if (!isDialogOpen || !isPositioned) return;

    const panel = refs.floating.current;
    if (!panel) return;

    const target = resolveAutoFocusTarget(panel, autoFocus, document.activeElement);
    if (!target) return;

    target.focus({ preventScroll: true });

    const focusLanded = panel.contains(document.activeElement);
    if (!focusLanded) {
      panel.focus({ preventScroll: true });
    }
  }, [isDialogOpen, isPositioned, tooltip.content, refs, autoFocus]);

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
  const showArrow = (tooltip.parsedData?.showArrow ?? true) && !centered;

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
      data-placement={centered ? undefined : context.placement}
      {...{ [CENTERED_ATTRIBUTE]: centered ? '' : undefined }}
      data-transition-behavior={transitionBehavior}
      data-interactive={isInteractive ? '' : undefined}
      // Opts the stylesheet's prefers-reduced-motion guards back out
      data-tip-magic-motion={config.respectReducedMotion ? undefined : 'always'}
    >
      <div className={CSS_CLASSES.TOOLTIP_CONTENT}>
        {isHtmlContent && typeof mainContent === 'string' ? (
          <HtmlContent html={mainContent} />
        ) : (
          <span className={CSS_CLASSES.TOOLTIP_TEXT}>{mainContent}</span>
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
