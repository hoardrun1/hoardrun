import { api } from '@/lib/api-client'
import { cache } from '@/lib/cache'

export interface Beneficiary {
  id: string
  name: string
  accountNumber: string
  bankName?: string
  bankCode?: string
  email?: string
  phoneNumber?: string
  avatar?: string
  isActive: boolean
  transactionCount?: number
  lastTransaction?: {
    amount: number
    date: string
  }
}

export interface TransferDetails {
  amount: number
  description?: string
  category?: string
  beneficiaryId: string
  scheduledDate?: Date
  isRecurring?: boolean
  recurringFrequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  metadata?: Record<string, any>
}

export interface TransferHistory {
  id: string
  amount: number
  description?: string
  category?: string
  date: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  beneficiary: {
    name: string
    accountNumber: string
  }
  fee?: number
  metadata?: Record<string, any>
}

class TransferService {
  private readonly CACHE_DURATION = 5 * 60 // 5 minutes

  async getBeneficiaries(search?: string): Promise<Beneficiary[]> {
    try {
      const cacheKey = `beneficiaries:${search || ''}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await api.transfer.getBeneficiaries({ search })
      const beneficiaries = response.data

      await cache.set(cacheKey, JSON.stringify(beneficiaries), this.CACHE_DURATION)
      return beneficiaries
    } catch (error) {
      console.error('Get beneficiaries error:', error)
      throw error
    }
  }

  async addBeneficiary(data: {
    name: string
    accountNumber: string
    bankName?: string
    bankCode?: string
    email?: string
    phoneNumber?: string
  }): Promise<Beneficiary> {
    try {
      const response = await api.transfer.addBeneficiary(data)
      await this.invalidateBeneficiaryCache()
      return response.data
    } catch (error) {
      console.error('Add beneficiary error:', error)
      throw error
    }
  }

  async sendMoney(data: TransferDetails): Promise<{
    transaction: TransferHistory
    fee: number
  }> {
    try {
      const response = await api.transfer.send(data)
      await this.invalidateTransferCache()
      return response.data
    } catch (error) {
      console.error('Send money error:', error)
      throw error
    }
  }

  async getTransferHistory(
    beneficiaryId?: string,
    params?: {
      page?: number
      limit?: number
      startDate?: string
      endDate?: string
    }
  ): Promise<{
    transfers: TransferHistory[]
    pagination: {
      total: number
      pages: number
      currentPage: number
      limit: number
    }
  }> {
    try {
      const cacheKey = `transfer-history:${beneficiaryId || ''}:${JSON.stringify(params)}`
      const cached = await cache.get(cacheKey)
      if (cached) {
        return JSON.parse(cached)
      }

      const response = await api.transfer.getHistory(beneficiaryId, params)
      const history = response.data

      await cache.set(cacheKey, JSON.stringify(history), this.CACHE_DURATION)
      return history
    } catch (error) {
      console.error('Get transfer history error:', error)
      throw error
    }
  }

  async validateBeneficiary(accountNumber: string): Promise<{
    isValid: boolean
    bankName?: string
    accountName?: string
  }> {
    try {
      const response = await api.transfer.validateBeneficiary({ accountNumber })
      return response.data
    } catch (error) {
      console.error('Validate beneficiary error:', error)
      throw error
    }
  }

  async calculateFee(amount: number): Promise<{
    fee: number
    total: number
    breakdown: {
      base: number
      tax?: number
      extra?: number
    }
  }> {
    try {
      const response = await api.transfer.calculateFee({ amount })
      return response.data
    } catch (error) {
      console.error('Calculate fee error:', error)
      throw error
    }
  }

  private async invalidateBeneficiaryCache(): Promise<void> {
    try {
      await cache.delPattern('beneficiaries:*')
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }

  private async invalidateTransferCache(): Promise<void> {
    try {
      await Promise.all([
        cache.delPattern('transfer-history:*'),
        cache.delPattern('beneficiaries:*'),
      ])
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }
}

export const transferService = new TransferService()
export default transferService 