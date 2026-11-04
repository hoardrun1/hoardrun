'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowDownLeft, Bell, Check, CheckCheck, ChevronRight, Info, Shield, Trash2 } from 'lucide-react'
import { useNotifications, type GlobalNotification } from '@/contexts/NotificationContext'
import { PageHero, HeroAction } from '@/components/app/page-hero'
import { SavingsEmpty } from '@/components/savings/savings-empty'
import { OrbsGraphic } from '@/components/app/home-graphics'

const ICONS: Record<GlobalNotification['type'], typeof Bell> = {
  transaction: ArrowDownLeft,
  success: Check,
  warning: AlertTriangle,
  error: AlertTriangle,
  security: Shield,
  info: Info,
}

const TONES: Record<GlobalNotification['type'], string> = {
  transaction: '90 169 255',
  success: '52 211 153',
  warning: '251 191 36',
  error: '251 113 133',
  security: '147 197 253',
  info: '161 161 170',
}

const dayLabel = (date: Date) => {
  const today = new Date()
  const yesterday = new Date(Date.now() - 86_400_000)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

/** Everything Hoardrun has told you, from real events: money in and out, savings, budgets. */
export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const groups = useMemo(() => {
    const shown = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications
    const byDay = new Map<string, GlobalNotification[]>()
    for (const n of shown) {
      const label = dayLabel(n.timestamp)
      byDay.set(label, [...(byDay.get(label) ?? []), n])
    }
    return Array.from(byDay.entries())
  }, [notifications, filter])

  const open = (n: GlobalNotification) => {
    if (!n.read) markAsRead(n.id)
    if (n.link) router.push(n.link)
  }

  return (
    <div className="space-y-4 pb-28 sm:space-y-5 lg:pb-8">
      <PageHero
        title="Notifications"
        subtitle="Money in and out, savings milestones and budget alerts."
        tone="sky"
        graphic={OrbsGraphic}
        figureLabel="Unread"
        figure={unreadCount}
        actions={
          <>
            <HeroAction primary onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckCheck className="h-4 w-4" strokeWidth={2.2} />
              Mark all read
            </HeroAction>
            {notifications.length > 0 && (
              <HeroAction onClick={() => window.confirm('Delete all notifications?') && clearAllNotifications()}>
                <Trash2 className="h-4 w-4" strokeWidth={2.2} />
                Clear all
              </HeroAction>
            )}
          </>
        }
      />

      <div className="flex gap-2" role="group" aria-label="Show">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`hr-focus h-9 rounded-full px-4 text-[14px] font-medium transition-colors ${filter === f ? 'bg-[rgb(var(--iris))] text-white' : 'bg-[var(--rv-card,#141416)] text-[#a1a1a6]'}`}
          >
            {f === 'all' ? 'All' : `Unread${unreadCount ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <SavingsEmpty
          graphic={<OrbsGraphic tone="sky" className="h-full w-full" />}
          title={filter === 'unread' ? "You're all caught up" : 'No notifications yet'}
          text="You'll hear here when money arrives, a goal is reached or a budget runs low."
        />
      ) : (
        groups.map(([day, items]) => (
          <section key={day}>
            <h2 className="mb-2 px-1 text-[13px] font-medium text-[#8e8e93]">{day}</h2>
            <ul className="overflow-hidden rounded-[22px] bg-[var(--rv-card,#141416)]">
              <AnimatePresence initial={false}>
                {items.map((n, i) => {
                  const Icon = ICONS[n.type] ?? Bell
                  const tone = TONES[n.type] ?? TONES.info
                  return (
                    <motion.li key={n.id} layout exit={{ opacity: 0, height: 0 }} className={i > 0 ? 'border-t border-white/[0.06]' : ''}>
                      <div className="flex items-center gap-3 px-4 py-3.5">
                        <button type="button" onClick={() => open(n)} className="hr-focus flex min-w-0 flex-1 items-center gap-3 text-left">
                          <span className="relative inline-flex h-10 w-10 flex-none items-center justify-center rounded-full" style={{ background: `rgb(${tone} / 0.18)`, color: `rgb(${tone})` }}>
                            <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                            {!n.read && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#141416] bg-[rgb(var(--iris))]" aria-label="Unread" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate text-[15px] ${n.read ? 'text-[#d1d1d6]' : 'font-medium text-white'}`}>{n.title}</span>
                            <span className="block text-[13px] leading-snug text-[#8e8e93]">{n.message}</span>
                          </span>
                          <span className="flex flex-none items-center gap-1 text-[12px] text-[#6e6e73]">
                            {n.timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {n.link && <ChevronRight className="h-4 w-4" />}
                          </span>
                        </button>
                        <button type="button" onClick={() => removeNotification(n.id)} aria-label={`Delete ${n.title}`} className="hr-focus inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-[#6e6e73] hover:bg-white/10 hover:text-white">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
