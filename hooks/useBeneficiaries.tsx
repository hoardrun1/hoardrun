import { useState, useCallback } from 'react'
import { useToast } from '../components/ui/use-toast'
import { apiClient, Beneficiary } from '../lib/api-client'

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
  const { toast } = useToast()

  const fetchBeneficiaries = useCallback(async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.getBeneficiaries()

      if (response.error) {
        // Handle specific error cases
        if (response.status === 401) {
          // Token expired - don't show toast as AuthContext will handle this
          console.log('Authentication required for beneficiaries')
          return null
        }
        
        if (response.status === 403) {
          const message = 'You do not have permission to view beneficiaries'
          setError(message)
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: message,
          })
          return null
        }
        
        throw new Error(response.error || 'Failed to fetch beneficiaries')
      }

      const beneficiaries = response.data || []
      setBeneficiaries(beneficiaries)
      setPagination({
        total: beneficiaries.length,
        page: 1,
        totalPages: 1,
        hasMore: false,
      })

      return {
        beneficiaries,
        total: beneficiaries.length,
        page: 1,
        totalPages: 1,
        hasMore: false,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch beneficiaries'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const addBeneficiary = useCallback(async (data: CreateBeneficiaryData) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.createBeneficiary({
        name: data.name,
        account_number: data.accountNumber,
        bank_name: data.bankName,
        bank_code: data.bankCode,
        email: data.email,
        phone_number: data.phoneNumber
      })

      if (response.error) {
        throw new Error(response.error || 'Failed to add beneficiary')
      }

      if (response.data) {
        setBeneficiaries(prev => [response.data!, ...prev])
        toast({
          title: "Success",
          description: "Beneficiary added successfully",
        })

        return response.data
      }

      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add beneficiary'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const updateBeneficiary = useCallback(async (
    id: string,
    data: Partial<CreateBeneficiaryData>
  ) => {
    try {
      setIsLoading(true)
      setError(null)

      const updateData = {
        name: data.name,
        account_number: data.accountNumber,
        bank_name: data.bankName,
        bank_code: data.bankCode,
        email: data.email,
        phone_number: data.phoneNumber
      }

      const response = await apiClient.updateBeneficiary(id, updateData)

      if (response.error) {
        throw new Error(response.error || 'Failed to update beneficiary')
      }

      if (response.data) {
        setBeneficiaries(prev =>
          prev.map(b => (b.id === id ? response.data! : b))
        )
        toast({
          title: "Success",
          description: "Beneficiary updated successfully",
        })

        return response.data
      }

      return null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update beneficiary'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const deleteBeneficiary = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiClient.deleteBeneficiary(id)

      if (response.error) {
        throw new Error(response.error || 'Failed to delete beneficiary')
      }

      setBeneficiaries(prev => prev.filter(b => b.id !== id))
      toast({
        title: "Success",
        description: "Beneficiary deleted successfully",
      })

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete beneficiary'
      setError(message)
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const getBeneficiaryById = useCallback((beneficiaryId: string) => {
    return beneficiaries.find(b => b.id === beneficiaryId)
  }, [beneficiaries])

  const searchBeneficiaries = useCallback((query: string) => {
    const searchLower = query.toLowerCase()
    return beneficiaries.filter(b =>
      b.name.toLowerCase().includes(searchLower) ||
      b.account_number.includes(query) ||
      b.bank_name.toLowerCase().includes(searchLower) ||
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
