/**
 * API Client for connecting to the Python FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hoardrun-backend-py-1.onrender.com/api/v1'

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  date_of_birth?: string
  country?: string
  bio?: string
  profile_picture_url?: string
  status?: string
  role?: string
  email_verified?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface Transaction {
  id: string
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'INVESTMENT'
  amount: number
  description: string
  date: string
  status: 'COMPLETED' | 'PENDING' | 'FAILED'
  category?: string
  beneficiary?: string
  account_id?: string
}

export interface Beneficiary {
  id: string
  name: string
  account_number: string
  bank_name: string
  bank_code?: string
  email?: string
  phone_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  name: string
  type: string
  amount: number
  return: number
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  performance: Array<{ value: number; date: string }>
  holdings: string[]
}

export interface PaymentMethod {
  id: string
  type: 'CARD' | 'BANK_ACCOUNT' | 'MOBILE_MONEY'
  name: string
  last_four?: string
  status: 'active' | 'locked' | 'frozen' | 'lost'
  spending_limit?: number
  created_at: string
  updated_at: string
}

export interface BankAccount {
  id: string
  account_type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT'
  account_number: string
  balance: number
  currency: string
  status: 'active' | 'inactive' | 'closed'
  is_primary: boolean
  name?: string
  created_at: string
  updated_at: string
}

export interface DashboardData {
  balance: number
  total_income: number
  total_expenses: number
  recent_transactions: Transaction[]
  savings_goals: any[]
  investments: Investment[]
}

export interface BudgetCategory {
  id: string
  name: string
  category: string
  budgeted_amount: number
  spent_amount: number
  remaining_amount: number
  percentage_used: number
  status: 'under_budget' | 'on_track' | 'over_budget' | 'exceeded'
  period: string
  start_date: string
  end_date?: string
  currency: string
  is_active: boolean
  days_remaining?: number
  daily_budget_remaining?: number
  created_at: string
  updated_at: string
}

export interface BudgetSummary {
  total_budgets: number
  active_budgets: number
  total_budgeted: number
  total_spent: number
  total_remaining: number
  overall_percentage_used: number
  budgets_over_limit: number
  budgets_on_track: number
  budgets_under_budget: number
}

export interface SpendingByCategory {
  category: string
  amount: number
  percentage: number
  transaction_count: number
  average_transaction: number
  trend: 'increasing' | 'decreasing' | 'stable'
  previous_period_amount?: number
  change_amount?: number
  change_percentage?: number
}

export interface FinancialInsight {
  id: string
  title: string
  description: string
  insight_type: string
  category?: string
  amount?: number
  percentage?: number
  action_recommended: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string
}

class ApiClient {
  private baseUrl: string
  private _token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getCurrentToken(): void {
    if (typeof window !== 'undefined') {
      // Try to get token from localStorage or cookies
      this._token = localStorage.getItem('auth_token') || null
    }
  }

  public setToken(token: string): void {
    this._token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  public clearToken(): void {
    this._token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Ensure we have the latest token from cookies before making the request
    this.getCurrentToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this._token) {
      headers.Authorization = `Bearer ${this._token}`
    }

    console.log('API Request Headers:', headers); // Debug log

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.detail || data.message || 'An error occurred',
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    phone_number?: string
    date_of_birth?: string
    country?: string
    bio?: string
    terms_accepted: boolean
  }): Promise<ApiResponse<User>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
    return response
  }

  // Dashboard endpoints
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return this.request('/dashboard')
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.request<{success: boolean, data: {user: User}, message: string}>('/auth/me')
    
    // Handle the success_response structure from backend
    if (response.data && response.data.success && response.data.data && response.data.data.user) {
      return {
        data: response.data.data.user,
        status: response.status,
        message: response.data.message
      }
    }
    
    // If no nested structure, return the response with proper typing
    return {
      data: undefined,
      error: response.error,
      status: response.status
    }
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.request<{success: boolean, data: {user: User}, message: string}>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
    
    // Handle the success_response structure from backend
    if (response.data && response.data.success && response.data.data && response.data.data.user) {
      return {
        data: response.data.data.user,
        status: response.status,
        message: response.data.message
      }
    }
    
    // If no nested structure, return the response with proper typing
    return {
      data: undefined,
      error: response.error,
      status: response.status
    }
  }

  // Transaction endpoints
  async getTransactions(params?: {
    user_id?: string
    limit?: number
    offset?: number
    type?: string
    status?: string
  }): Promise<ApiResponse<Transaction[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    return this.request(`/transactions${query ? `?${query}` : ''}`)
  }

  async createTransaction(transactionData: {
    type: string
    amount: number
    description: string
    category?: string
  }): Promise<ApiResponse<Transaction>> {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    })
  }

  // Beneficiary endpoints
  async getBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    return this.request('/beneficiaries')
  }

  async createBeneficiary(beneficiaryData: {
    name: string
    account_number: string
    bank_name: string
    bank_code?: string
    email?: string
    phone_number?: string
  }): Promise<ApiResponse<Beneficiary>> {
    return this.request('/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(beneficiaryData),
    })
  }

  async updateBeneficiary(id: string, beneficiaryData: Partial<Beneficiary>): Promise<ApiResponse<Beneficiary>> {
    return this.request(`/beneficiaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(beneficiaryData),
    })
  }

  async deleteBeneficiary(id: string): Promise<ApiResponse> {
    return this.request(`/beneficiaries/${id}`, {
      method: 'DELETE',
    })
  }

  // Transfer endpoints
  async sendMoney(transferData: {
    beneficiary_id: string
    amount: number
    description?: string
    category?: string
  }): Promise<ApiResponse<Transaction>> {
    return this.request('/transfers/send', {
      method: 'POST',
      body: JSON.stringify(transferData),
    })
  }

  async calculateTransferFee(amount: number): Promise<ApiResponse<{
    fee: number
    total: number
    breakdown: { base: number; tax?: number; extra?: number }
  }>> {
    return this.request(`/transfers/calculate-fee?amount=${amount}`)
  }

  // Investment endpoints
  async getInvestments(): Promise<ApiResponse<Investment[]>> {
    return this.request('/investments')
  }

  async createInvestment(investmentData: {
    name: string
    type: string
    amount: number
  }): Promise<ApiResponse<Investment>> {
    return this.request('/investments', {
      method: 'POST',
      body: JSON.stringify(investmentData),
    })
  }

  // Portfolio endpoints
  async getPortfolios(page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
    return this.request(`/investments/portfolios?page=${page}&limit=${limit}`)
  }

  async createPortfolio(portfolioData: {
    name: string
    description?: string
    risk_tolerance?: string
    investment_strategy?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/investments/portfolios', {
      method: 'POST',
      body: JSON.stringify(portfolioData),
    })
  }

  async getPortfolio(portfolioId: string): Promise<ApiResponse<any>> {
    return this.request(`/investments/portfolios/${portfolioId}`)
  }

  async getPortfolioHoldings(portfolioId: string): Promise<ApiResponse<any>> {
    return this.request(`/investments/portfolios/${portfolioId}/holdings`)
  }

  // Investment summary and dashboard
  async getInvestmentSummary(): Promise<ApiResponse<any>> {
    return this.request('/investments/summary')
  }

  async getPerformanceSummary(period: string = '1M'): Promise<ApiResponse<any>> {
    return this.request(`/investments/performance-summary?period=${period}`)
  }

  async getAllocationOverview(): Promise<ApiResponse<any>> {
    return this.request('/investments/allocation-overview')
  }

  // Market data endpoints
  async getMarketData(symbols: string[]): Promise<ApiResponse<any>> {
    const symbolsParam = symbols.join(',')
    return this.request(`/investments/market-data?symbols=${symbolsParam}`)
  }

  async searchAssets(query: string, limit: number = 20): Promise<ApiResponse<any>> {
    return this.request(`/investments/search?query=${query}&limit=${limit}`)
  }

  async getTrendingAssets(limit: number = 10): Promise<ApiResponse<any>> {
    return this.request(`/investments/trending?limit=${limit}`)
  }

  async getMarketMovers(direction: string = 'gainers', limit: number = 10): Promise<ApiResponse<any>> {
    return this.request(`/investments/movers?direction=${direction}&limit=${limit}`)
  }

  // Order endpoints
  async getOrders(page: number = 1, limit: number = 20, portfolioId?: string): Promise<ApiResponse<any>> {
    let url = `/investments/orders?page=${page}&limit=${limit}`
    if (portfolioId) {
      url += `&portfolio_id=${portfolioId}`
    }
    return this.request(url)
  }

  async createOrder(orderData: {
    portfolio_id: string
    symbol: string
    order_type: string
    side: string
    quantity: number
    price?: number
  }): Promise<ApiResponse<any>> {
    return this.request('/investments/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  async getPendingOrders(): Promise<ApiResponse<any>> {
    return this.request('/investments/pending-orders')
  }

  // Watchlist endpoints
  async getWatchlists(): Promise<ApiResponse<any>> {
    return this.request('/investments/watchlists')
  }

  async createWatchlist(watchlistData: {
    name: string
    description?: string
    symbols?: string[]
  }): Promise<ApiResponse<any>> {
    return this.request('/investments/watchlists', {
      method: 'POST',
      body: JSON.stringify(watchlistData),
    })
  }

  async getWatchlist(watchlistId: string): Promise<ApiResponse<any>> {
    return this.request(`/investments/watchlists/${watchlistId}`)
  }

  async addToWatchlist(watchlistId: string, symbol: string): Promise<ApiResponse<any>> {
    return this.request(`/investments/watchlists/${watchlistId}/symbols/${symbol}`, {
      method: 'POST',
    })
  }

  async removeFromWatchlist(watchlistId: string, symbol: string): Promise<ApiResponse<any>> {
    return this.request(`/investments/watchlists/${watchlistId}/symbols/${symbol}`, {
      method: 'DELETE',
    })
  }

  // Analysis endpoints
  async getPortfolioAnalysis(portfolioId: string, analysisType: string = 'comprehensive', benchmark: string = 'SPY', period: string = '1Y'): Promise<ApiResponse<any>> {
    return this.request(`/investments/portfolios/${portfolioId}/analysis?analysis_type=${analysisType}&benchmark=${benchmark}&period=${period}`, {
      method: 'POST',
    })
  }

  async getQuickBuySuggestions(riskLevel: string = 'moderate', amount: number = 1000): Promise<ApiResponse<any>> {
    return this.request(`/investments/quick-buy-suggestions?risk_level=${riskLevel}&amount=${amount}`)
  }

  // Analytics endpoints
  async getSpendingAnalysis(params: {
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
    start_date?: string
    end_date?: string
    group_by?: 'category' | 'merchant' | 'day' | 'week' | 'month'
    currency?: string
  }): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/spending-analysis', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getCashFlowAnalysis(params: {
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
    start_date?: string
    end_date?: string
    categories?: string[]
    currency?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/analytics/cash-flow', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  async getFinancialHealthScore(): Promise<ApiResponse<any>> {
    return this.request('/analytics/financial-health')
  }

  async getFinancialInsights(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/insights')
  }

  async getBudgets(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/budgets')
  }

  async getBudgetSummary(): Promise<ApiResponse<any>> {
    return this.request('/analytics/budgets/summary')
  }

  async getFinancialGoals(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/financial-goals')
  }

  async getFinancialAlerts(): Promise<ApiResponse<any[]>> {
    return this.request('/analytics/alerts')
  }

  // Savings endpoints
  async getSavings(): Promise<ApiResponse<any[]>> {
    return this.request('/savings/goals')
  }

  async getSavingsStats(): Promise<ApiResponse<any>> {
    return this.request('/savings/stats')
  }

  async getSavingsInsights(): Promise<ApiResponse<any>> {
    return this.request('/savings/insights')
  }

  async createSavingsGoal(savingsData: {
    name: string
    target_amount: number
    description?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/savings/goals', {
      method: 'POST',
      body: JSON.stringify(savingsData),
    })
  }

  async updateSavingsGoal(goalId: string, savingsData: {
    name?: string
    target_amount?: number
    description?: string
  }): Promise<ApiResponse<any>> {
    return this.request(`/savings/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(savingsData),
    })
  }

  async deleteSavingsGoal(goalId: string): Promise<ApiResponse<any>> {
    return this.request(`/savings/goals/${goalId}`, {
      method: 'DELETE',
    })
  }

  async contributeToSavingsGoal(goalId: string, contributionData: {
    amount: number
    description?: string
  }): Promise<ApiResponse<any>> {
    return this.request(`/savings/goals/${goalId}/contribute`, {
      method: 'POST',
      body: JSON.stringify(contributionData),
    })
  }

  async getSavingsGoalHistory(goalId: string, params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    return this.request(`/savings/goals/${goalId}/history${query ? `?${query}` : ''}`)
  }

  // Notifications endpoints
  async getNotifications(params?: {
    type?: string
    status?: string
    priority?: string
    channel?: string
    date_from?: string
    date_to?: string
    unread_only?: boolean
    skip?: number
    limit?: number
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    return this.request(`/notifications${query ? `?${query}` : ''}`)
  }

  async getNotificationSummary(): Promise<ApiResponse<any>> {
    return this.request('/notifications/summary')
  }

  async createNotification(notificationData: {
    title: string
    message: string
    type: string
    priority?: string
    channels?: string[]
    metadata?: any
    scheduled_at?: string
    expires_at?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    })
  }

  async updateNotification(id: string, updateData: {
    status?: string
    read_at?: string
  }): Promise<ApiResponse<any>> {
    return this.request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.updateNotification(id, { 
      status: 'read',
      read_at: new Date().toISOString()
    })
  }

  async bulkUpdateNotifications(updateData: {
    notification_ids: string[]
    status: string
  }): Promise<ApiResponse<any>> {
    return this.request('/notifications/bulk-update', {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    })
  }

  async getNotificationPreferences(): Promise<ApiResponse<any>> {
    return this.request('/notifications/preferences')
  }

  async updateNotificationPreferences(preferencesData: {
    transaction_notifications?: boolean
    security_notifications?: boolean
    account_notifications?: boolean
    payment_notifications?: boolean
    savings_notifications?: boolean
    kyc_notifications?: boolean
    system_notifications?: boolean
    marketing_notifications?: boolean
    reminder_notifications?: boolean
    email_enabled?: boolean
    sms_enabled?: boolean
    push_enabled?: boolean
    quiet_hours_start?: string
    quiet_hours_end?: string
    timezone?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferencesData),
    })
  }

  async getNotificationStats(): Promise<ApiResponse<any>> {
    return this.request('/notifications/stats')
  }

  // Payment Methods endpoints
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return this.request('/payment-methods')
  }

  async createPaymentMethod(paymentMethodData: {
    type: string
    name: string
    details: any
  }): Promise<ApiResponse<PaymentMethod>> {
    return this.request('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(paymentMethodData),
    })
  }

  async updatePaymentMethod(id: string, paymentMethodData: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> {
    return this.request(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentMethodData),
    })
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse> {
    return this.request(`/payment-methods/${id}`, {
      method: 'DELETE',
    })
  }

  // Account endpoints
  async getAccounts(userId: string, params?: {
    account_type?: string
    status?: string
  }): Promise<ApiResponse<{ accounts: BankAccount[]; total_count: number }>> {
    const queryParams = new URLSearchParams()
    queryParams.append('user_id', userId)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    return this.request(`/accounts${query ? `?${query}` : ''}`)
  }

  async getAccount(accountId: string, userId: string): Promise<ApiResponse<{ account: BankAccount }>> {
    return this.request(`/accounts/${accountId}?user_id=${userId}`)
  }

  async createAccount(userId: string, accountData: {
    account_type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT'
    name?: string
    currency?: string
    initial_deposit?: number
  }): Promise<ApiResponse<{ account: BankAccount; account_id: string; account_number: string }>> {
    return this.request(`/accounts?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(accountData),
    })
  }

  async updateAccount(accountId: string, userId: string, accountData: {
    name?: string
    is_primary?: boolean
    overdraft_protection?: boolean
    minimum_balance?: number
  }): Promise<ApiResponse<{ account: BankAccount }>> {
    return this.request(`/accounts/${accountId}?user_id=${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(accountData),
    })
  }

  async getAccountBalance(accountId: string, userId: string): Promise<ApiResponse<{
    account_id: string
    balance: number
    available_balance: number
    pending_balance: number
    currency: string
  }>> {
    return this.request(`/accounts/${accountId}/balance?user_id=${userId}`)
  }

  async closeAccount(accountId: string, userId: string, reason?: string): Promise<ApiResponse<{ account: BankAccount }>> {
    const queryParams = new URLSearchParams()
    queryParams.append('user_id', userId)
    if (reason) {
      queryParams.append('reason', reason)
    }
    return this.request(`/accounts/${accountId}?${queryParams.toString()}`, {
      method: 'DELETE',
    })
  }

  async getAccountOverview(userId: string): Promise<ApiResponse<{
    total_balance: number
    accounts: BankAccount[]
    net_worth: number
    cash_flow: any
  }>> {
    return this.request(`/accounts/overview?user_id=${userId}`)
  }

  // User Settings endpoints
  async getUserSettings(): Promise<ApiResponse<any>> {
    return this.request('/users/settings')
  }

  async updateUserSettings(settingsData: {
    email_notifications?: boolean
    sms_notifications?: boolean
    push_notifications?: boolean
    marketing_emails?: boolean
    two_factor_enabled?: boolean
    currency_preference?: string
    language_preference?: string
    timezone?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    })
  }

  // Password change endpoint
  async changePassword(passwordData: {
    current_password: string
    new_password: string
  }): Promise<ApiResponse<any>> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    })
  }

  // Audit endpoints for security activity
  async getAuditLogs(params?: {
    user_id?: string
    event_type?: string
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const query = queryParams.toString()
    return this.request(`/audit/logs${query ? `?${query}` : ''}`)
  }

  async createAuditLog(auditData: {
    event_type: string
    description: string
    metadata?: any
    ip_address?: string
    user_agent?: string
    resource_id?: string
    resource_type?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/audit/logs', {
      method: 'POST',
      body: JSON.stringify(auditData),
    })
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; service: string; version: string }>> {
    return this.request('/health')
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient()

// Export the class for custom instances if needed
export default ApiClient
