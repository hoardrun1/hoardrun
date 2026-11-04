'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { apiClient, type BrokerageStatus } from '@/lib/api-client'

const DISCLOSURES = [
  ['is_control_person', 'I’m a director, officer or 10% shareholder of a public company'],
  ['is_affiliated_exchange_or_finra', 'I work for a stock exchange, FINRA or a brokerage'],
  ['is_politically_exposed', 'I hold, or have held, a senior political office'],
  ['immediate_family_exposed', 'A close family member is any of the above'],
] as const

/**
 * Opening an investing account at Alpaca, Hoardrun's broker. What US law asks a broker to collect;
 * the SSN goes to Alpaca and isn't kept by Hoardrun.
 */
export function OpenInvestingAccount({ status, onChanged }: { status: BrokerageStatus; onChanged: () => void }) {
  const { addToast } = useToast()
  const [form, setForm] = useState({ dob: '', ssn: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', employment: 'employed' })
  const [disclosures, setDisclosures] = useState<Record<string, boolean>>({})
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)

  if (status.state === 'pending') {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-snug text-[#a1a1a6]">
        Your investing account is being approved by our broker, Alpaca. This usually takes a few minutes, sometimes a day. We&apos;ll email you when you can trade.
      </p>
    )
  }
  if (status.state === 'rejected' || status.state === 'action_required') {
    return (
      <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-snug text-[#a1a1a6]">
        Our broker needs more information before your account can open. <Link href="/help" className="text-[#5aa9ff] underline underline-offset-2">Contact support</Link> and we&apos;ll sort it out.
      </p>
    )
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = key === 'state' ? e.target.value.toUpperCase().slice(0, 2) : key === 'ssn' ? e.target.value.replace(/[^\d-]/g, '').slice(0, 11) : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }
  const ready = agreed && form.dob && form.ssn.replace(/\D/g, '').length === 9 && form.phone.replace(/\D/g, '').length >= 10 &&
    form.line1.trim().length > 2 && form.city.trim().length > 1 && /^[A-Z]{2}$/.test(form.state) && /^\d{5}(-\d{4})?$/.test(form.zip)

  const submit = async () => {
    if (!ready || busy) return
    setBusy(true)
    const response = await apiClient.openBrokerage({
      date_of_birth: form.dob, ssn: form.ssn, phone: form.phone, employment_status: form.employment as any,
      address: { line1: form.line1, line2: form.line2 || undefined, city: form.city, state: form.state, postal_code: form.zip },
      disclosures, accept_agreements: true,
    })
    setBusy(false)
    if (response.error) {
      addToast({ title: "Couldn't open the account", description: response.error, variant: 'destructive' })
      return
    }
    // Don't keep the SSN on screen
    setForm((f) => ({ ...f, ssn: '' }))
    addToast({ title: 'Application sent', description: "We'll email you when your investing account is open." })
    onChanged()
  }

  const field = 'hr-field !h-11'
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div>
        <p className="text-[15px] font-medium">Open your investing account</p>
        <p className="mt-1 text-[12.5px] leading-snug text-[#a1a1a6]">
          Investments are held at Alpaca, a FINRA-registered broker, in an account in your name. US law asks for these details.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-1 text-[12px] text-[#8e8e93]">Date of birth<input type="date" value={form.dob} onChange={set('dob')} className={`${field} mt-1`} /></label>
        <label className="col-span-1 text-[12px] text-[#8e8e93]">SSN<input inputMode="numeric" autoComplete="off" placeholder="123-45-6789" value={form.ssn} onChange={set('ssn')} className={`${field} mt-1`} /></label>
        <label className="col-span-2 text-[12px] text-[#8e8e93]">Phone<input type="tel" autoComplete="tel" placeholder="+1 415 555 0100" value={form.phone} onChange={set('phone')} className={`${field} mt-1`} /></label>
        <input aria-label="Street address" placeholder="Street address" autoComplete="address-line1" value={form.line1} onChange={set('line1')} className={`${field} col-span-2`} />
        <input aria-label="Apartment or suite (optional)" placeholder="Apt, suite (optional)" autoComplete="address-line2" value={form.line2} onChange={set('line2')} className={`${field} col-span-2`} />
        <input aria-label="City" placeholder="City" autoComplete="address-level2" value={form.city} onChange={set('city')} className={`${field} col-span-2`} />
        <input aria-label="State" placeholder="State (CA)" autoComplete="address-level1" value={form.state} onChange={set('state')} className={field} />
        <input aria-label="ZIP code" placeholder="ZIP" inputMode="numeric" autoComplete="postal-code" value={form.zip} onChange={set('zip')} className={field} />
        <label className="col-span-2 text-[12px] text-[#8e8e93]">Employment
          <select value={form.employment} onChange={set('employment')} className={`${field} mt-1`}>
            <option value="employed">Employed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
            <option value="unemployed">Not working</option>
          </select>
        </label>
      </div>
      <fieldset className="space-y-1.5">
        <legend className="text-[12px] text-[#8e8e93]">Tick any that apply (most people tick none)</legend>
        {DISCLOSURES.map(([key, label]) => (
          <label key={key} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-[#c7c7cc]">
            <input type="checkbox" checked={!!disclosures[key]} onChange={(e) => setDisclosures((d) => ({ ...d, [key]: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-[#2f6bff]" />
            {label}
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-2.5 text-[12.5px] leading-snug text-[#c7c7cc]">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#2f6bff]" />
        <span>I agree to Alpaca&apos;s Customer, Account and Crypto agreements, and to Hoardrun sharing these details with Alpaca to open my account.</span>
      </label>
      <button onClick={submit} disabled={!ready || busy} className="hr-focus inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white text-[15px] font-medium text-black disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#8e8e93]">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Open account
      </button>
    </div>
  )
}
