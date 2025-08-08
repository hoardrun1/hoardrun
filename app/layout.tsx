import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '../components/client-auth-provider'
import NextAuthProvider from '../components/next-auth-provider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { FinanceProvider } from '@/contexts/FinanceContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hoardrun',
  description: 'Your digital banking solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ClientAuthProvider>
            <FinanceProvider>
              <NavigationProvider>
                {children}
              </NavigationProvider>
            </FinanceProvider>
          </ClientAuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}