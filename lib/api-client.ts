import axios from 'axios';
// import { AppError, ErrorCode } from './error-handling';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error response type
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    data?: any;
  };
}

// Add request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data?.error;
    
    // Ensure we have proper error data
    const errorMessage = errorData?.message || 'An unexpected error occurred';
    const status = error.response?.status || 500;

    // Throw simple error
    const err = new Error(errorMessage);
    (err as any).status = status;
    throw err;
  }
)

// Auth API
export const auth = {
  signup: (data: SignupData) => api.post('/auth/signup', data),
  signin: (data: SigninData) => api.post('/auth/signin', data),
  verifyEmail: (data: VerifyEmailData) => api.post('/auth/verify-email', data),
  verifySignin: (data: VerifySigninData) => api.post('/auth/verify-signin', data),
  verifyFace: (data: VerifyFaceData) => api.post('/auth/verify-face', data),
  forgotPassword: (data: ForgotPasswordData) => api.post('/auth/forgot-password', data),
  resetPassword: (data: ResetPasswordData) => api.post('/auth/reset-password', data),
}

// User API
export const user = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: UpdateProfileData) => api.put('/user/profile', data),
  getBalance: () => api.get('/user/balance'),
  deposit: (data: DepositData) => api.post('/user/deposit', data),
}

// Transaction API
export const transactions = {
  getAll: (params?: TransactionParams) => api.get('/transactions', { params }),
  send: (data: SendMoneyData) => api.post('/transactions/send', data),
  receive: (data: ReceiveMoneyData) => api.post('/transactions/receive', data),
  getStats: () => api.get('/transactions/stats'),
}

// Investment API
export const investments = {
  getAll: (params?: InvestmentParams) => api.get('/investments', { params }),
  create: (data: CreateInvestmentData) => api.post('/investments', data),
  getStats: () => api.get('/investments/stats'),
  getRecommendations: () => api.get('/investments/recommendations'),
}

// Card API
export const cards = {
  getAll: () => api.get('/cards'),
  create: (data: CreateCardData) => api.post('/cards', data),
  update: (id: string, data: UpdateCardData) => api.put(`/cards/${id}`, data),
  delete: (id: string) => api.delete(`/cards/${id}`),
  lock: (id: string) => api.post(`/cards/${id}/lock`),
  unlock: (id: string) => api.post(`/cards/${id}/unlock`),
}

// Types
interface SignupData {
  name: string
  email: string
  password: string
}

interface SigninData {
  email: string
  password: string
}

interface VerifyEmailData {
  code: string
  userId: string
}

interface VerifySigninData {
  code: string
  userId: string
}

interface VerifyFaceData {
  image: string
  userId: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  token: string
  password: string
}

interface UpdateProfileData {
  name?: string
  email?: string
  password?: string
}

interface DepositData {
  amount: number
}

interface TransactionParams {
  page?: number
  limit?: number
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface SendMoneyData {
  amount: number
  beneficiaryId: string
  description?: string
}

interface ReceiveMoneyData {
  amount: number
  description?: string
}

interface InvestmentParams {
  page?: number
  limit?: number
  type?: string
  status?: string
}

interface CreateInvestmentData {
  type: string
  amount: number
  description?: string
}

interface CreateCardData {
  type: string
  name: string
}

interface UpdateCardData {
  name?: string
  isActive?: boolean
  limit?: number
}

export { api };
