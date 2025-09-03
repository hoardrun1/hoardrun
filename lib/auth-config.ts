import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { AuthOptions } from 'next-auth'

// Mock user for development
const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  password: '$2a$10$8VEZeIRjuUDQPRGiHv0Kv.Zr3jXHQNRPDxjUdyLh1Vr8HMJvQX9Vy', // hashed 'password123'
}

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

        // In development, use mock user
        if (process.env.NODE_ENV === 'development') {
          // Check if credentials match mock user
          if (credentials.email === mockUser.email) {
            const passwordMatch = await bcrypt.compare(credentials.password, mockUser.password);

            if (passwordMatch) {
              return {
                id: mockUser.id,
                email: mockUser.email,
                name: mockUser.name,
              };
            }
            throw new Error('Incorrect password');
          }
          throw new Error('No user found with this email');
        }

        // For now, just allow any login in development
        return {
          id: 'user-1',
          email: credentials.email,
          name: 'Test User',
        };
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
