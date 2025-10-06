'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/ui/use-toast'
import { useTranslation } from 'react-i18next'

interface GoogleSignInButtonProps {
  className?: string
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useTranslation()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      // Simulate "coming soon" - no actual API call needed for this task
      await new Promise(resolve => setTimeout(resolve, 1000)) // Brief loading simulation

      // Use alert as fallback to ensure message shows
      alert("Google login will be available soon");

      // Also try toast if available
      if (toast) {
        toast({
          title: "Google Sign In",
          description: "Google login will be available soon",
          variant: "default",
        })
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      alert("Google login will be available soon");

      if (toast) {
        toast({
          title: "Google Sign In",
          description: "Google login will be available soon",
          variant: "default",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full bg-white hover:bg-gray-50 border-gray-300 text-black py-6 text-base ${className}`}
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {t("signin.continueWithGoogle")}
    </Button>
  )
}
