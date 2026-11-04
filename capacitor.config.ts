import type { CapacitorConfig } from '@capacitor/cli'

/**
 * The Hoardrun iPhone and Android apps (see hoardrun-backend-py/docs/mobile-apps.md).
 *
 * The apps load the live web app from HOARDRUN_APP_URL. The web app renders on the server, so it
 * can't be bundled, and web releases reach the apps without a store review. mobile/www holds only
 * the screen shown when the phone is offline.
 *
 * For a phone or emulator on your own network, point it at your computer:
 *   HOARDRUN_APP_URL=http://10.0.2.2:3000 npm run mobile:sync -- android   (Android emulator)
 */
const appUrl = (process.env.HOARDRUN_APP_URL || 'https://hoardrun.com').replace(/\/+$/, '')
const plainHttp = appUrl.startsWith('http://')

const config: CapacitorConfig = {
  appId: 'com.hoardrun.app',
  appName: 'Hoardrun',
  webDir: 'mobile/www',
  backgroundColor: '#000000',
  server: {
    url: appUrl,
    // Plain http only for a development server on your own machine
    cleartext: plainHttp,
    androidScheme: 'https',
    errorPath: 'offline.html',
    // Pages that open inside the app. Anything else (including Google sign-in) opens in the phone's browser.
    allowNavigation: [
      new URL(appUrl).host,
      'checkout.stripe.com',
      '*.withpersona.com',
      'withpersona.com',
    ],
  },
  ios: {
    contentInset: 'never',
    limitsNavigationsToAppBoundDomains: false,
    scheme: 'Hoardrun',
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: plainHttp,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: false,
      backgroundColor: '#000000',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
      overlaysWebView: false,
    },
  },
}

export default config
