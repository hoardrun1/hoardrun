'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"

export function ApiTestSimple() {
  const [result, setResult] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const testHelloApi = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/hello')
      const text = await response.text()
      setResult(`Status: ${response.status}\nResponse: ${text}`)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testMinimalApi = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/minimal')
      const text = await response.text()
      setResult(`Status: ${response.status}\nResponse: ${text}`)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSignupApi = async () => {
    setIsLoading(true)
    try {
      // First test GET
      const getResponse = await fetch('/api/auth/signup')
      const getText = await getResponse.text()

      // Then test POST
      const postResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      })
      const postText = await postResponse.text()

      setResult(`GET Status: ${getResponse.status}\nGET Response: ${getText}\n\nPOST Status: ${postResponse.status}\nPOST Response: ${postText}`)
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Simple API Test</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={testHelloApi} disabled={isLoading}>
            Test Hello API
          </Button>
          <Button onClick={testMinimalApi} disabled={isLoading}>
            Test Minimal API
          </Button>
          <Button onClick={testSignupApi} disabled={isLoading}>
            Test Signup API
          </Button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <pre className="whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiTestSimple
