import type { Metadata } from 'next'
// Temporarily commented out due to network issues during build
// import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '../components/client-auth-provider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { FinanceProvider } from '@/contexts/FinanceContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { FloatingNotificationBell } from '@/components/ui/floating-notification-bell'

// const inter = Inter({ subsets: ['latin'] })

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
      <body className="font-sans">
        {/* Using AWS Cognito authentication instead of NextAuth */}
        <ClientAuthProvider>
          <FinanceProvider>
            <NavigationProvider>
              <NotificationProvider>
                {children}
                <FloatingNotificationBell />
              </NotificationProvider>
            </NavigationProvider>
          </FinanceProvider>
        </ClientAuthProvider>
      </body>
    </html>
  )
}
