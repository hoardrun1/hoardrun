'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Loader2, CheckCircle, XCircle } from 'lucide-react'

export function EmailTest() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const testVerificationEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage('Please enter an email address')
      setIsSuccess(false)
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name: name || 'Test User' }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setMessage('Verification email sent successfully! Check your inbox.')
      } else {
        setIsSuccess(false)
        setMessage(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage('Network error: Failed to send verification email')
    } finally {
      setIsLoading(false)
    }
  }

  const testForgotPassword = async () => {
    if (!email) {
      setMessage('Please enter an email address')
      setIsSuccess(false)
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      setIsSuccess(true)
      setMessage(data.message || 'Password reset email sent!')
    } catch (error) {
      setIsSuccess(false)
      setMessage('Network error: Failed to send password reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-blue-500" />
        </div>
        <CardTitle>Test Web3Forms Email</CardTitle>
        <CardDescription>
          Test the email verification system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert className={isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {isSuccess ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={isSuccess ? 'text-green-800' : 'text-red-800'}>
                {message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <form onSubmit={testVerificationEmail} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Verification Email'
              )}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              onClick={testForgotPassword}
              disabled={isLoading} 
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Password Reset Email'
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 text-center">
          <p>This will send real emails using Web3Forms</p>
          <p>Access Key: 01ba0925-f1bd-40a7-bc04-f33fb72e964c</p>
        </div>
      </CardContent>
    </Card>
  )
}
