'use client'

/**
 * Only active inside the iPhone and Android apps (renders nothing on the website):
 * - status bar and splash screen
 * - Android's back button
 * - coming back from Google sign-in through a hoardrun:// link
 * - the app lock: Face ID, fingerprint or the phone's passcode when Hoardrun opens, and again
 *   after it has been in the background for a minute
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'
import { Fingerprint } from 'lucide-react'
import { closeOutside, isNativeApp, nativePlatform } from '@/lib/native'

const LOCK_PREF_KEY = 'hr_app_lock'
const LOCK_AFTER_MS = 60 * 1000

function signedIn(): boolean {
  try {
    return Boolean(localStorage.getItem('access_token'))
  } catch {
    return false
  }
}

function lockWanted(): boolean {
  try {
    return localStorage.getItem(LOCK_PREF_KEY) !== 'off'
  } catch {
    return true
  }
}

/** Whether this phone can lock the app: biometrics, or at least a passcode. */
async function lockAvailable(): Promise<{ available: boolean; label: string }> {
  try {
    const { BiometricAuth, BiometryType } = await import('@aparajita/capacitor-biometric-auth')
    const check = await BiometricAuth.checkBiometry()
    const label =
      check.biometryType === BiometryType.faceId ? 'Face ID'
        : check.biometryType === BiometryType.touchId ? 'Touch ID'
          : check.biometryType === BiometryType.none ? 'your passcode'
            : 'fingerprint or face unlock'
    return { available: check.isAvailable || check.deviceIsSecure, label }
  } catch {
    return { available: false, label: '' }
  }
}

async function unlockWithDevice(): Promise<boolean> {
  try {
    const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth')
    await BiometricAuth.authenticate({
      reason: 'Unlock Hoardrun',
      cancelTitle: 'Cancel',
      allowDeviceCredential: true,
      androidTitle: 'Unlock Hoardrun',
      androidConfirmationRequired: false,
    })
    return true
  } catch {
    return false
  }
}

export function NativeShell() {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [locked, setLocked] = useState(false)
  const leftAt = useRef<number | null>(null)
  const unlocking = useRef(false)

  const unlock = useCallback(async () => {
    if (unlocking.current) return
    unlocking.current = true
    const ok = await unlockWithDevice()
    unlocking.current = false
    if (ok) setLocked(false)
  }, [])

  const lockIfNeeded = useCallback(async () => {
    if (!signedIn() || !lockWanted()) return
    if (!(await lockAvailable()).available) return
    setLocked(true)
    void unlock()
  }, [unlock])

  useEffect(() => {
    if (!isNativeApp()) return
    setActive(true)
    document.documentElement.dataset.nativeApp = 'true'
    document.documentElement.dataset.platform = nativePlatform()
    document.documentElement.dataset.display = 'standalone'
    // Apps don't pinch-zoom their whole screen; the website still can
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    viewportMeta?.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
    const removers: Array<() => void> = []

    ;(async () => {
      const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
        import('@capacitor/app'),
        import('@capacitor/status-bar'),
        import('@capacitor/splash-screen'),
      ])
      StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined)
      SplashScreen.hide().catch(() => undefined)

      // Opening the app counts as coming back
      void lockIfNeeded()

      const urlOpen = await App.addListener('appUrlOpen', ({ url }) => {
        let link: URL
        try {
          link = new URL(url)
        } catch {
          return
        }
        // hoardrun://auth/google/callback?code=…&state=… from the phone's browser
        // hoardrun://auth/apple/callback?ticket=… likewise for Sign in with Apple
        if (link.protocol === 'hoardrun:' && link.host === 'auth' &&
            (link.pathname === '/google/callback' || link.pathname === '/apple/callback')) {
          void closeOutside()
          router.replace(`/auth${link.pathname}${link.search}`)
        }
      })
      const back = await App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) window.history.back()
        else App.minimizeApp().catch(() => undefined)
      })
      const state = await App.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) {
          leftAt.current = Date.now()
          return
        }
        const away = leftAt.current ? Date.now() - leftAt.current : 0
        leftAt.current = null
        if (away >= LOCK_AFTER_MS) void lockIfNeeded()
      })
      removers.push(() => urlOpen.remove(), () => back.remove(), () => state.remove())
    })()

    return () => removers.forEach(remove => remove())
  }, [router, lockIfNeeded])

  if (!active || !locked) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hoardrun is locked"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-black px-6 text-center text-white"
    >
      <Image src="/hoardrun-logo.png" alt="" width={72} height={72} priority />
      <div>
        <h1 className="text-[22px] font-semibold">Hoardrun is locked</h1>
        <p className="mt-2 text-[15px] text-[#a1a1a6]">Unlock to see your money.</p>
      </div>
      <button
        type="button"
        onClick={() => void unlock()}
        className="flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#2f6bff] font-semibold"
      >
        <Fingerprint className="h-5 w-5" />
        Unlock
      </button>
    </div>
  )
}

/** Settings row, shown only in the app: turn the app lock on or off. */
export function AppLockSetting({ className = '' }: { className?: string }) {
  const [shown, setShown] = useState(false)
  const [label, setLabel] = useState('')
  const [on, setOn] = useState(true)

  useEffect(() => {
    if (!isNativeApp()) return
    lockAvailable().then(({ available, label }) => {
      setShown(available)
      setLabel(label)
      setOn(lockWanted())
    })
  }, [])

  if (!shown) return null

  const change = async (next: boolean) => {
    // Turning the lock off needs the same check as unlocking
    if (!next && !(await unlockWithDevice())) return
    try {
      localStorage.setItem(LOCK_PREF_KEY, next ? 'on' : 'off')
    } catch {
      return
    }
    setOn(next)
  }

  return (
    <div className={`flex items-center justify-between gap-4 p-4 sm:p-6 hr-settings-row ${className}`}>
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
        <div className="hr-settings-row-icon">
          <Fingerprint className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div>
          <p className="font-semibold text-base sm:text-lg">App lock</p>
          <p className="text-sm text-[#a1a1a6] mt-1">Ask for {label} when Hoardrun opens</p>
        </div>
      </div>
      <Switch checked={on} onCheckedChange={value => void change(value)} aria-label="App lock" />
    </div>
  )
}
