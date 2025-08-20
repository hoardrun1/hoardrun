'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function BackendTest() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testBackend = async () => {
    setStatus('loading')
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_BACKEND_URL}/api/v1/auth/health`)
      const data = await res.json()
      
      if (res.ok) {
        setStatus('success')
        setResponse(data)
      } else {
        setStatus('error')
        setError(data.message || 'Backend test failed')
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Network error')
    }
  }

  const testGoogleConfig = async () => {
    setStatus('loading')
    setError(null)
    setResponse(null)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_BACKEND_URL}/api/v1/auth/config`)
      const data = await res.json()
      
      if (res.ok) {
        setStatus('success')
        setResponse(data)
      } else {
        setStatus('error')
        setError(data.message || 'Config test failed')
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Network error')
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
        <CardDescription>
          Test connection to deployed auth backend: {process.env.NEXT_PUBLIC_AUTH_BACKEND_URL}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testBackend} 
            disabled={status === 'loading'}
            variant="outline"
          >
            {status === 'loading' ? 'Testing...' : 'Test Health Check'}
          </Button>
          <Button 
            onClick={testGoogleConfig} 
            disabled={status === 'loading'}
            variant="outline"
          >
            {status === 'loading' ? 'Testing...' : 'Test Google Config'}
          </Button>
        </div>

        {status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span>Status:</span>
              <Badge variant={
                status === 'success' ? 'default' : 
                status === 'error' ? 'destructive' : 
                'secondary'
              }>
                {status}
              </Badge>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {response && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm font-medium mb-2">Response:</p>
                <pre className="text-xs text-green-700 overflow-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
