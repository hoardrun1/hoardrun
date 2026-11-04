'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'

/** Closing is permanent, so it asks for the password and a typed CLOSE, and says first what happens. */
export function CloseAccountDialog({ open, onOpenChange, onExport }: { open: boolean; onOpenChange: (open: boolean) => void; onExport: () => void }) {
  const router = useRouter()
  const { toast } = useToast()
  const { signOut } = useAuth()
  const [blockers, setBlockers] = useState<string[] | null>(null)
  const [password, setPassword] = useState('')
  const [typed, setTyped] = useState('')
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setPassword('')
    setTyped('')
    setError(null)
    setBlockers(null)
    apiClient.getCloseAccountCheck().then((response) => setBlockers(response.data?.blockers ?? []))
  }, [open])

  const ready = blockers !== null && blockers.length === 0 && password.length > 0 && typed === 'CLOSE' && !closing

  const close = async () => {
    if (!ready) return
    setClosing(true)
    setError(null)
    const response = await apiClient.closeAccount(password)
    if (response.error) {
      setClosing(false)
      setError(response.error)
      return
    }
    toast({ title: 'Your account is closed', description: 'Thank you for using Hoardrun.' })
    await signOut()
    router.replace('/')
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !closing && onOpenChange(next)}>
      <DialogContent className="hr-topup max-h-[92dvh] overflow-y-auto sm:max-w-[460px]">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(251_113_133/0.16)] text-[#fb7185]">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <DialogTitle className="hr-title text-center !text-[26px]">Close your account</DialogTitle>
        <DialogDescription className="text-center text-[14px] text-[#a1a1a6]">This can't be undone.</DialogDescription>

        <ul className="space-y-2 rounded-2xl bg-[#141416] p-4 text-[13.5px] text-[#d1d1d6]">
          <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 flex-none text-[#fb7185]" />You won't be able to sign in again.</li>
          <li className="flex gap-2"><X className="mt-0.5 h-4 w-4 flex-none text-[#fb7185]" />Your name, phone, cards, budgets, goals and alerts are removed.</li>
          <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-[#8e8e93]" />Transaction records are kept for 5 years, as US financial law requires.</li>
        </ul>

        <button type="button" onClick={onExport} className="text-[13.5px] text-[#5aa9ff] hover:underline">
          Download your data first
        </button>

        {blockers === null ? (
          <div className="flex justify-center py-3"><Loader2 className="h-5 w-5 animate-spin text-[#8e8e93]" /></div>
        ) : blockers.length > 0 ? (
          <div className="rounded-2xl border border-[rgb(251_191_36/0.35)] bg-[rgb(251_191_36/0.1)] p-4 text-[13.5px] text-[#fde68a]">
            <p className="font-medium text-white">Before you can close</p>
            <p className="mt-1">Your account still holds:</p>
            <ul className="mt-1 list-disc pl-5">{blockers.map((b) => <li key={b}>{b}</li>)}</ul>
            <p className="mt-2 text-[#d1d1d6]">Move or close these first. For help, contact support.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[13px] text-[#a1a1a6]">Your password</span>
              <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-2xl bg-[#1c1c1f] px-4 text-[16px] text-white outline-none focus:ring-2 focus:ring-[#fb7185]/60" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] text-[#a1a1a6]">Type <span className="font-semibold text-white">CLOSE</span> to confirm</span>
              <input value={typed} onChange={(e) => setTyped(e.target.value.toUpperCase())} autoCapitalize="characters" autoComplete="off"
                className="h-12 w-full rounded-2xl bg-[#1c1c1f] px-4 text-[16px] tracking-widest text-white outline-none focus:ring-2 focus:ring-[#fb7185]/60" />
            </label>
            {error && <p role="alert" className="text-[13px] text-[#fb7185]">{error}</p>}
          </div>
        )}

        <button type="button" onClick={close} disabled={!ready}
          className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#e11d48] text-[15px] font-semibold text-white transition-opacity disabled:opacity-35">
          {closing && <Loader2 className="h-4 w-4 animate-spin" />}Close my account
        </button>
        <button type="button" onClick={() => onOpenChange(false)} disabled={closing} className="text-[14px] text-[#a1a1a6] hover:text-white">
          Keep my account
        </button>
      </DialogContent>
    </Dialog>
  )
}
