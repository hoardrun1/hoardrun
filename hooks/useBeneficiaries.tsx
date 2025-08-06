import { useState, useCallback } from 'react'
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
}

interface CreateBeneficiaryData {
  name: string
  accountNumber: string
  bankName: string
  bankCode?: string
  email?: string
  phoneNumber?: string
}

interface BeneficiaryList {
  beneficiaries: Beneficiary[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

export function useBeneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  })
  const { addToast } = useToast()

  const fetchBeneficiaries = useCallback(async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.append('search', search)

      const response = await fetch(`/api/beneficiaries?${params.toString()}`)
      const data: BeneficiaryList = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch beneficiaries')
      }

      setBeneficiaries(data.beneficiaries)
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        hasMore: data.hasMore,
      })

      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch beneficiaries'
      setError(message)
      addToast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  const addBeneficiary = useCallback(async (data: CreateBeneficiaryData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add beneficiary')
      }

      setBeneficiaries(prev => [result.beneficiary, ...prev])
      addToast({
        title: "Success",
        description: "Beneficiary added successfully",
      })

      return result.beneficiary
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add beneficiary'
      setError(message)
      addToast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  const updateBeneficiary = useCallback(async (
    id: string,
    data: Partial<CreateBeneficiaryData>
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/beneficiaries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...data }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update beneficiary')
      }

      setBeneficiaries(prev =>
        prev.map(b => (b.id === id ? result.beneficiary : b))
      )
      addToast({
        title: "Success",
        description: "Beneficiary updated successfully",
      })

      return result.beneficiary
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update beneficiary'
      setError(message)
      addToast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  const deleteBeneficiary = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/beneficiaries?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete beneficiary')
      }

      setBeneficiaries(prev => prev.filter(b => b.id !== id))
      addToast({
        title: "Success",
        description: "Beneficiary deleted successfully",
      })

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete beneficiary'
      setError(message)
      addToast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [addToast])

  const getBeneficiaryById = useCallback((beneficiaryId: string) => {
    return beneficiaries.find(b => b.id === beneficiaryId)
  }, [beneficiaries])

  const searchBeneficiaries = useCallback((query: string) => {
    const searchLower = query.toLowerCase()
    return beneficiaries.filter(b =>
      b.name.toLowerCase().includes(searchLower) ||
      b.accountNumber.includes(query) ||
      b.bankName.toLowerCase().includes(searchLower) ||
      b.email?.toLowerCase().includes(searchLower)
    )
  }, [beneficiaries])

  return {
    beneficiaries,
    isLoading,
    error,
    pagination,
    fetchBeneficiaries,
    addBeneficiary,
    updateBeneficiary,
    deleteBeneficiary,
    getBeneficiaryById,
    searchBeneficiaries,
  }
} 