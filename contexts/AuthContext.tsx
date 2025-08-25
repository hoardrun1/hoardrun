'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useAwsCognitoAuth } from '@/hooks/useAwsCognitoAuth';

// Define a simple user type for AWS Cognito
interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendEmailVerification: (userId: string) => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  // Keep Firebase method names for backward compatibility
  signUpWithFirebase: (email: string, password: string, name?: string) => Promise<void>;
  signInWithFirebase: (email: string, password: string) => Promise<void>;
  signOutFromFirebase: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const cognitoAuth = useAwsCognitoAuth();

  // Create the context value using AWS Cognito auth
  const value: AuthContextType = {
    user: cognitoAuth.user,
    loading: cognitoAuth.loading,
    error: cognitoAuth.error,
    signUp: cognitoAuth.signUp,
    signIn: cognitoAuth.signIn,
    signOut: cognitoAuth.signOut,
    sendEmailVerification: cognitoAuth.sendEmailVerification,
    verifyEmail: cognitoAuth.verifyEmail,
    clearError: cognitoAuth.clearError,
    isAuthenticated: cognitoAuth.isAuthenticated,
    // Backward compatibility aliases
    signUpWithFirebase: cognitoAuth.signUp,
    signInWithFirebase: cognitoAuth.signIn,
    signOutFromFirebase: cognitoAuth.signOut,
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
