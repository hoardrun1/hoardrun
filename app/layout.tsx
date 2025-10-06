import type { Metadata } from 'next'
// Temporarily commented out due to network issues during build
// import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '../components/client-auth-provider'
import { ConditionalProviders } from '@/components/providers/conditional-providers'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/components/i18n-provider'
import { FloatingLanguageSwitcher } from '@/components/ui/floating-language-switcher'


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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var shouldBeDark = theme === 'dark' || (!theme && prefersDark);
                  
                  // Set initial theme class on html element
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.className = 'dark bg-background';
                    var metaTheme = document.querySelector('meta[name="theme-color"]');
                    if (metaTheme) metaTheme.setAttribute('content', '#000000');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.className = 'bg-background';
                    var metaTheme = document.querySelector('meta[name="theme-color"]');
                    if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
                  }
                } catch (e) {
                  // Fallback to light theme
                  document.documentElement.classList.remove('dark');
                  document.documentElement.className = 'bg-background';
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased overflow-x-hidden safe-area-inset-top safe-area-inset-bottom bg-background text-foreground transition-colors duration-300" suppressHydrationWarning>
        {/* Using AWS Cognito authentication instead of NextAuth */}

        <I18nProvider>
          <ThemeProvider>
          <ClientAuthProvider>
            <ConditionalProviders>
              <div className="min-h-screen-mobile bg-background text-foreground transition-colors duration-300">
                {children}
              </div>
            </ConditionalProviders>
          </ClientAuthProvider>
        </ThemeProvider>
        </I18nProvider>
        <FloatingLanguageSwitcher />
      </body>
    </html>
  )
}
