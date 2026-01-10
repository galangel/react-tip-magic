import {
  arrow,
  autoUpdate,
  flip,
  offset,
  shift,
  useFloating,
  type Placement,
} from '@floating-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ANIMATION, CSS_CLASSES } from '../../constants';
import { useTipMagicContext } from '../../context/TipMagicContext';
import type { TooltipTransitionBehavior } from '../../types';
import { parseContent } from '../../utils/parseDataAttributes';

/**
 * Main Tooltip component - renders a single tooltip instance
 * that moves between targets for smooth transitions
 */
export function Tooltip() {
  const { state, dispatch } = useTipMagicContext();
  const { tooltip, config } = state;
  const arrowRef = useRef<HTMLDivElement>(null);
  const [shouldShow, setShouldShow] = useState(false);
  const [hasBeenPositioned, setHasBeenPositioned] = useState(false);

  // Get the placement from parsed data or default
  const placement: Placement = tooltip.parsedData?.placement ?? config.placement;

  // Determine transition behavior: per-tooltip override or provider default
  const transitionBehavior: TooltipTransitionBehavior =
    tooltip.parsedData?.transitionBehavior ?? config.transitionBehavior;

  // Floating UI setup
  const { refs, floatingStyles, context, middlewareData, isPositioned } = useFloating({
    placement,
    open: tooltip.visible,
    middleware: [
      offset(config.offset),
      flip({
        fallbackAxisSideDirection: 'start',
        padding: 8,
      }),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
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

  // Determine if groups are compatible for move transitions
  // Rules:
  // - Same group → allow move
  // - Different groups (both have groups but different) → force jump
  // - One has group, one doesn't → allow move
  const currentGroup = tooltip.parsedData?.group;
  const previousGroup = tooltip.previousGroup;
  const areGroupsCompatible =
    // Both have no group
    (currentGroup === undefined && previousGroup === undefined) ||
    // Same group
    currentGroup === previousGroup ||
    // One has group, one doesn't (treat as compatible)
    (currentGroup === undefined && previousGroup !== undefined) ||
    (currentGroup !== undefined && previousGroup === undefined);

  // Determine if we should animate position (move behavior)
  // Only animate if: already positioned before, transitioning between targets, behavior is 'move',
  // and groups are compatible
  const shouldAnimatePosition =
    hasBeenPositioned &&
    tooltip.isTransitioning &&
    transitionBehavior === 'move' &&
    areGroupsCompatible;

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

  // Handle transition end - only clear transitioning state when transform finishes
  // (or opacity if not animating position)
  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (!tooltip.isTransitioning) return;

      // When animating position, wait for transform to finish (it's usually longer)
      // When not animating position, opacity ending is sufficient
      const shouldClear =
        e.propertyName === 'transform' || (e.propertyName === 'opacity' && !shouldAnimatePosition);

      if (shouldClear) {
        dispatch({ type: 'SET_TOOLTIP_TRANSITIONING', payload: false });
      }
    },
    [tooltip.isTransitioning, dispatch, shouldAnimatePosition]
  );

  // Don't render if not visible or no content
  if (!tooltip.visible || !tooltip.content) {
    return null;
  }

  // Parse content to extract shortcut (per-element separator overrides provider default)
  const separator = tooltip.parsedData?.contentSeparator ?? config.contentSeparator;
  const parsedContent = parseContent(tooltip.content, separator);

  // Calculate arrow position based on placement
  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  const staticSide =
    {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right',
    }[context.placement.split('-')[0]] ?? 'bottom';

  // Extract text display options
  const isInteractive = tooltip.parsedData?.interactive ?? false;
  const wordWrap = tooltip.parsedData?.wordWrap ?? false;
  const ellipsis = tooltip.parsedData?.ellipsis ?? false;
  const maxLines = tooltip.parsedData?.maxLines ?? 1;
  const textBreak = tooltip.parsedData?.textBreak ?? 'normal';
  const showArrow = tooltip.parsedData?.showArrow ?? true;

  // Build class names
  const classNames = [
    CSS_CLASSES.TOOLTIP,
    shouldShow ? CSS_CLASSES.TOOLTIP_VISIBLE : CSS_CLASSES.TOOLTIP_HIDDEN,
    tooltip.isTransitioning ? CSS_CLASSES.TOOLTIP_TRANSITIONING : '',
    shouldAnimatePosition ? 'tip-magic-moving' : '',
    isInteractive ? 'tip-magic-interactive' : '',
    wordWrap ? 'tip-magic-word-wrap' : '',
    ellipsis ? 'tip-magic-ellipsis' : '',
    textBreak !== 'normal' ? `tip-magic-text-break-${textBreak}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={refs.setFloating}
      role="tooltip"
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
    >
      <div className={CSS_CLASSES.TOOLTIP_CONTENT}>
        {tooltip.parsedData?.html ? (
          <span
            className="tip-magic-text"
            dangerouslySetInnerHTML={{ __html: parsedContent.main }}
          />
        ) : (
          <span className="tip-magic-text">{parsedContent.main}</span>
        )}
        {parsedContent.shortcut && config.enableShortcutStyle && (
          <kbd className={CSS_CLASSES.TOOLTIP_SHORTCUT}>{parsedContent.shortcut}</kbd>
        )}
      </div>
      {showArrow && (
        <div
          ref={arrowRef}
          className={CSS_CLASSES.TOOLTIP_ARROW}
          style={{
            left: arrowX != null ? `${arrowX}px` : '',
            top: arrowY != null ? `${arrowY}px` : '',
            [staticSide]: '-4px',
          }}
        />
      )}
    </div>
  );
}
