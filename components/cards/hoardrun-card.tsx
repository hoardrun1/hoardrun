"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { apiClient, type IssuedCard } from "@/lib/api-client"

const STRIPE_JS = "https://js.stripe.com/v3/"
const usd = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

/** Get a virtual Hoardrun card: a US billing address the first time, and the card terms. */
export function GetHoardrunCardDialog({ open, onOpenChange, needsAddress, monthlyLimit, onCreated }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  needsAddress: boolean
  monthlyLimit: number
  onCreated: (card: IssuedCard) => void
}) {
  const { toast } = useToast()
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", postal_code: "" })
  const [agreed, setAgreed] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setAgreed(false)
  }, [open])

  const set = (key: keyof typeof address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((a) => ({ ...a, [key]: key === "state" ? e.target.value.toUpperCase().slice(0, 2) : e.target.value }))
  const addressOk = !needsAddress || (address.line1.trim().length > 2 && address.city.trim().length > 1 && /^[A-Z]{2}$/.test(address.state) && /^\d{5}(-\d{4})?$/.test(address.postal_code))

  const submit = async () => {
    if (!agreed || !addressOk || saving) return
    setSaving(true)
    const response = await apiClient.createIssuedCard({
      accept_terms: true,
      billing: needsAddress ? { ...address, line2: address.line2 || undefined } : undefined,
    })
    setSaving(false)
    if (response.error || !response.data) {
      toast({ title: "Couldn't get a card", description: response.error || "Please try again.", variant: "destructive" })
      return
    }
    toast({ title: "Your Hoardrun card is ready", description: `Virtual Visa ending ${response.data.last4}. It spends from your Hoardrun cash.` })
    onCreated(response.data)
    onOpenChange(false)
  }

  const field = "h-11 w-full rounded-xl border border-white/10 bg-[#141416] px-3.5 text-[15px] text-white outline-none placeholder:text-[#5c5c62] focus:border-[#5aa9ff]/60"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="hr-topup max-h-[92dvh] overflow-y-auto sm:max-w-[440px]">
        <DialogTitle className="hr-title !text-[28px]">Get a Hoardrun card</DialogTitle>
        <DialogDescription className="text-[14px] text-[#a1a1a6]">
          A virtual Visa for shopping online. It spends straight from your Hoardrun cash, up to {usd(monthlyLimit)} a month. No fees.
        </DialogDescription>

        {needsAddress && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <p className="col-span-2 text-[13px] font-medium text-[#a1a1a6]">US billing address</p>
            <input aria-label="Street address" placeholder="Street address" value={address.line1} onChange={set("line1")} autoComplete="address-line1" className={`${field} col-span-2`} />
            <input aria-label="Apartment or suite (optional)" placeholder="Apt, suite (optional)" value={address.line2} onChange={set("line2")} autoComplete="address-line2" className={`${field} col-span-2`} />
            <input aria-label="City" placeholder="City" value={address.city} onChange={set("city")} autoComplete="address-level2" className={`${field} col-span-2`} />
            <input aria-label="State" placeholder="State (CA)" value={address.state} onChange={set("state")} autoComplete="address-level1" className={field} />
            <input aria-label="ZIP code" placeholder="ZIP" inputMode="numeric" value={address.postal_code} onChange={set("postal_code")} autoComplete="postal-code" className={field} />
          </div>
        )}

        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#18181b] p-3.5 text-[13px] leading-snug text-[#c7c7cc]">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2f6bff]" />
          <span>
            I agree to the <Link href="/terms" className="text-[#5aa9ff] underline underline-offset-2">Hoardrun Card terms</Link> and that Hoardrun shares my name and address with the card issuer.
          </span>
        </label>

        <button type="button" onClick={submit} disabled={!agreed || !addressOk || saving} className="hr-topup-continue hr-focus mt-4">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Get my card
        </button>
      </DialogContent>
    </Dialog>
  )
}

declare global {
  interface Window { Stripe?: (key: string) => any }
}

function loadStripe(): Promise<void> {
  if (window.Stripe) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${STRIPE_JS}"]`)
    const script = existing ?? Object.assign(document.createElement("script"), { src: STRIPE_JS, async: true })
    script.addEventListener("load", () => resolve())
    script.addEventListener("error", () => reject(new Error("Couldn't load Stripe")))
    if (!existing) document.head.appendChild(script)
  })
}

/**
 * The full number, expiry and CVC, drawn by Stripe inside its own frames. Hoardrun's code and
 * server never see them: the server only makes a short-lived key for this card.
 */
export function HoardrunCardDetailsDialog({ card, publishableKey, onOpenChange }: {
  card: IssuedCard | null
  publishableKey: string | null
  onOpenChange: (open: boolean) => void
}) {
  const number = useRef<HTMLDivElement>(null)
  const expiry = useRef<HTMLDivElement>(null)
  const cvc = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!card) return
    let cancelled = false
    const mounted: any[] = []
    setState("loading")
    ;(async () => {
      try {
        if (!publishableKey) throw new Error("Card details aren't available yet.")
        await loadStripe()
        const stripe = window.Stripe!(publishableKey)
        const { nonce, error } = await stripe.createEphemeralKeyNonce({ issuingCard: card.stripe_card_id })
        if (error || !nonce) throw new Error("Couldn't open your card details. Try again.")
        const key = await apiClient.issuedCardEphemeralKey(card.id, nonce)
        if (key.error || !key.data) throw new Error(key.error || "Couldn't open your card details. Try again.")
        if (cancelled) return
        const elements = stripe.elements()
        const options = {
          issuingCard: card.stripe_card_id, nonce, ephemeralKeySecret: key.data.secret,
          style: { base: { color: "#ffffff", fontSize: "18px", fontFamily: "ui-monospace, Menlo, Consolas, monospace", letterSpacing: "0.08em" } },
        }
        for (const [type, ref] of [["issuingCardNumberDisplay", number], ["issuingCardExpiryDisplay", expiry], ["issuingCardCvcDisplay", cvc]] as const) {
          const element = elements.create(type, options)
          element.mount(ref.current)
          mounted.push(element)
        }
        setState("ready")
      } catch (err) {
        if (!cancelled) {
          setMessage(err instanceof Error ? err.message : "Couldn't open your card details.")
          setState("error")
        }
      }
    })()
    return () => {
      cancelled = true
      mounted.forEach((element) => element.destroy?.())
    }
  }, [card, publishableKey])

  return (
    <Dialog open={!!card} onOpenChange={onOpenChange}>
      <DialogContent className="hr-topup sm:max-w-[440px]">
        <DialogTitle className="hr-title !text-[28px]">Card details</DialogTitle>
        <DialogDescription className="text-[14px] text-[#a1a1a6]">
          Only you can see these. Shown securely by Stripe, never stored by Hoardrun.
        </DialogDescription>
        <div className="mt-2 space-y-3 rounded-2xl bg-[#18181b] p-4" aria-busy={state === "loading"}>
          {state === "error" ? (
            <p className="text-[14px] text-[#fb7185]">{message}</p>
          ) : (
            <>
              <div>
                <p className="text-[12px] text-[#8e8e93]">Card number</p>
                <div ref={number} className="mt-1 min-h-[26px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[12px] text-[#8e8e93]">Expires</p><div ref={expiry} className="mt-1 min-h-[26px]" /></div>
                <div><p className="text-[12px] text-[#8e8e93]">CVC</p><div ref={cvc} className="mt-1 min-h-[26px]" /></div>
              </div>
              {state === "loading" && <p className="flex items-center gap-2 text-[13px] text-[#8e8e93]"><Loader2 className="h-3.5 w-3.5 animate-spin" />Opening securely…</p>}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
