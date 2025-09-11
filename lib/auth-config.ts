import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { AuthOptions } from 'next-auth'
import { apiClient } from './api-client'

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password')
        }

        try {
          // Use the backend API for authentication
          const response = await apiClient.login(credentials.email, credentials.password)

          if (response.data && response.status === 200) {
            // Extract user data from the response
            const userData = response.data.user || response.data
            return {
              id: userData.id || userData.user_id || 'temp-id',
              email: userData.email || credentials.email,
              name: userData.name || userData.first_name || credentials.email,
            }
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Invalid credentials')
        }

        return null
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  pages: {
    signIn: '/signin',
    signOut: '/',
    error: '/signin', // Error code passed in query string as ?error=
    verifyRequest: '/verify-email',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export as authOptions for compatibility
export const authOptions = authConfig;
