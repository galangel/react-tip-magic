import { useEffect, useRef } from 'react';
import { useTipMagicContext } from '../context/TipMagicContext';

/**
 * Internal component that handles automatic tour highlighting
 *
 * When a flow/tour is active and `tourHighlightClass` is configured,
 * this component automatically adds/removes the highlight class
 * to/from target elements as the tour progresses.
 *
 * This enables visual highlighting of the current step's target
 * without requiring manual class management.
 */
export function TipMagicTourHighlight() {
  const { state } = useTipMagicContext();
  const { flow, tooltip, config } = state;
  const previousTargetRef = useRef<Element | null>(null);

  useEffect(() => {
    const highlightClass = config.tourHighlightClass;

    // Only apply highlighting if class is configured and flow is active
    if (!highlightClass) {
      return;
    }

    // Remove highlight from previous target
    if (previousTargetRef.current && previousTargetRef.current !== tooltip.target) {
      previousTargetRef.current.classList.remove(highlightClass);
    }

    // Add highlight to current target if flow is active
    if (flow.active && tooltip.target) {
      tooltip.target.classList.add(highlightClass);
      previousTargetRef.current = tooltip.target;
    }

    // Cleanup function - remove highlight when flow ends or component unmounts
    return () => {
      if (!flow.active && previousTargetRef.current && highlightClass) {
        previousTargetRef.current.classList.remove(highlightClass);
        previousTargetRef.current = null;
      }
    };
  }, [flow.active, tooltip.target, config.tourHighlightClass]);

  // Also clean up when flow becomes inactive
  useEffect(() => {
    if (!flow.active && previousTargetRef.current && config.tourHighlightClass) {
      previousTargetRef.current.classList.remove(config.tourHighlightClass);
      previousTargetRef.current = null;
    }
  }, [flow.active, config.tourHighlightClass]);

  return null;
}
