'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUpWithFirebase: (email: string, password: string, name?: string) => Promise<void>;
  signInWithFirebase: (email: string, password: string) => Promise<void>;
  signOutFromFirebase: () => Promise<void>;
  sendEmailVerification: (userId: string) => Promise<void>;
  verifyEmail: (actionCode: string) => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const firebaseAuth = useFirebaseAuth();

  // Create the context value using Firebase auth
  const value: AuthContextType = {
    user: firebaseAuth.user,
    loading: firebaseAuth.loading,
    error: firebaseAuth.error,
    signUpWithFirebase: firebaseAuth.signUpWithFirebase,
    signInWithFirebase: firebaseAuth.signInWithFirebase,
    signOutFromFirebase: firebaseAuth.signOutFromFirebase,
    sendEmailVerification: firebaseAuth.sendEmailVerification,
    verifyEmail: firebaseAuth.verifyEmail,
    clearError: firebaseAuth.clearError,
    isAuthenticated: !!firebaseAuth.user,
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