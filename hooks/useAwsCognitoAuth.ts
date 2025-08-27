'use client'

import { useState, useEffect, useCallback } from 'react';

// Define a simple user type for Cognito
interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

interface CognitoAuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface CognitoAuthActions {
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailVerification: (userId: string) => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
  clearError: () => void;
}

export type CognitoAuthHook = CognitoAuthState & CognitoAuthActions;

export function useAwsCognitoAuth(): CognitoAuthHook {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state - check session via API since cookie is httpOnly
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Since the auth-token cookie is httpOnly, we need to check session via API
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include', // Include httpOnly cookies
        });

        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.user) {
            setUser(sessionData.user);
          }
        } else if (response.status === 401) {
          // Session expired or invalid, clear any client-side state
          setUser(null);
        }

        // Check for URL parameters (callback from Cognito)
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        if (error) {
          setError(decodeURIComponent(error));
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const validateToken = async (token: string | undefined): Promise<User | null> => {
    if (!token) return null;

    try {
      // If it's a session token (base64 encoded), decode it
      if (token.length > 100 && !token.includes('.')) {
        try {
          const sessionData = JSON.parse(Buffer.from(token, 'base64').toString());
          if (sessionData.exp && sessionData.exp > Math.floor(Date.now() / 1000)) {
            return {
              id: sessionData.sub,
              email: sessionData.email,
              name: sessionData.name,
              emailVerified: true,
            };
          }
        } catch (e) {
          console.error('Session token decode error:', e);
        }
      }

      // For JWT tokens, you would validate with Cognito here
      // For now, return null to force re-authentication
      return null;
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  };

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Cognito hosted UI for sign up
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
      
      if (!cognitoDomain || !clientId) {
        throw new Error('Cognito configuration missing');
      }

      // Construct redirect URI dynamically based on current origin
      const redirectUri = `${window.location.origin}/api/auth/flexible-callback`;

      // Redirect to Cognito hosted UI for sign up
      const signUpUrl = `https://${cognitoDomain}/signup?client_id=${clientId}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = signUpUrl;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use Cognito hosted UI for sign in
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
      
      if (!cognitoDomain || !clientId) {
        throw new Error('Cognito configuration missing');
      }

      // Construct redirect URI dynamically based on current origin
      const redirectUri = `${window.location.origin}/api/auth/flexible-callback`;

      // Redirect to Cognito hosted UI for sign in
      const signInUrl = `https://${cognitoDomain}/login?client_id=${clientId}&response_type=code&scope=email+openid&redirect_uri=${encodeURIComponent(redirectUri)}`;
      window.location.href = signInUrl;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting logout process...');
      
      // Call server-side logout to clear httpOnly cookies
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear local storage
      localStorage.removeItem('cognito_access_token');
      localStorage.removeItem('cognito_id_token');
      localStorage.removeItem('cognito_refresh_token');
      
      // Clear user state immediately
      setUser(null);
      setLoading(false);
      
      console.log('User state cleared, redirecting to signin...');
      
      // Redirect to signin page
      window.location.href = `${window.location.origin}/signin`;
      
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      
      // Clear user state and redirect even if there's an error
      setUser(null);
      setLoading(false);
      window.location.href = `${window.location.origin}/signin`;
    }
  }, []);

  const sendEmailVerification = useCallback(async (userId: string) => {
    setError(null);
    
    try {
      // Email verification is handled by Cognito automatically
      console.log('Email verification handled by Cognito');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed';
      setError(errorMessage);
    }
  }, []);

  const verifyEmail = useCallback(async (actionCode: string) => {
    setError(null);
    
    try {
      // Email verification is handled by Cognito automatically
      console.log('Email verification handled by Cognito');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email verification failed';
      setError(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    sendEmailVerification,
    verifyEmail,
    clearError,
  };
}
