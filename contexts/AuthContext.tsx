'use client'

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Define user type for Python backend
interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  profilePictureUrl?: string;
}

interface AuthContextType {
  // User and state
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Auth methods
  signUp: (email: string, password: string, firstName?: string, lastName?: string, phone?: string, dateOfBirth?: string, country?: string, bio?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (newToken: string, newUser: User) => void;
  logout: () => Promise<void>;
  signup: (email: string, password: string, firstName?: string, lastName?: string, phone?: string, dateOfBirth?: string, country?: string, bio?: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Local state for Python backend auth
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch current user profile from backend
  const fetchCurrentUser = async (authToken: string) => {
    try {
      apiClient.setToken(authToken);
      const response = await apiClient.getProfile();
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        const userData = response.data;
        const unifiedUser: User = {
          id: userData.id,
          email: userData.email,
          name: `${userData.first_name} ${userData.last_name}`.trim(),
          emailVerified: userData.is_active,
          profilePictureUrl: userData.profile_picture_url
        };
        
        setUser(unifiedUser);
        
        // Update stored user data in cookies and localStorage
        setCookie('auth-user', JSON.stringify(unifiedUser));
        localStorage.setItem('auth_user', JSON.stringify(unifiedUser));
        
        return unifiedUser;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      // If fetching user fails, clear auth data
      deleteCookie('auth-token');
      deleteCookie('auth-user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      apiClient.clearToken();
      setToken(null);
      setUser(null);
    }
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if this is the first initialization in this browser session
      const sessionInitialized = sessionStorage.getItem('auth_session_initialized');
      
      if (!sessionInitialized) {
        // First time in this browser session - clear any old tokens
        console.log('First initialization - clearing any old session data');
        deleteCookie('auth-token');
        deleteCookie('auth-user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        apiClient.clearToken();
        setToken(null);
        setUser(null);
        
        // Mark session as initialized
        sessionStorage.setItem('auth_session_initialized', 'true');
      } else {
        // Subsequent initializations in same session - restore auth state from storage
        console.log('Session already initialized - restoring current auth state');
        
        // Try to restore token and user from cookies first (primary storage)
        const storedToken = getCookie('auth-token');
        const storedUserStr = getCookie('auth-user');
        
        if (storedToken && storedUserStr) {
          try {
            const storedUser = JSON.parse(storedUserStr);
            console.log('Restoring auth state from cookies');
            setToken(storedToken);
            setUser(storedUser);
            apiClient.setToken(storedToken);
          } catch (error) {
            console.error('Error parsing stored user data:', error);
            // Clear corrupted data
            deleteCookie('auth-token');
            deleteCookie('auth-user');
            apiClient.clearToken();
          }
        } else {
          // Fallback to localStorage if cookies are not available
          const localToken = localStorage.getItem('auth_token');
          const localUserStr = localStorage.getItem('auth_user');
          
          if (localToken && localUserStr) {
            try {
              const localUser = JSON.parse(localUserStr);
              console.log('Restoring auth state from localStorage');
              setToken(localToken);
              setUser(localUser);
              apiClient.setToken(localToken);
            } catch (error) {
              console.error('Error parsing local user data:', error);
              // Clear corrupted data
              localStorage.removeItem('auth_token');
              localStorage.removeItem('auth_user');
              apiClient.clearToken();
            }
          } else {
            // No stored auth data found
            console.log('No stored auth data found');
            apiClient.clearToken();
          }
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    // Ensure apiClient always uses the latest token for Authorization header
    if (token) {
      apiClient.setToken(token);
    } else {
      apiClient.clearToken();
    }
  }, [token]);

  // Auth methods
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setError(null);

    // Store auth data in cookies (primary storage for middleware)
    setCookie('auth-token', newToken);
    setCookie('auth-user', JSON.stringify(newUser));

    // Also store in localStorage for backward compatibility
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));

    // Set the token directly in API client to ensure immediate availability
    apiClient.setToken(newToken);
    
    console.log('Login successful - token stored in cookies and localStorage');
  };

  const logout = async () => {
    try {
      // Call logout API
      if (token) {
        await apiClient.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear auth data regardless of API call success
      setToken(null);
      setUser(null);
      setError(null);

      // Clear API client token
      apiClient.clearToken();

      // Clear all possible storage locations to ensure complete logout
      deleteCookie('auth-token');
      deleteCookie('auth-user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Also clear any other potential auth-related storage
      localStorage.clear();
      sessionStorage.clear();
      
      console.log('User logged out - all auth data cleared');
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Signup using Python backend
  const signup = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string, dateOfBirth?: string, country?: string, bio?: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.register({
        email,
        password,
        first_name: firstName || email.split('@')[0],
        last_name: lastName || '',
        phone_number: phone || undefined,
        date_of_birth: dateOfBirth || undefined,
        country: country || undefined,
        bio: bio || undefined,
        terms_accepted: true,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Registration successful, but user needs to sign in to get a token
        // Clear any existing auth data and don't set user state
        deleteCookie('auth-token');
        deleteCookie('auth-user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        apiClient.clearToken();
        setToken(null);
        setUser(null);
        
        console.log('Registration successful. User needs to sign in to get access token.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signin using Python backend
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.login(email, password);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Check if response.data has the nested structure from success_response
        if (response.data.data) {
          const loginData = response.data.data;
          const unifiedUser: User = {
            id: loginData.user.id,
            email: loginData.user.email,
            name: `${loginData.user.first_name} ${loginData.user.last_name}`.trim(),
            emailVerified: loginData.user.email_verified,
            profilePictureUrl: loginData.user.profile_picture_url
          };

          login(loginData.access_token, unifiedUser);
        } else if (response.data.user) {
          // Handle direct structure if backend doesn't use success_response wrapper
          const unifiedUser: User = {
            id: response.data.user.id,
            email: response.data.user.email,
            name: `${response.data.user.first_name} ${response.data.user.last_name}`.trim(),
            emailVerified: response.data.user.email_verified,
            profilePictureUrl: response.data.user.profile_picture_url
          };

          login(response.data.access_token, unifiedUser);
        } else {
          console.error('Unexpected response structure:', response.data);
          throw new Error('Invalid response structure from server');
        }
      } else {
        throw new Error('No data received from server');
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Create the context value
  const value: AuthContextType = {
    // User and state
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,

    // Auth methods
    signUp: signup,
    signIn,
    signOut: logout,
    login,
    logout,
    signup,
    clearError,
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
