/**
 * useAppContext.js
 * Hook to access the AppContext (theme-only) in pure stub mode.
 */

import { useContext } from 'react';
import AppContext from '../context/AppContext';

// PUBLIC_INTERFACE
export function useAppContext() {
  /** Accessor for the AppContext. */
  return useContext(AppContext);
}
