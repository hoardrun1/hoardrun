'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    // Also check sessionStorage
    const sessionToken = sessionStorage.getItem('token');
    const sessionUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));

        // Also ensure data is in sessionStorage
        if (!sessionToken) {
          sessionStorage.setItem('token', storedToken);
        }
        if (!sessionUser) {
          sessionStorage.setItem('user', storedUser);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    } else if (sessionToken && sessionUser) {
      // If data is only in sessionStorage, use that
      try {
        setToken(sessionToken);
        setUser(JSON.parse(sessionUser));

        // Also store in localStorage for persistence
        localStorage.setItem('auth_token', sessionToken);
        localStorage.setItem('auth_user', sessionUser);
      } catch (error) {
        console.error('Error parsing session user:', error);
        // Clear invalid data
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    // Store auth data in both localStorage and sessionStorage
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));

    // Also store in sessionStorage for components that use it
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      // Call logout API if needed
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear auth data regardless of API call success
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      // Also clear from sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}