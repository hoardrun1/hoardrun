const DEFAULT_API_URL = 'https://hoardrun-backend-py-1.onrender.com/api/v1'

/** Backend base URL ending in /api/v1, whether or not NEXT_PUBLIC_API_URL includes it. */
export const API_BASE_URL = `${(process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL)
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '')}/api/v1`
