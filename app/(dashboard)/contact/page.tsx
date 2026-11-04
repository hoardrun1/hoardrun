'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'

const subjects = ['Account', 'Payments', 'Cards', 'Security', 'Something else']

export default function ContactPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [topic, setTopic] = useState(subjects[0])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    apiClient.getSupportContact().then((response) => {
      setEmail(response.data?.support_email ?? null)
      setLoaded(true)
    })
  }, [])

  // Support tickets aren't available on the server yet, so this opens the person's own email app.
  const openEmail = (event: FormEvent) => {
    event.preventDefault()
    const title = `[${topic}] ${subject.trim()}`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message.trim())}`
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <header>
        <h1 className="hr-title">Contact us</h1>
        <p className="mt-1 text-sm text-[#a1a1a6] sm:text-base">Tell us what's going on and we'll get back to you by email.</p>
      </header>

      <form onSubmit={openEmail} className="hr-panel space-y-5 p-4 sm:p-6">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">What is this about?</legend>
          <div className="flex flex-wrap gap-2">
            {subjects.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTopic(item)}
                aria-pressed={topic === item}
                className={`hr-focus min-h-[38px] rounded-full border px-3.5 text-sm transition-colors ${
                  topic === item ? 'border-white bg-white font-medium text-black' : 'border-white/15 text-[#a1a1a6] hover:border-white/30'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2">
          <Label htmlFor="contact-subject">Subject</Label>
          <Input id="contact-subject" value={subject} onChange={(event) => setSubject(event.target.value)} required maxLength={200} className="h-12" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-message">Message</Label>
          <Textarea id="contact-message" value={message} onChange={(event) => setMessage(event.target.value)} required maxLength={2000} rows={6} />
        </div>

        {loaded && !email && <p role="alert" className="text-sm text-[#a1a1a6]">We can't reach our support details right now. Please try again in a moment.</p>}

        <Button type="submit" disabled={!email} className="h-12 w-full rounded-full sm:w-auto sm:px-6">
          <Mail className="mr-2 h-4 w-4" />
          Continue in email
        </Button>
        {email && <p className="text-sm text-[#a1a1a6]">This opens your email app with a message to {email}.</p>}
      </form>

      <Link href="/help" className="hr-panel hr-focus flex items-center justify-between gap-4 p-4 transition-colors hover:border-white/25 sm:p-5">
        <span>
          <span className="block text-sm font-medium sm:text-[15px]">Looking for a quick answer?</span>
          <span className="mt-0.5 block text-sm text-[#a1a1a6]">Check the Help Center first.</span>
        </span>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-[#a1a1a6]" />
      </Link>
    </div>
  )
}
