import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '../components/client-auth-provider'
import { NavigationProvider } from '@/providers/NavigationProvider'

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
        <ClientAuthProvider>
          <NavigationProvider>
            {children}
          </NavigationProvider>
        </ClientAuthProvider>
      </body>
    </html>
  )
} 