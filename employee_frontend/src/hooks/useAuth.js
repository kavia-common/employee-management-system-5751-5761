 /**
  * useAuth.js
  * Hook to access the AuthContext.
  */

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

// PUBLIC_INTERFACE
export function useAuth() {
  /** Return the current AuthContext value. */
  return useContext(AuthContext);
}
