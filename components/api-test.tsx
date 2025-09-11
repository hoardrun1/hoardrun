'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { apiClient } from '@/lib/api-client'

export function ApiTest() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testGet = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Test getting user profile as a basic API test
      const response = await apiClient.getProfile()
      if (response.error) {
        setResult(`API Error: ${response.error}`)
      } else {
        setResult(JSON.stringify(response.data, null, 2))
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
      // Test creating a transaction as a POST operation test
      const response = await apiClient.createTransaction({
        type: 'expense',
        amount: 10.00,
        description: 'API Test Transaction',
        category: 'testing'
      })
      if (response.error) {
        setResult(`API Error: ${response.error}`)
      } else {
        setResult(JSON.stringify(response.data, null, 2))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const testAuth = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Test authentication by getting dashboard data
      const response = await apiClient.getDashboard()
      if (response.error) {
        setResult(`API Error: ${response.error}`)
      } else {
        setResult(JSON.stringify(response.data, null, 2))
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
            Test GET Profile
          </Button>
          
          <Button onClick={testPost} disabled={isLoading}>
            Test POST Transaction
          </Button>
          
          <Button onClick={testAuth} disabled={isLoading}>
            Test Dashboard Auth
          </Button>
        </div>
        
        {error && (
          <div className="p-4 bg-gray-50 text-gray-700 rounded-md">
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
