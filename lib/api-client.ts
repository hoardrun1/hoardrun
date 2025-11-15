class ApiClient {
  private baseUrl: string
  private _token: string | null = null
  private _refreshToken: string | null = null
  private _isRefreshing: boolean = false
  private _refreshPromise: Promise<string | null> | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private getCurrentToken(): void {
    if (typeof window !== 'undefined') {
      const cookieToken = this.getCookie('access_token')
      if (cookieToken) {
        this._token = cookieToken
        return
      }

      const localToken = localStorage.getItem('access_token')
      if (localToken) {
        this._token = localToken
        return
      }

      this._token = null
    }
  }

  public setToken(token: string): void {
    this._token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
      const expires = new Date()
      expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000))
      document.cookie = `access_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`
    }
  }

  public setRefreshToken(token: string): void {
    this._refreshToken = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token)
      const expires = new Date()
      expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000))
      document.cookie = `refresh_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`
    }
  }

  public getRefreshToken(): string | null {
    if (this._refreshToken) return this._refreshToken
    if (typeof window !== 'undefined') {
      return this.getCookie('refresh_token') || localStorage.getItem('refresh_token')
    }
    return null
  }

  public clearToken(): void {
    this._token = null
    this._refreshToken = null
    this._isRefreshing = false
    this._refreshPromise = null
    
    if (typeof window !== 'undefined') {
      const keysToRemove = ['access_token', 'refresh_token', 'auth_token', 'auth-token', 'auth-user']
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        sessionStorage.removeItem(key)
      })

      const cookiesToClear = ['access_token', 'refresh_token', 'auth-token', 'auth-user']
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
      })
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      console.log('No refresh token available')
      return null
    }

    console.log('Performing token refresh...')

    try {
      const url = `${this.baseUrl}/auth/refresh`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Token refresh failed:', response.status, data)
        return null
      }

      console.log('Token refresh successful')

      const newAccessToken = data.access_token || data.data?.access_token
      const newRefreshToken = data.refresh_token || data.data?.refresh_token

      if (!newAccessToken) {
        console.error('No access token in refresh response')
        return null
      }

      this.setToken(newAccessToken)
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken)
      }

      return newAccessToken
    } catch (error) {
      console.error('Token refresh error:', error)
      return null
    }
  }

  private handleTokenExpiration(): void {
    console.log('Handling token expiration - clearing all auth data')
    this.clearToken()

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:token-expired'))
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    this.getCurrentToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this._token) {
      headers.Authorization = `Bearer ${this._token}`
    }

    try {
      console.log(`Making request to: ${url}`)
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })

      console.log(`Response status: ${response.status}`)

      // Try to parse response as JSON
      let data: any
      const contentType = response.headers.get('content-type')
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch (e) {
          console.error('Failed to parse JSON response:', e)
          data = { message: 'Invalid JSON response from server' }
        }
      } else {
        const text = await response.text()
        console.log('Non-JSON response:', text)
        data = { message: text || 'No response from server' }
      }

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          if (endpoint.includes('/auth/login') || 
              endpoint.includes('/auth/register') || 
              endpoint.includes('/auth/refresh')) {
            return {
              error: data.detail || data.message || 'Authentication failed',
              status: response.status,
            }
          }

          console.log('Token expired - attempting refresh')

          if (this._isRefreshing && this._refreshPromise) {
            console.log('Waiting for existing refresh to complete...')
            const newToken = await this._refreshPromise
            
            if (newToken) {
              console.log('Retrying request with refreshed token')
              return this.request(endpoint, options)
            } else {
              console.log('Refresh failed - clearing auth')
              this.handleTokenExpiration()
              return {
                error: 'Your session has expired. Please sign in again.',
                status: response.status,
              }
            }
          }

          if (this.getRefreshToken()) {
            this._isRefreshing = true
            this._refreshPromise = this.performTokenRefresh()

            try {
              const newToken = await this._refreshPromise
              
              if (newToken) {
                console.log('Token refreshed successfully, retrying original request')
                return this.request(endpoint, options)
              } else {
                console.log('Token refresh failed - clearing auth')
                this.handleTokenExpiration()
                return {
                  error: 'Your session has expired. Please sign in again.',
                  status: response.status,
                }
              }
            } finally {
              this._isRefreshing = false
              this._refreshPromise = null
            }
          } else {
            console.log('No refresh token available')
            this.handleTokenExpiration()
            return {
              error: 'Your session has expired. Please sign in again.',
              status: response.status,
            }
          }
        }

        // Handle 403 Forbidden
        if (response.status === 403) {
          return {
            error: 'You do not have permission to access this resource.',
            status: response.status,
          }
        }

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
      console.error('API Request network error:', error)
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return {
          error: 'Cannot connect to server. Please check your internet connection and try again.',
          status: 0,
        }
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          error: 'Request timeout. Please try again.',
          status: 0,
        }
      }
      
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<any>> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.data && !response.error) {
      const data = response.data as any
      const accessToken = data.access_token || data.data?.access_token
      const user = data.user || data.data?.user
      if (user && typeof window !== 'undefined') {
        localStorage.setItem('auth-user', JSON.stringify(user))
        window.dispatchEvent(new CustomEvent('auth:login-success', { detail: { user } }));
      }
      const refreshToken = data.refresh_token || data.data?.refresh_token

      if (accessToken) {
        this.setToken(accessToken)
      }
      if (refreshToken) {
        this.setRefreshToken(refreshToken)
      }
    }
    
    return response
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
    return response
  }

  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
    date_of_birth?: string;
    country?: string;
    id_number?: string;
    bio?: string;
  }): Promise<ApiResponse<any>> {
    console.log('Registering user with data:', { ...data, password: '[REDACTED]' })
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async manualRefresh(): Promise<boolean> {
    if (this._isRefreshing && this._refreshPromise) {
      const token = await this._refreshPromise
      return token !== null
    }

    this._isRefreshing = true
    this._refreshPromise = this.performTokenRefresh()

    try {
      const token = await this._refreshPromise
      return token !== null
    } finally {
      this._isRefreshing = false
      this._refreshPromise = null
    }
  }

  // Beneficiary methods
  async getBeneficiaries(): Promise<ApiResponse<any[]>> {
    return this.request('/beneficiaries')
  }

  async createBeneficiary(data: {
    name: string
    account_number: string
    bank_name: string
    bank_code?: string
    email?: string
    phone_number?: string
  }): Promise<ApiResponse<any>> {
    return this.request('/beneficiaries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateBeneficiary(id: string, data: {
    name?: string
    account_number?: string
    bank_name?: string
    bank_code?: string
    email?: string
    phone_number?: string
    is_active?: boolean
  }): Promise<ApiResponse<any>> {
    return this.request(`/beneficiaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteBeneficiary(id: string): Promise<ApiResponse<any>> {
    return this.request(`/beneficiaries/${id}`, {
      method: 'DELETE',
    })
  }

  // Transfer methods
  async createTransfer(data: {
    beneficiary_id: string
    amount: number
    currency: string
    description?: string
    pin: string
  }): Promise<ApiResponse<any>> {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getTransfers(params?: {
    limit?: number
    offset?: number
    start_date?: string
    end_date?: string
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams()
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.offset) queryParams.append('offset', params.offset.toString())
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const endpoint = `/transfers${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    return this.request(endpoint)
  }

  // Plaid methods
  async createPlaidLinkToken(requestData?: PlaidLinkTokenRequest): Promise<ApiResponse<PlaidLinkTokenResponse>> {
    return this.request('/plaid/link-token', {
      method: 'POST',
      body: JSON.stringify(requestData || {}),
    });
  }

  async exchangePlaidToken(requestData: PlaidExchangeTokenRequest): Promise<ApiResponse<PlaidExchangeTokenResponse>> {
    return this.request('/plaid/exchange-token', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getPlaidConnections(): Promise<ApiResponse<PlaidConnection[]>> {
    return this.request('/plaid/connections');
  }

  async getPlaidConnection(connectionId: string): Promise<ApiResponse<PlaidConnection>> {
    return this.request(`/plaid/connections/${connectionId}`);
  }

  async getPlaidAccounts(connectionId?: string): Promise<ApiResponse<PlaidAccount[]>> {
    const endpoint = connectionId 
      ? `/plaid/connections/${connectionId}/accounts` 
      : '/plaid/accounts';
    return this.request(endpoint);
  }

  async getPlaidTransactions(params?: {
    connection_id?: string;
    account_id?: string;
    start_date?: string;
    end_date?: string;
    account_ids?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<PlaidTransaction[]>> {
    const queryParams = new URLSearchParams();
    
    if (params?.connection_id) queryParams.append('connection_id', params.connection_id);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.account_ids) queryParams.append('account_ids', params.account_ids);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const endpoint = params?.connection_id
      ? `/plaid/connections/${params.connection_id}/transactions${queryString ? '?' + queryString : ''}`
      : `/plaid/transactions${queryString ? '?' + queryString : ''}`;
      
    return this.request(endpoint);
  }

  async syncPlaidConnection(connectionId: string, requestData?: PlaidSyncRequest): Promise<ApiResponse<PlaidSyncResponse>> {
    return this.request(`/plaid/connections/${connectionId}/sync`, {
      method: 'POST',
      body: JSON.stringify(requestData || {}),
    });
  }

  async disconnectPlaidConnection(connectionId: string): Promise<ApiResponse<any>> {
    return this.request(`/plaid/connections/${connectionId}`, {
      method: 'DELETE',
    });
  }

  async testPlaidConnection(): Promise<ApiResponse<any>> {
    return this.request('/plaid/test-connection');
  }

  async getPlaidWebhookStatus(): Promise<ApiResponse<any>> {
    return this.request('/plaid/webhook');
  }

  // Plaid Transfer methods
  async createPlaidTransferQuote(data: {
    source_account_id: string;
    beneficiary_id: string;
    amount: number;
    currency?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/plaid/transfers/quote', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async initiatePlaidTransfer(data: {
    quote_id: string;
    purpose: string;
    reference?: string;
    recipient_message?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/plaid/transfers/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPlaidTransferStatus(transferId: string): Promise<ApiResponse<any>> {
    return this.request(`/plaid/transfers/${transferId}/status`);
  }

  async getPlaidTransferHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/plaid/transfers/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(endpoint);
  }

  // Additional methods
  async getCards(): Promise<ApiResponse<any[]>> {
    return this.request('/cards');
  }

  async getPaymentMethods(params?: {
    payment_type?: string;
    status?: string;
    is_default?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (params?.payment_type) queryParams.append('payment_type', params.payment_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.is_default !== undefined) queryParams.append('is_default', params.is_default.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/payment-methods${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return this.request(endpoint);
  }

  async updatePaymentMethod(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getDashboard(): Promise<ApiResponse<any>> {
    return this.request('/dashboard');
  }

  async getNotificationSummary(): Promise<ApiResponse<any>> {
    return this.request('/notifications/summary');
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/users/profile');
  }

  async createPaymentMethod(data: {
    type: string;
    plaid_account_id?: string;
    card_holder_name?: string;
    card_number_masked?: string;
    expiry_month?: number;
    expiry_year?: number;
    card_type?: string;
    status?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createPlaidDebitCardLinkToken(): Promise<ApiResponse<PlaidLinkTokenResponse>> {
    return this.request('/plaid/debit-card/link-token', {
      method: 'POST',
    });
  }

  async verifyPlaidDebitCard(requestData: {
    public_token: string;
    account_id?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/plaid/debit-card/verify', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

// Plaid-specific types
export interface PlaidAccount {
  account_id: string;
  connection_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype?: string;
  mask?: string;
  balances: {
    available?: number;
    current: number;
    limit?: number;
    iso_currency_code?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface PlaidConnection {
  connection_id: string;
  user_id: string;
  item_id: string;
  institution_id?: string;
  institution_name?: string;
  status: string;
  created_at: string;
  last_synced_at?: string;
  error_message?: string;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  connection_id: string;
  amount: number;
  iso_currency_code?: string;
  date: string;
  name: string;
  merchant_name?: string;
  pending: boolean;
  category?: string[];
  created_at: string;
  updated_at: string;
}

export interface PlaidLinkTokenRequest {
  client_name?: string;
  products?: string[];
  country_codes?: string[];
  language?: string;
  webhook_url?: string;
}

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
  link_token_id?: string;
  request_id?: string;
}

export interface PlaidExchangeTokenRequest {
  public_token: string;
  link_token_id?: string;
  account_id?: string;
}

export interface PlaidExchangeTokenResponse {
  connection_id: string;
  access_token: string;
  item_id: string;
}

export interface PlaidSyncRequest {
  connection_id?: string;
}

export interface PlaidSyncResponse {
  connection_id: string;
  accounts_synced: number;
  transactions_synced: number;
  last_synced_at: string;
}

const apiClient = new ApiClient(process.env.NEXT_PUBLIC_API_URL || 'https://hoardrun-backend-py-1.onrender.com/api/v1')

export { apiClient, ApiClient }
export type { ApiResponse }