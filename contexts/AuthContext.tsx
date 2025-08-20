'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useCognitoAuth } from '@/hooks/useCognitoAuth';
import { User as FirebaseUser } from 'firebase/auth';

// Unified User interface that works with both Firebase and Cognito
interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  // User and state
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authMethod: 'jwt' | 'firebase' | 'cognito' | null;

  // Generic auth methods
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  clearError: () => void;

  // JWT/Traditional auth
  signup: (email: string, password: string, name?: string) => Promise<void>;

  // Firebase auth methods
  signUpWithFirebase: (email: string, password: string, name?: string) => Promise<void>;
  signInWithFirebase: (email: string, password: string) => Promise<void>;
  signOutFromFirebase: () => Promise<void>;
  sendEmailVerification: (userId: string) => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;

  // AWS Cognito auth methods
  signUpWithCognito: (email: string, password: string, name?: string) => Promise<{ needsVerification: boolean }>;
  signInWithCognito: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, confirmationCode: string) => Promise<void>;
  resendConfirmationCode: (email: string) => Promise<void>;
  signOutFromCognito: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Local state for unified auth
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'jwt' | 'firebase' | 'cognito' | null>(null);

  // Initialize auth hooks
  const firebaseAuth = useFirebaseAuth();
  const cognitoAuth = useCognitoAuth();

  useEffect(() => {
    // Check if auth bypass is enabled
    const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

    if (bypassAuth) {
      console.log('Auth bypass enabled - providing mock user data');
      const mockUser: User = {
        id: 'mock-user-id',
        email: 'user@example.com',
        name: 'Demo User',
        emailVerified: true
      };
      const mockToken = 'mock-auth-token';

      setUser(mockUser);
      setToken(mockToken);
      setAuthMethod('jwt');

      // Store mock data in storage for consistency
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_method', 'jwt');
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('user', JSON.stringify(mockUser));

      setLoading(false);
      return;
    }

    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const storedMethod = localStorage.getItem('auth_method') as 'jwt' | 'firebase' | 'cognito' | null;

    // Also check sessionStorage
    const sessionToken = sessionStorage.getItem('token');
    const sessionUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setAuthMethod(storedMethod || 'jwt');

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
        localStorage.removeItem('auth_method');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    } else if (sessionToken && sessionUser) {
      // If data is only in sessionStorage, use that
      try {
        setToken(sessionToken);
        setUser(JSON.parse(sessionUser));
        setAuthMethod('jwt'); // Default to JWT for session-only data

        // Also store in localStorage for persistence
        localStorage.setItem('auth_token', sessionToken);
        localStorage.setItem('auth_user', sessionUser);
        localStorage.setItem('auth_method', 'jwt');
      } catch (error) {
        console.error('Error parsing session user:', error);
        // Clear invalid data
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Generic auth methods
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setError(null);

    // Store auth data in both localStorage and sessionStorage
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_method', authMethod || 'jwt');

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
      setAuthMethod(null);
      setError(null);

      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_method');

      // Also clear from sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Clear Firebase auth if it was used
      if (authMethod === 'firebase') {
        await firebaseAuth.signOutFromFirebase();
      }

      // Clear Cognito auth if it was used
      if (authMethod === 'cognito') {
        cognitoAuth.signOut();
      }
    }
  };

  const clearError = () => {
    setError(null);
    firebaseAuth.clearError();
    cognitoAuth.clearError();
  };

  // JWT/Traditional signup
  const signup = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      setAuthMethod('jwt');
      login(data.token, data.user);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Firebase authentication methods
  const signUpWithFirebase = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      setAuthMethod('firebase');

      await firebaseAuth.signUpWithFirebase(email, password, name);

      // Convert Firebase user to our User interface
      if (firebaseAuth.user) {
        const unifiedUser: User = {
          id: firebaseAuth.user.uid,
          email: firebaseAuth.user.email || email,
          name: firebaseAuth.user.displayName || name,
          emailVerified: firebaseAuth.user.emailVerified
        };

        setUser(unifiedUser);
        // Firebase handles its own token management
        setToken('firebase-token'); // Placeholder since Firebase manages tokens internally

        // Store in localStorage
        localStorage.setItem('auth_user', JSON.stringify(unifiedUser));
        localStorage.setItem('auth_method', 'firebase');
      }
    } catch (error: any) {
      console.error('Firebase signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithFirebase = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setAuthMethod('firebase');

      await firebaseAuth.signInWithFirebase(email, password);

      // Convert Firebase user to our User interface
      if (firebaseAuth.user) {
        const unifiedUser: User = {
          id: firebaseAuth.user.uid,
          email: firebaseAuth.user.email || email,
          name: firebaseAuth.user.displayName,
          emailVerified: firebaseAuth.user.emailVerified
        };

        setUser(unifiedUser);
        setToken('firebase-token'); // Placeholder since Firebase manages tokens internally

        // Store in localStorage
        localStorage.setItem('auth_user', JSON.stringify(unifiedUser));
        localStorage.setItem('auth_method', 'firebase');
      }
    } catch (error: any) {
      console.error('Firebase signin error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOutFromFirebase = async () => {
    await firebaseAuth.signOutFromFirebase();
    await logout();
  };

  const sendEmailVerification = async (userId: string) => {
    await firebaseAuth.sendEmailVerification(userId);
  };

  const verifyEmail = async (actionCode: string) => {
    await firebaseAuth.verifyEmail(actionCode);
  };

  // AWS Cognito authentication methods
  const signUpWithCognito = async (email: string, password: string, name?: string) => {
    try {
      setLoading(true);
      setError(null);
      setAuthMethod('cognito');

      const result = await cognitoAuth.signUpWithCognito(email, password, name);

      // Convert Cognito user to our User interface
      if (cognitoAuth.user) {
        const unifiedUser: User = {
          id: cognitoAuth.user.id,
          email: cognitoAuth.user.email,
          name: cognitoAuth.user.name,
          emailVerified: cognitoAuth.user.emailVerified
        };

        setUser(unifiedUser);
        setToken(cognitoAuth.accessToken || 'cognito-token');

        // Store in localStorage
        localStorage.setItem('auth_user', JSON.stringify(unifiedUser));
        localStorage.setItem('auth_method', 'cognito');
        if (cognitoAuth.accessToken) {
          localStorage.setItem('auth_token', cognitoAuth.accessToken);
        }
      }

      return result;
    } catch (error: any) {
      console.error('Cognito signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithCognito = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      setAuthMethod('cognito');

      await cognitoAuth.signInWithCognito(email, password);

      // Convert Cognito user to our User interface
      if (cognitoAuth.user) {
        const unifiedUser: User = {
          id: cognitoAuth.user.id,
          email: cognitoAuth.user.email,
          name: cognitoAuth.user.name,
          emailVerified: cognitoAuth.user.emailVerified
        };

        setUser(unifiedUser);
        setToken(cognitoAuth.accessToken || 'cognito-token');

        // Store in localStorage
        localStorage.setItem('auth_user', JSON.stringify(unifiedUser));
        localStorage.setItem('auth_method', 'cognito');
        if (cognitoAuth.accessToken) {
          localStorage.setItem('auth_token', cognitoAuth.accessToken);
        }
      }
    } catch (error: any) {
      console.error('Cognito signin error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const confirmSignUp = async (email: string, confirmationCode: string) => {
    await cognitoAuth.confirmSignUp(email, confirmationCode);
  };

  const resendConfirmationCode = async (email: string) => {
    await cognitoAuth.resendConfirmationCode(email);
  };

  const signOutFromCognito = () => {
    cognitoAuth.signOut();
    logout();
  };

  // Create the unified context value
  const value: AuthContextType = {
    // User and state
    user,
    token,
    loading: loading || firebaseAuth.loading || cognitoAuth.loading,
    error: error || firebaseAuth.error || cognitoAuth.error,
    isAuthenticated: !!user && !!token,
    authMethod,

    // Generic auth methods
    login,
    logout,
    clearError,

    // JWT/Traditional auth
    signup,

    // Firebase auth methods
    signUpWithFirebase,
    signInWithFirebase,
    signOutFromFirebase,
    sendEmailVerification,
    verifyEmail,

    // AWS Cognito auth methods
    signUpWithCognito,
    signInWithCognito,
    confirmSignUp,
    resendConfirmationCode,
    signOutFromCognito,
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