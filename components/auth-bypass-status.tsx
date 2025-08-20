'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { isAuthBypassEnabled, mockUser } from '@/lib/auth-bypass'
import { useAuth } from '@/contexts/AuthContext'

export function AuthBypassStatus() {
  const [bypassEnabled, setBypassEnabled] = useState(false)
  const [envVar, setEnvVar] = useState('')
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    setBypassEnabled(isAuthBypassEnabled())
    setEnvVar(process.env.NEXT_PUBLIC_BYPASS_AUTH || 'not set')
  }, [])

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? trueText : falseText}
      </Badge>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Authentication Bypass Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Environment Variable:</span>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {envVar}
              </code>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bypass Enabled:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(bypassEnabled)}
                {getStatusBadge(bypassEnabled, "Enabled", "Disabled")}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">User Authenticated:</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(isAuthenticated)}
                {getStatusBadge(isAuthenticated, "Yes", "No")}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Current User:</div>
            {user ? (
              <div className="text-xs space-y-1 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                <div><strong>ID:</strong> {user.uid}</div>
                <div><strong>Email:</strong> {user.email}</div>
                <div><strong>Name:</strong> {user.displayName || 'N/A'}</div>
              </div>
            ) : (
              <div className="text-xs text-gray-500">No user data</div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-sm font-medium mb-2">Status Summary:</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {bypassEnabled ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Authentication bypass is active
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  All protected routes are accessible
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  Mock user data is being provided
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  Remember to disable in production
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <XCircle className="h-3 w-3 text-red-500" />
                  Authentication bypass is disabled
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  Normal authentication flow is active
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                  Protected routes require signin
                </div>
              </div>
            )}
          </div>
        </div>

        {bypassEnabled && (
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">Mock Data Being Used:</div>
            <div className="text-xs space-y-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <div><strong>Mock User ID:</strong> {mockUser.id}</div>
              <div><strong>Mock Email:</strong> {mockUser.email}</div>
              <div><strong>Mock Name:</strong> {mockUser.name}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
