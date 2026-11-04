'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BarChart3, ChevronDown, CreditCard, Download, PiggyBank, Search, Send, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'

const topics = [
  { label: 'Send money', href: '/send-money', icon: Send },
  { label: 'Receive money', href: '/receive-money', icon: Download },
  { label: 'Savings', href: '/savings', icon: PiggyBank },
  { label: 'Cards', href: '/cards', icon: CreditCard },
  { label: 'Budget', href: '/budget', icon: BarChart3 },
  { label: 'Security', href: '/security', icon: Shield },
]

const questions = [
  { q: 'How do I add money?', a: 'Tap the + button in the tab bar on a phone or tablet. On a computer, use Add money in the sidebar. Choose a method, enter an amount and confirm.' },
  { q: 'How do I send money?', a: 'Open Send Money from Home or the More menu, enter who you are paying and how much, then review and confirm.' },
  { q: 'How do I create a savings goal?', a: 'Open Savings and create a goal with a name and a target amount. Your goals also appear on Home so you can follow your progress.' },
  { q: 'How do I get a virtual card?', a: 'Open Cards and choose to issue a virtual card. It will appear in your list of cards when it is ready.' },
  { q: 'How do I change my password?', a: 'Open Security from the More menu. Your password and other sign-in settings are all kept there.' },
  { q: 'How is my health score worked out?', a: 'Your score looks at five things: spending, savings, keeping to your budgets, debt and your emergency fund. Open Health Score from Home to see each one and what to do next.' },
  { q: 'How do I change the language?', a: 'Tap the language icon in the top bar and choose from the list.' },
  { q: 'How do I sign out?', a: 'Open the More menu on a phone or tablet, or use the sidebar on a computer, and choose Sign out.' },
]

export default function HelpPage() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return questions
    return questions.filter(({ q, a }) => `${q} ${a}`.toLowerCase().includes(term))
  }, [query])

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-4">
        <div>
          <h1 className="hr-title">Help Center</h1>
          <p className="mt-1 text-sm text-[#a1a1a6] sm:text-base">Quick answers about using Hoardrun.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a6]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for an answer"
            aria-label="Search help"
            className="h-12 pl-10"
          />
        </div>
      </header>

      {!query && (
        <section aria-label="Topics" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {topics.map((topic) => (
            <Link key={topic.href} href={topic.href} className="hr-panel hr-focus flex min-w-0 items-center gap-2.5 p-3.5 text-sm transition-colors hover:border-white/25">
              <topic.icon className="h-[18px] w-[18px] shrink-0 text-[#a1a1a6]" strokeWidth={1.8} />
              <span className="truncate">{topic.label}</span>
            </Link>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">{query ? `${results.length} ${results.length === 1 ? 'answer' : 'answers'}` : 'Common questions'}</h2>
        {results.length > 0 ? (
          <div className="hr-panel divide-y divide-white/10 overflow-hidden">
            {results.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="hr-focus flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium sm:px-5 sm:text-[15px] [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-[#a1a1a6] transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-[#a1a1a6] sm:px-5">{a}</p>
              </details>
            ))}
          </div>
        ) : (
          <p className="hr-panel px-5 py-8 text-center text-sm text-[#a1a1a6]">Nothing matches that. Try another word, or contact us below.</p>
        )}
      </section>

      <Link href="/contact" className="hr-panel hr-focus flex items-center justify-between gap-4 p-4 transition-colors hover:border-white/25 sm:p-5">
        <span>
          <span className="block text-sm font-medium sm:text-[15px]">Still need help?</span>
          <span className="mt-0.5 block text-sm text-[#a1a1a6]">Send a message to our support team.</span>
        </span>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-[#a1a1a6]" />
      </Link>
    </div>
  )
}
