import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/NextAuthContext'
import { useToast } from '@/components/ui/use-toast'

interface Beneficiary {
  id: string
  name: string
  accountNumber: string
  bankName: string
  bankCode?: string
  email?: string
  phoneNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  transactionCount?: number
}

interface CreateBeneficiaryData {
  name: string
  accountNumber: string
  bankName: string
  bankCode?: string
  email?: string
  phoneNumber?: string
}

export function useBeneficiaries() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newBeneficiary, setNewBeneficiary] = useState<CreateBeneficiaryData>({
    name: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
    email: '',
    phoneNumber: ''
  })

  const fetchBeneficiaries = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/beneficiaries')
      if (!response.ok) throw new Error('Failed to fetch beneficiaries')

      const data = await response.json()
      setBeneficiaries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to fetch beneficiaries',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const createBeneficiary = useCallback(async (data: CreateBeneficiaryData) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create beneficiary')
      }

      const newBeneficiary = await response.json()
      setBeneficiaries(prev => [newBeneficiary, ...prev])

      toast({
        title: 'Success',
        description: 'Beneficiary added successfully',
      })

      return newBeneficiary
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create beneficiary',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const updateBeneficiary = useCallback(async (id: string, data: Partial<CreateBeneficiaryData>) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/beneficiaries/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update beneficiary')
      }

      const updatedBeneficiary = await response.json()
      setBeneficiaries(prev => prev.map(beneficiary => 
        beneficiary.id === updatedBeneficiary.id ? updatedBeneficiary : beneficiary
      ))

      toast({
        title: 'Success',
        description: 'Beneficiary updated successfully',
      })

      return updatedBeneficiary
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update beneficiary',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const deleteBeneficiary = useCallback(async (id: string) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/beneficiaries/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete beneficiary')
      }

      setBeneficiaries(prev => prev.filter(beneficiary => beneficiary.id !== id))

      toast({
        title: 'Success',
        description: 'Beneficiary deleted successfully',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete beneficiary',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const getBeneficiaryById = useCallback((id: string) => {
    return beneficiaries.find(beneficiary => beneficiary.id === id)
  }, [beneficiaries])

  const getActiveBeneficiaries = useCallback(() => {
    return beneficiaries.filter(beneficiary => beneficiary.isActive)
  }, [beneficiaries])

  const searchBeneficiaries = useCallback((query: string) => {
    const searchTerm = query.toLowerCase()
    return beneficiaries.filter(beneficiary => 
      beneficiary.name.toLowerCase().includes(searchTerm) ||
      beneficiary.accountNumber.includes(searchTerm) ||
      beneficiary.bankName.toLowerCase().includes(searchTerm) ||
      beneficiary.email?.toLowerCase().includes(searchTerm) ||
      beneficiary.phoneNumber?.includes(searchTerm)
    )
  }, [beneficiaries])

  const getFrequentBeneficiaries = useCallback((limit: number = 5) => {
    return [...beneficiaries]
      .sort((a, b) => (b.transactionCount || 0) - (a.transactionCount || 0))
      .slice(0, limit)
  }, [beneficiaries])

  const getRecentBeneficiaries = useCallback((limit: number = 5) => {
    return [...beneficiaries]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)
  }, [beneficiaries])

  return {
    beneficiaries,
    isLoading,
    error,
    newBeneficiary,
    setNewBeneficiary,
    fetchBeneficiaries,
    createBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    getBeneficiaryById,
    getActiveBeneficiaries,
    searchBeneficiaries,
    getFrequentBeneficiaries,
    getRecentBeneficiaries,
  }
}
