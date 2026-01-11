import { createPortal } from 'react-dom';
import { useTipMagicContext } from '../context/TipMagicContext';
import { Tooltip } from './Tooltip';

/**
 * Internal component that renders the tooltip via a portal
 *
 * This ensures the tooltip is rendered at the top level of the DOM
 * (by default in document.body) to avoid z-index and overflow issues.
 *
 * The portal container can be customized via the provider's
 * `portalContainer` option.
 */
export function TipMagicPortal() {
  const { state } = useTipMagicContext();
  const portalContainer = state.config.portalContainer ?? document.body;

  return createPortal(<Tooltip />, portalContainer);
}
