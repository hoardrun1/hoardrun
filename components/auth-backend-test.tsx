'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, Server } from 'lucide-react'

export function AuthBackendTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testBackendConnection = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_BACKEND_URL}/api/v1/auth/health`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Server className="h-12 w-12 text-blue-500" />
        </div>
        <CardTitle>Auth Backend Test</CardTitle>
        <CardDescription>
          Test connection to local auth-backend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Backend URL:</strong></p>
          <p className="font-mono text-xs bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_AUTH_BACKEND_URL || 'Not configured'}
          </p>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Connection Failed:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Connection Successful!</strong>
              <div className="mt-2 text-xs">
                <p>Environment: {result.data?.environment}</p>
                <p>Version: {result.data?.version}</p>
                <p>Features: {result.data?.features?.join(', ')}</p>
                <p>Database: {result.data?.database}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={testBackendConnection}
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Backend Connection'
          )}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <p>This tests the connection to your local auth-backend</p>
          <p>Make sure the backend is running on port 8000</p>
        </div>
      </CardContent>
    </Card>
  )
}
