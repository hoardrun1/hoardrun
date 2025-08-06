/**
 * Authentication bypass utilities
 * 
 * This module provides utilities for bypassing authentication when
 * NEXT_PUBLIC_BYPASS_AUTH is set to 'true' in the environment.
 */

/**
 * Check if authentication bypass is enabled
 */
export function isAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
}

/**
 * Mock user data for bypass mode
 */
export const mockUser = {
  id: 'mock-user-id',
  email: 'user@example.com',
  name: 'Demo User'
};

/**
 * Mock token for bypass mode
 */
export const mockToken = 'mock-auth-token';

/**
 * Log bypass status
 */
export function logBypassStatus(context: string): void {
  if (isAuthBypassEnabled()) {
    console.log(`Auth bypass enabled for ${context}`);
  }
}

/**
 * Get mock session data for NextAuth bypass
 */
export function getMockSession() {
  return {
    user: mockUser,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };
}

/**
 * Check if a component should bypass authentication
 * @param hasUser - Whether the user is currently authenticated
 * @param isLoading - Whether authentication is still loading
 * @returns true if should bypass, false otherwise
 */
export function shouldBypassAuth(hasUser: boolean, isLoading: boolean): boolean {
  const bypass = isAuthBypassEnabled();
  if (bypass) {
    return true;
  }
  return hasUser && !isLoading;
}
