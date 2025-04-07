'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

export function ApiTest() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGet = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/test')
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        setResult(JSON.stringify(data, null, 2))
      } else {
        const text = await response.text()
        setResult(`Non-JSON response: ${text.substring(0, 100)}...`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const testPost = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, time: new Date().toISOString() })
      })
      
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        setResult(JSON.stringify(data, null, 2))
      } else {
        const text = await response.text()
        setResult(`Non-JSON response: ${text.substring(0, 100)}...`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const testSignup = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
      })
      
      const contentType = response.headers.get('content-type')
      console.log('Response status:', response.status)
      console.log('Content type:', contentType)
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        setResult(JSON.stringify(data, null, 2))
      } else {
        const text = await response.text()
        setResult(`Non-JSON response: ${text.substring(0, 500)}...`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">API Test Tool</h2>
      
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Button onClick={testGet} disabled={isLoading}>
            Test GET /api/test
          </Button>
          
          <Button onClick={testPost} disabled={isLoading}>
            Test POST /api/test
          </Button>
          
          <Button onClick={testSignup} disabled={isLoading}>
            Test POST /api/auth/signup
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <h3 className="font-bold">Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap overflow-auto max-h-96 bg-gray-100 p-2 rounded">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiTest
