import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { configureApi } from '../api/client.js';
import { authApi } from '../api/endpoints.js';

// Keeps the JWT and the user in memory and in localStorage, so a page refresh does not log out.
// localStorage may be unavailable (private mode), so every access is wrapped in try/catch.

const STORAGE_KEY = 'stagetix.auth';
const AuthContext = createContext(null);

function loadSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return session && new Date(session.expiresAt) > new Date() ? session : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // The session simply lasts until the tab is closed.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  const logout = useCallback(() => {
    saveSession(null);
    setSession(null);
  }, []);

  // The API module reads the token from here; a 401 on a request that had a token means it expired.
  // Set during render (not in an effect): child pages' effects run BEFORE a parent's effect,
  // so their first request would otherwise go out without the token.
  configureApi({ getToken: () => session?.token ?? null, onUnauthorized: logout });

  const login = useCallback(async (email, password) => {
    const { token, expiresAt, user } = await authApi.login(email, password);
    const next = { token, expiresAt, user };
    saveSession(next);
    setSession(next);
    return user;
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    isAdmin: session?.user?.role === 'Admin',
    isCustomer: session?.user?.role === 'Customer',
    login,
    logout
  }), [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
