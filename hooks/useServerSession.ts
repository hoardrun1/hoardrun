import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AuthOptions } from 'next-auth'

export const useServerSession = async () => {
  const session = await getServerSession(authOptions as AuthOptions)
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  
  return session
}