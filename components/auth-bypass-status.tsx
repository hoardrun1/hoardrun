'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { isAuthBypassEnabled, mockUser } from '@/lib/auth-bypass'
import { useAuth } from '@/contexts/NextAuthContext'

export function AuthBypassStatus() {
  const [bypassEnabled, setBypassEnabled] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setBypassEnabled(isAuthBypassEnabled())
  }, [])

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Auth Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {bypassEnabled ? (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          ) : user ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Auth Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Auth Bypass:</span>
          <Badge variant={bypassEnabled ? "destructive" : "secondary"}>
            {bypassEnabled ? "ENABLED" : "DISABLED"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">User Status:</span>
          <Badge variant={user ? "default" : "secondary"}>
            {user ? "AUTHENTICATED" : "NOT AUTHENTICATED"}
          </Badge>
        </div>

        {bypassEnabled && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800 dark:text-yellow-200">
                <div className="font-medium mb-1">Development Mode Active</div>
                <div>Authentication is bypassed. Mock user data is being used.</div>
              </div>
            </div>
          </div>
        )}

        {user && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Current User:</div>
            <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-900 p-2 rounded">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Name:</strong> {user.name || 'N/A'}</div>
            </div>
          </div>
        )}

        {!user && !bypassEnabled && (
          <div className="text-xs text-gray-500">
            No user authenticated. Please sign in.
          </div>
        )}

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 space-y-1">
            <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
            <div><strong>NextAuth URL:</strong> {process.env.NEXTAUTH_URL || 'Not set'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
