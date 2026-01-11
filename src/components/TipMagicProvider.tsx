import type { ReactNode } from 'react';
import { TipMagicContextProvider } from '../context/TipMagicContext';
import type { TipMagicOptions } from '../types';
import { TipMagicEventHandler } from './TipMagicEventHandler';
import { TipMagicPortal } from './TipMagicPortal';
import { TipMagicTourHighlight } from './TipMagicTourHighlight';

/**
 * Props for TipMagicProvider
 */
export interface TipMagicProviderProps {
  children: ReactNode;
  options?: TipMagicOptions;
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
      <TipMagicTourHighlight />
      {children}
      <TipMagicPortal />
    </TipMagicContextProvider>
  );
}
