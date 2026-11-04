"use client"

import type { ReactNode } from "react"

/** A short empty state: the tab's own chrome object, a line of copy and its action. */
export function SavingsEmpty({ graphic, title, text, action }: { graphic: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <section className="hr-promo !min-h-[180px]">
      <span className="hr-promo-art">{graphic}</span>
      <div className="relative max-w-[60%] sm:max-w-[66%]">
        <h3 className="hr-card-title text-[22px] sm:text-[24px]">{title}</h3>
        <p className="hr-sub mt-1.5 !text-[#aeaeb2]">{text}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </section>
  )
}

export function SavingsEmptyButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="hr-focus inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-medium text-black">
      {children}
    </button>
  )
}
