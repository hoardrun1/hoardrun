'use client'

/**
 * What changes when Hoardrun runs inside the iPhone or Android app (Capacitor) rather than a browser.
 * On the website every function here does nothing, or the plain web thing.
 */
import { Capacitor } from '@capacitor/core'

export const APP_SCHEME = 'hoardrun'
const GOOGLE_PROOF_KEY = 'hr_google_app_proof'

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

export function nativePlatform(): 'ios' | 'android' | 'web' {
  try {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
  } catch {
    return 'web'
  }
}

/** A page outside Hoardrun, in the phone's own browser sheet (or a new tab on the web). */
export async function openOutside(url: string): Promise<void> {
  if (!isNativeApp()) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }
  const { Browser } = await import('@capacitor/browser')
  await Browser.open({ url, presentationStyle: 'popover' })
}

export async function closeOutside(): Promise<void> {
  if (!isNativeApp()) return
  const { Browser } = await import('@capacitor/browser')
  await Browser.close().catch(() => undefined)
}

function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Google sign-in from the app: a fresh secret stays in the app, and the server only gets its hash.
 * The callback must show the secret, so a code caught on its way back to the app is useless.
 */
export async function newGoogleAppProof(): Promise<string> {
  const secret = new Uint8Array(32)
  crypto.getRandomValues(secret)
  const proof = toHex(secret.buffer)
  try {
    localStorage.setItem(GOOGLE_PROOF_KEY, JSON.stringify({ proof, at: Date.now() }))
  } catch {
    // Without storage the callback will fail cleanly and the person can try again
  }
  return toHex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(proof)))
}

/** The secret for the sign-in under way, used once. */
export function takeGoogleAppProof(): string | undefined {
  try {
    const raw = localStorage.getItem(GOOGLE_PROOF_KEY)
    localStorage.removeItem(GOOGLE_PROOF_KEY)
    if (!raw) return undefined
    const { proof, at } = JSON.parse(raw) as { proof: string; at: number }
    // Sign-ins expire after 10 minutes on the server too
    return Date.now() - at < 10 * 60 * 1000 ? proof : undefined
  } catch {
    return undefined
  }
}

/** Google sign-ins started in the app: their state starts with this (see google_auth.py). */
export function isAppGoogleState(state: string): boolean {
  return state.startsWith('a_')
}

/** The same one-time app secret, for Sign in with Apple. Only one sign-in runs at a time. */
export const newAppSignInProof = newGoogleAppProof
export const takeAppSignInProof = takeGoogleAppProof
/** Apple sign-ins and tickets started in the app start with this too (see apple_auth.py). */
export const isAppSignIn = isAppGoogleState
