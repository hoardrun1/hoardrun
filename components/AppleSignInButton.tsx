'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { API_BASE_URL } from '@/lib/api-url'
import { isNativeApp, newAppSignInProof, openOutside } from '@/lib/native'

interface AppleSignInButtonProps {
  className?: string
  mode?: 'signin' | 'signup'
}

/**
 * Sign in with Apple. Shown only once the Apple keys are set up on the server. Apple requires it in the
 * App Store next to Google sign-in. In the phone apps it opens in the phone's browser and comes back
 * through a hoardrun:// link, like Google.
 */
export function AppleSignInButton({ className = '', mode = 'signin' }: AppleSignInButtonProps) {
  const [available, setAvailable] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    let live = true
    fetch(`${API_BASE_URL}/auth/apple/status`)
      .then(response => (response.ok ? response.json() : null))
      .then(body => live && setAvailable(Boolean(body?.configured)))
      .catch(() => undefined)
    return () => {
      live = false
    }
  }, [])

  if (!available) return null

  const start = async () => {
    setIsLoading(true)
    try {
      const callbackUrl = new URLSearchParams(window.location.search).get('callbackUrl')
      const inApp = isNativeApp()
      const response = await fetch(`${API_BASE_URL}/auth/apple/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          next: callbackUrl || undefined,
          app_proof_hash: inApp ? await newAppSignInProof() : undefined,
        }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok || !body?.url) {
        throw new Error(typeof body?.detail === 'string' ? body.detail : body?.message || "Couldn't reach Apple. Try again.")
      }
      if (inApp) {
        await openOutside(body.url)
        setIsLoading(false)
        return
      }
      window.location.assign(body.url)
    } catch (error) {
      toast({
        title: 'Sign in with Apple',
        description: error instanceof Error ? error.message : "Couldn't reach Apple. Try again.",
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full bg-white hover:bg-gray-200 border-gray-300 text-black hover:text-black py-6 text-base ${className}`}
      onClick={start}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M16.37 12.62c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.97.9-3.76 2.28-1.61 2.79-.41 6.91 1.15 9.17.77 1.1 1.68 2.34 2.87 2.3 1.16-.05 1.59-.74 2.99-.74 1.39 0 1.79.74 3.01.72 1.24-.02 2.03-1.12 2.79-2.23.88-1.28 1.24-2.52 1.26-2.59-.03-.01-2.42-.93-2.45-3.69zM14.09 5.87c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28z" />
        </svg>
      )}
      {t('signin.continueWithApple')}
    </Button>
  )
}
