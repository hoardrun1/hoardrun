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
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  // Firebase auth methods
  signupWithFirebase: (email: string, password: string, name?: string) => Promise<void>;
  signinWithFirebase: (email: string, password: string) => Promise<void>;
  authMethod: 'jwt' | 'firebase' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMethod, setAuthMethod] = useState<'jwt' | 'firebase' | null>(null);

  useEffect(() => {
    // Check if auth bypass is enabled
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

    if (bypassAuth) {
      console.log('Auth bypass enabled - providing mock user data');
      const mockUser: User = {
        id: 'mock-user-id',
        email: 'user@example.com',
        name: 'Demo User'
      };
      const mockToken = 'mock-auth-token';

      setUser(mockUser);
      setToken(mockToken);

      // Store mock data in storage for consistency
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('user', JSON.stringify(mockUser));

      setIsLoading(false);
      return;
    }

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

  const signup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      login(data.token, data.user);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase authentication methods
  const signupWithFirebase = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/firebase/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Firebase signup failed');
      }

      const data = await response.json();

      // Sign in with custom token using Firebase client SDK
      const firebaseResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.customToken,
          returnSecureToken: true
        })
      });

      if (!firebaseResponse.ok) {
        throw new Error('Failed to authenticate with Firebase');
      }

      const firebaseData = await firebaseResponse.json();

      // Store Firebase ID token and user data
      setToken(firebaseData.idToken);
      setUser(data.user);
      setAuthMethod('firebase');

      // Store in localStorage
      localStorage.setItem('auth_token', firebaseData.idToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_method', 'firebase');

    } catch (error) {
      console.error('Firebase signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signinWithFirebase = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/auth/firebase/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Firebase signin failed');
      }

      const data = await response.json();

      // Sign in with custom token using Firebase client SDK
      const firebaseResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: data.customToken,
          returnSecureToken: true
        })
      });

      if (!firebaseResponse.ok) {
        throw new Error('Failed to authenticate with Firebase');
      }

      const firebaseData = await firebaseResponse.json();

      // Store Firebase ID token and user data
      setToken(firebaseData.idToken);
      setUser(data.user);
      setAuthMethod('firebase');

      // Store in localStorage
      localStorage.setItem('auth_token', firebaseData.idToken);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_method', 'firebase');

    } catch (error) {
      console.error('Firebase signin error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
    signupWithFirebase,
    signinWithFirebase,
    authMethod,
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