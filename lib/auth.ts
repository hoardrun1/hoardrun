import { getServerSession } from 'next-auth/next'
import { AuthOptions } from 'next-auth'
import { authOptions as baseAuthOptions } from '@/app/api/auth/[...nextauth]/route'

export const getTypedSession = async () => {
  return getServerSession(baseAuthOptions as AuthOptions)
}

export function generateTwoFactorCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export { authOptions } from '@/app/api/auth/[...nextauth]/route'

