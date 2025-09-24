import type { Metadata } from 'next'
// Temporarily commented out due to network issues during build
// import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '../components/client-auth-provider'
import { ConditionalProviders } from '@/components/providers/conditional-providers'
import { ThemeProvider } from '@/contexts/ThemeContext'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hoardrun',
  description: 'Your digital banking solution - Mobile-first digital banking',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Hoardrun'
  },
  formatDetection: {
    telephone: false
  }
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
      <body className="font-sans antialiased overflow-x-hidden safe-area-inset-top safe-area-inset-bottom">
        {/* Using AWS Cognito authentication instead of NextAuth */}
        <ThemeProvider>
          <ClientAuthProvider>
            <ConditionalProviders>
              <div className="min-h-screen-mobile bg-background">
                {children}
              </div>
            </ConditionalProviders>
          </ClientAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
