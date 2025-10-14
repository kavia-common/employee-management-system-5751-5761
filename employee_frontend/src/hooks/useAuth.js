import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

// PUBLIC_INTERFACE
export function useAuth() {
  /** Accessor for the AuthContext. */
  return useContext(AuthContext);
}
