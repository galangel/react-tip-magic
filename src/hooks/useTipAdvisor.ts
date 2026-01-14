import { useCallback, useRef } from 'react';
import type { TipAdvisorAPI } from '../types/tipAdvisor';

/**
 * Hook for programmatic control of the TipAdvisor component.
 *
 * This hook provides a ref that can be passed to a TipAdvisor component
 * to control it from a parent component.
 *
 * @example
 * ```tsx
 * function App() {
 *   const advisor = useTipAdvisor();
 *
 *   return (
 *     <TipMagicProvider>
 *       <button onClick={advisor.toggle}>
 *         Show Shortcuts (F1)
 *       </button>
 *       <Toolbar />
 *       <TipAdvisor ref={advisor.ref} position="bottom-right" />
 *     </TipMagicProvider>
 *   );
 * }
 * ```
 */
export function useTipAdvisor() {
  const ref = useRef<TipAdvisorAPI>(null);

  const open = useCallback(() => {
    ref.current?.open();
  }, []);

  const close = useCallback(() => {
    ref.current?.close();
  }, []);

  const toggle = useCallback(() => {
    ref.current?.toggle();
  }, []);

  return {
    /** Ref to pass to TipAdvisor component */
    ref,
    /** Open the TipAdvisor */
    open,
    /** Close the TipAdvisor */
    close,
    /** Toggle the TipAdvisor */
    toggle,
  };
}
