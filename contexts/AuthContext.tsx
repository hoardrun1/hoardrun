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

interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  profilePictureUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string, phone?: string, dateOfBirth?: string, country?: string, idNumber?: string, bio?: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setCookie('auth-user', JSON.stringify(unifiedUser));
        localStorage.setItem('auth_user', JSON.stringify(unifiedUser));
        
        return unifiedUser;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      clearAllAuthData();
      setToken(null);
      setUser(null);
    }
    return null;
  };

  const clearAllAuthData = () => {
    // Clear cookies
    deleteCookie('auth-token');
    deleteCookie('access_token');
    deleteCookie('refresh_token');
    deleteCookie('auth-user');
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth-token');
    
    // Clear sessionStorage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('auth_session_initialized');
    
    // Clear API client
    apiClient.clearToken();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth state...');
      
      // CRITICAL: Look for access_token specifically (not auth-token)
      const storedToken = getCookie('access_token') || localStorage.getItem('access_token');
      const storedUserStr = getCookie('auth-user') || localStorage.getItem('auth_user');
      
      if (storedToken && storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          console.log('Restoring auth state with access token');
          setToken(storedToken);
          setUser(storedUser);
          apiClient.setToken(storedToken);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          clearAllAuthData();
        }
      } else {
        console.log('No stored auth data found');
        apiClient.clearToken();
      }
      
      setLoading(false);
    };

    initializeAuth();

    const handleTokenExpiration = () => {
      console.log('Token expiration event received - logging out user');
      setToken(null);
      setUser(null);
      setError('Your session has expired. Please sign in again.');
    };

    const handleLoginSuccess = async (event: CustomEvent) => {
      console.log('Login success event received - refreshing user data');
      if (token) {
        const refreshedUser = await fetchCurrentUser(token);
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:token-expired', handleTokenExpiration);
      window.addEventListener('auth:login-success', handleLoginSuccess as unknown as EventListener);
      return () => {
        window.removeEventListener('auth:token-expired', handleTokenExpiration);
        window.removeEventListener('auth:login-success', handleLoginSuccess as unknown as EventListener);
      };
    }
  }, []);

  useEffect(() => {
    if (token) {
      apiClient.setToken(token);
    } else {
      apiClient.clearToken();
    }
  }, [token]);

  const login = (accessToken: string, newUser: User, refreshToken?: string) => {
    setToken(accessToken);
    setUser(newUser);
    setError(null);

    // CRITICAL: Store as access_token and refresh_token
    setCookie('access_token', accessToken);
    setCookie('auth-user', JSON.stringify(newUser));
    
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));

    if (refreshToken) {
      setCookie('refresh_token', refreshToken);
      localStorage.setItem('refresh_token', refreshToken);
      apiClient.setRefreshToken(refreshToken);
    }

    apiClient.setToken(accessToken);
    console.log('Login successful - access and refresh tokens stored');
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.logout();
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      setToken(null);
      setUser(null);
      setError(null);
      clearAllAuthData();
      console.log('User logged out - all auth data cleared');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const truncatePassword = (password: string, maxBytes: number = 72): string => {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let bytes = encoder.encode(password);
    if (bytes.length <= maxBytes) return password;
    bytes = bytes.slice(0, maxBytes);
    return decoder.decode(bytes, { stream: false });
  };

  const signup = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string, dateOfBirth?: string, country?: string, bio?: string) => {
    try {
      setLoading(true);
      setError(null);

      const truncatedPassword = truncatePassword(password);

      const response = await apiClient.register({
        email,
        password: truncatedPassword,
        first_name: firstName || email.split('@')[0],
        last_name: lastName || '',
        phone_number: phone || undefined,
        date_of_birth: dateOfBirth || undefined,
        country: country || undefined,
        bio: bio || undefined,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        clearAllAuthData();
        setToken(null);
        setUser(null);
        console.log('Registration successful. User needs to sign in.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const truncatedPassword = truncatePassword(password);
      const response = await apiClient.login(email, truncatedPassword);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        let loginData;
        
        // Handle nested structure from success_response
        if (response.data.data) {
          loginData = response.data.data;
        } else if (response.data.user) {
          loginData = response.data;
        } else {
          console.error('Unexpected response structure:', response.data);
          throw new Error('Invalid response structure from server');
        }

        const unifiedUser: User = {
          id: loginData.user.id,
          email: loginData.user.email,
          name: `${loginData.user.first_name} ${loginData.user.last_name}`.trim(),
          emailVerified: loginData.user.email_verified,
          profilePictureUrl: loginData.user.profile_picture_url
        };

        // CRITICAL: Pass access_token and refresh_token
        login(loginData.access_token, unifiedUser, loginData.refresh_token);
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

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
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
