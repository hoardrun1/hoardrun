import type { Metadata } from 'next'
// Temporarily commented out due to network issues during build
// import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '../components/client-auth-provider'
import { NavigationProvider } from '@/providers/NavigationProvider'
import { FinanceProvider } from '@/contexts/FinanceContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { FloatingNotificationBell } from '@/components/ui/floating-notification-bell'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hoardrun',
  description: 'Your digital banking solution',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#000000',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        {/* Using AWS Cognito authentication instead of NextAuth */}
        <ThemeProvider>
          <ClientAuthProvider>
            <FinanceProvider>
              <NavigationProvider>
                <NotificationProvider>
                  <div className="min-h-screen bg-background">
                    {children}
                    <FloatingNotificationBell />
                  </div>
                </NotificationProvider>
              </NavigationProvider>
            </FinanceProvider>
          </ClientAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
