import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/use-toast'

interface Card {
  id: string
  type: 'VISA' | 'MASTERCARD' | 'AMEX'
  number: string
  expiryMonth: number
  expiryYear: number
  name: string
  isActive: boolean
  limit?: number
  balance: number
  createdAt: string
  updatedAt: string
}

interface CreateCardData {
  type: Card['type']
  number: string
  expiryMonth: number
  expiryYear: number
  cvv: string
  name: string
  limit?: number
}

export function useCards() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCards = useCallback(async () => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cards')
      if (!response.ok) throw new Error('Failed to fetch cards')

      const data = await response.json()
      setCards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to fetch cards',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const createCard = useCallback(async (data: CreateCardData) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create card')
      }

      const newCard = await response.json()
      setCards(prev => [newCard, ...prev])

      toast({
        title: 'Success',
        description: 'Card created successfully',
      })

      return newCard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create card',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const updateCard = useCallback(async (id: string, data: Partial<Omit<CreateCardData, 'number' | 'cvv'>>) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/cards', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update card')
      }

      const updatedCard = await response.json()
      setCards(prev => prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      ))

      toast({
        title: 'Success',
        description: 'Card updated successfully',
      })

      return updatedCard
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update card',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const deleteCard = useCallback(async (id: string) => {
    if (!session?.user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/cards?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete card')
      }

      setCards(prev => prev.filter(card => card.id !== id))

      toast({
        title: 'Success',
        description: 'Card deleted successfully',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete card',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [session, toast])

  const getCardById = useCallback((id: string) => {
    return cards.find(card => card.id === id)
  }, [cards])

  const getCardsByType = useCallback((type: Card['type']) => {
    return cards.filter(card => card.type === type)
  }, [cards])

  const getActiveCards = useCallback(() => {
    return cards.filter(card => card.isActive)
  }, [cards])

  const calculateTotalBalance = useCallback(() => {
    return cards.reduce((total, card) => total + card.balance, 0)
  }, [cards])

  const calculateTotalLimit = useCallback(() => {
    return cards.reduce((total, card) => total + (card.limit || 0), 0)
  }, [cards])

  const calculateUtilization = useCallback((cardId: string) => {
    const card = getCardById(cardId)
    if (!card || !card.limit) return 0
    return (card.balance / card.limit) * 100
  }, [getCardById])

  return {
    cards,
    isLoading,
    error,
    fetchCards,
    createCard,
    updateCard,
    deleteCard,
    getCardById,
    getCardsByType,
    getActiveCards,
    calculateTotalBalance,
    calculateTotalLimit,
    calculateUtilization,
  }
} 