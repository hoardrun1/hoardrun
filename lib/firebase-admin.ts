// Firebase removed - using simple authentication without Firebase dependencies
// This file is kept for compatibility with existing imports

// Stub admin auth for compatibility
export const adminAuth = null

// Stub function for compatibility
export function getApps() {
  return []
}

// Stub function for compatibility
export async function verifyFirebaseToken(token: string) {
  console.log('Firebase removed - token verification disabled')
  return null
}
