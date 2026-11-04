"use client"

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, ChevronRight, RotateCcw, Sparkles } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/AuthContext"

type Turn = { role: "user" | "assistant"; content: string }

const STORAGE_KEY = "hr-assistant-chat"

const SUGGESTIONS = [
  "How should I start saving with my balance?",
  "Explain ETFs vs crypto in simple words",
  "Help me set a savings goal for a laptop",
  "How do Circles and voting work?",
  "Where can I see my spending?",
]

/** Turns the assistant's light markdown into UI: in-app links become buttons, **bold** and bullets render. */
function Reply({ text, onOpen }: { text: string; onOpen: (href: string) => void }) {
  const links: { label: string; href: string }[] = []
  const inline = (line: string): ReactNode[] =>
    line.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g).map((part, i) => {
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link) {
        if (link[2].startsWith("/")) {
          if (!links.some((l) => l.href === link[2])) links.push({ label: link[1], href: link[2] })
          return <strong key={i} className="text-white">{link[1]}</strong>
        }
        return <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="underline underline-offset-2">{link[1]}</a>
      }
      const bold = part.match(/^\*\*([^*]+)\*\*$/)
      return bold ? <strong key={i} className="text-white">{bold[1]}</strong> : <Fragment key={i}>{part}</Fragment>
    })

  const blocks = text.split(/\n{2,}/)
  const body = blocks.map((block, b) => {
    const lines = block.split("\n").filter(Boolean)
    if (lines.length && lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
      return (
        <ul key={b} className="ml-1 space-y-1">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-[#5aa9ff]" />
              <span>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</span>
            </li>
          ))}
        </ul>
      )
    }
    return <p key={b}>{lines.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{inline(l.replace(/^#+\s*/, ""))}</Fragment>)}</p>
  })

  return (
    <>
      <div className="space-y-2.5">{body}</div>
      {links.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {links.map((link) => (
            <button key={link.href} onClick={() => onOpen(link.href)} className="hr-ai-link hr-focus">
              {link.label}
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
          ))}
        </div>
      )}
    </>
  )
}

/** Hoardrun AI: a chat that knows the app and the person's own numbers, and points them to the right page. */
export function AssistantChat() {
  const router = useRouter()
  const { user } = useAuth()
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // The conversation survives moving around the app, until the tab is closed
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) setTurns(JSON.parse(saved))
    } catch {}
  }, [])
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(turns)) } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [turns, sending])

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || sending) return
    const next: Turn[] = [...turns, { role: "user", content }]
    setTurns(next)
    setDraft("")
    setError(null)
    setSending(true)
    const response = await apiClient.askAssistant(next.slice(-20))
    setSending(false)
    if (response.error || !response.data?.reply) {
      setError(response.error || "Hoardrun AI couldn't answer. Try again.")
      return
    }
    setTurns([...next, { role: "assistant", content: response.data.reply }])
  }

  const retry = () => {
    const last = turns[turns.length - 1]
    if (last?.role !== "user") return
    setTurns(turns.slice(0, -1))
    void send(last.content)
  }

  const firstName = user?.name?.split(" ")[0]

  return (
    <div className="hr-ai">
      <div className="hr-ai-scroll">
        {/* Greeting, as the assistant's first message */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hr-ai-hello">
          <span className="hr-ai-orb" aria-hidden="true"><Sparkles className="h-6 w-6" strokeWidth={2} /></span>
          <h1 className="hr-title !text-[30px] sm:!text-[36px]">Hoardrun AI</h1>
          <p className="hr-sub mt-1 max-w-[34ch] text-center">
            {firstName ? `Hi ${firstName}. ` : ""}Ask me about your money, saving, investing or where to find things in the app.
          </p>
        </motion.div>

        {turns.length === 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} onClick={() => send(suggestion)} className="hr-ai-chip hr-focus">
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <AnimatePresence initial={false}>
            {turns.map((turn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                {turn.role === "user" ? (
                  <div className="hr-ai-user">{turn.content}</div>
                ) : (
                  <div className="hr-ai-bot">
                    <span className="hr-ai-name"><Sparkles className="h-3.5 w-3.5" />Hoardrun AI</span>
                    <Reply text={turn.content} onOpen={(href) => router.push(href)} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {sending && (
            <div className="flex justify-start" role="status" aria-label="Hoardrun AI is typing">
              <div className="hr-ai-bot hr-ai-typing"><span /><span /><span /></div>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl bg-[rgb(251_113_133/0.12)] px-4 py-3 text-[13.5px] text-[#fda4af]">
              <span>{error}</span>
              <button onClick={retry} className="hr-focus inline-flex flex-none items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-white">
                <RotateCcw className="h-3.5 w-3.5" />Retry
              </button>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <form
        className="hr-ai-composer"
        onSubmit={(e) => { e.preventDefault(); void send(draft) }}
      >
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(draft) } }}
          rows={1}
          placeholder="Ask Hoardrun AI…"
          aria-label="Message Hoardrun AI"
          className="hr-ai-input"
        />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Send" className="hr-ai-send hr-focus">
          <ArrowUp className="h-5 w-5" strokeWidth={2.4} />
        </button>
      </form>
      <p className="mt-2 text-center text-[11.5px] text-[#6e6e73]">
        Hoardrun AI gives general guidance, not financial advice. It never moves money.
        {turns.length > 0 && (
          <> · <button onClick={() => { setTurns([]); setError(null) }} className="underline underline-offset-2">New chat</button></>
        )}
      </p>
    </div>
  )
}
