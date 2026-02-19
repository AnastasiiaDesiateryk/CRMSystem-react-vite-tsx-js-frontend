import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import * as authApi from './auth-api';

/**
 * AuthContext — application-level session boundary.
 *
 * Architectural role:
 * - Owns authentication state.
 * - Owns session lifecycle.
 * - Coordinates with Auth API adapter.
 *
 * Clean Architecture mapping:
 *
 * UI Components
 *      ↓
 * AuthContext (application layer)
 *      ↓
 * Auth API (infrastructure adapter)
 *      ↓
 * Backend
 *
 * UI does NOT:
 * - call /api directly
 * - store raw tokens outside context
 * - interpret JWT
 *
 * Context is the single source of truth for:
 * - user identity
 * - authentication state
 * - RBAC-derived flags (isAdmin)
 */

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'access_token';
const USER_KEY = 'currentUser';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
   /**
   * Session recovery.
   * - This does NOT validate token freshness.
   * - Real validation happens server-side.
   */

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const token = localStorage.getItem(TOKEN_KEY);

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    } else {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
      try {
        const res = await authApi.login(email, password);
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        
        const user = await authApi.me();
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setUser(user);

        return true;
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        return false;
      }
    };

 const register = async (email: string, password: string, name: string): Promise<boolean> => {
  try {
    const res = await authApi.register(email, password, name);
    localStorage.setItem(TOKEN_KEY, res.accessToken);

    const me = await authApi.me();
    localStorage.setItem(USER_KEY, JSON.stringify(me));
    setUser(me);

    return true;
  } catch {
    return false;
  }
};


  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const isAdmin = !!user?.roles?.includes("ROLE_ADMIN");
 
  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}