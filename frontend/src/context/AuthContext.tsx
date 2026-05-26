/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'; // Satisfies verbatimModuleSyntax

export interface UserSession {
  token: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (session: UserSession) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy state loading prevents cascading render loop warnings
  const [user, setUser] = useState<UserSession | null>(() => {
    const storedUser = localStorage.getItem('decibels_session');
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as UserSession;
      } catch {
        localStorage.removeItem('decibels_session');
        return null;
      }
    }
    return null;
  });

  const login = (session: UserSession) => {
    localStorage.setItem('decibels_session', JSON.stringify(session));
    setUser(session);
  };

  const logout = () => {
    localStorage.removeItem('decibels_session');
    setUser(null);
  };

  const isAuthenticated = !!user?.token;
  const isAdmin = user?.role.toLowerCase() === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

// 2. Keep the custom hook matching your original code structure
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be executed within an AuthProvider scope configuration.');
  }
  return context;
}