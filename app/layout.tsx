import type { Metadata, Viewport } from 'next'
// Temporarily commented out due to network issues during build
// import { Inter } from 'next/font/google'
import './globals.css'
import ClientAuthProvider from '../components/client-auth-provider'
import { ConditionalProviders } from '@/components/providers/conditional-providers'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { I18nProvider } from '@/components/i18n-provider'
import { FloatingLanguageSwitcher } from '@/components/ui/floating-language-switcher'
import { NativeShell } from '@/components/native/native-shell'


// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hoardrun - Smart Financial Management',
  description: 'Save, spend, send and invest in one app with AI-powered insights',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/hoardrun-logo.png', sizes: 'any' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/hoardrun-logo.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hoardrun'
  },
  formatDetection: {
    telephone: false
  }
}

// Edge to edge on phones (the notch and home bar are handled with safe-area insets). People can
// zoom on the web; the iPhone and Android apps turn zoom off (native-shell.tsx), like other apps.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

/**
 * Runs before the page paints, so nothing jumps: tags <html> with where Hoardrun is running.
 *   data-platform: ios | android (the Hoardrun phone apps) or web
 *   data-os:       ios | android | other (the device, also in a browser)
 *   data-display:  standalone (installed to the home screen, or the phone apps) or browser
 */
const PLATFORM_SCRIPT = `(function(){try{
var d=document.documentElement,ua=navigator.userAgent||'',cap=window.Capacitor;
var native=!!(cap&&cap.isNativePlatform&&cap.isNativePlatform());
var ios=/iPad|iPhone|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var os=ios?'ios':/Android/i.test(ua)?'android':'other';
d.dataset.os=os;
d.dataset.platform=native?(cap.getPlatform()==='ios'?'ios':'android'):'web';
d.dataset.display=native||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone?'standalone':'browser';
}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PLATFORM_SCRIPT }} />
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
                    document.documentElement.classList.add('bg-background');
                    var metaTheme = document.querySelector('meta[name="theme-color"]');
                    if (metaTheme) metaTheme.setAttribute('content', '#000000');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('bg-background');
                    var metaTheme = document.querySelector('meta[name="theme-color"]');
                    if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
                  }
                } catch (e) {
                  // Fallback to light theme
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('bg-background');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased overflow-x-hidden bg-background text-foreground transition-colors duration-300" suppressHydrationWarning>
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
        {/* iPhone and Android apps only: app lock, back button, return from Google */}
        <NativeShell />
      </body>
    </html>
  )
}
