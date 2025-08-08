import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { AuthOptions } from 'next-auth'

export const useServerSession = async () => {
  const session = await getServerSession(authOptions as AuthOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  
  return session
}