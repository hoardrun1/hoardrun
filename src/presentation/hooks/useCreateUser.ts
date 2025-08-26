// Presentation: React Hook for User Creation
// Clean separation between UI and business logic

import { useState } from 'react'
import { CreateUserRequest, CreateUserResponse } from '../../application/use-cases/CreateUserUseCase'

interface UseCreateUserResult {
  createUser: (request: CreateUserRequest) => Promise<CreateUserResponse>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

export function useCreateUser(): UseCreateUserResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createUser = async (request: CreateUserRequest): Promise<CreateUserResponse> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      return {
        userId: data.data.userId,
        email: data.data.email,
        name: data.data.name,
        success: true,
        message: data.message
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      
      return {
        userId: '',
        email: request.email,
        name: request.name,
        success: false,
        message: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    createUser,
    isLoading,
    error,
    clearError
  }
}
