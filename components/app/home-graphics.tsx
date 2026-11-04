"use client"

import { useId } from "react"

/** Chrome objects for the dashboard. Illustrations only: none of their shapes stand for real numbers. */

/** Gradient ids must be unique per copy: url(#id) resolves to the first match, even inside a hidden element. */
const useGradientId = () => useId().replace(/:/g, "")

export type Tone = "silver" | "iris" | "mint" | "sky" | "amber" | "coral" | "violet"

/** Six stops per tone, darkest edge to brightest highlight, in the order Metal uses them. */
export const TONES: Record<Tone, [string, string, string, string, string, string]> = {
  silver: ["#5c5c60", "#f5f5f7", "#8e8e93", "#ffffff", "#6e6e73", "#2c2c2e"],
  iris: ["#123a8a", "#e6f2ff", "#5aa9ff", "#ffffff", "#2f6bff", "#0a1f4d"],
  mint: ["#0b6b4f", "#dcfff1", "#34d399", "#f2fffa", "#10b981", "#053b2b"],
  sky: ["#0b5a85", "#e3f6ff", "#38bdf8", "#ffffff", "#0ea5e9", "#062f49"],
  amber: ["#8a5203", "#fff5d6", "#fbbf24", "#fffbeb", "#d97706", "#4a1d03"],
  coral: ["#8f1f42", "#ffe6ec", "#fb7185", "#fff2f4", "#e11d48", "#4c0519"],
  violet: ["#1e4b8f", "#eef6ff", "#93c5fd", "#f2f8ff", "#3b82f6", "#0c2650"],
}

type GraphicProps = { className?: string; tone?: Tone }

function Metal({ id, angle = "x", tone = "silver" }: { id: string; angle?: "x" | "y" | "d"; tone?: Tone }) {
  const end = angle === "x" ? { x2: "1", y2: "0" } : angle === "y" ? { x2: "0", y2: "1" } : { x2: "1", y2: "1" }
  const [a, b, c, d, e, f] = TONES[tone]
  return (
    <linearGradient id={id} x1="0" y1="0" {...end}>
      <stop offset="0" stopColor={a} />
      <stop offset="0.18" stopColor={b} />
      <stop offset="0.42" stopColor={c} />
      <stop offset="0.62" stopColor={d} />
      <stop offset="0.82" stopColor={e} />
      <stop offset="1" stopColor={f} />
    </linearGradient>
  )
}

export function CoinsGraphic({ className = "", tone = "amber" }: GraphicProps) {
  const T = TONES[tone]
  const uid = useGradientId()
  const coins = [
    { x: 92, y: 142 },
    { x: 108, y: 112 },
    { x: 96, y: 82 },
  ]
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-hg-coin-side`} />
        <linearGradient id={`${uid}-hg-coin-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={T[3]} />
          <stop offset="0.55" stopColor={T[1]} />
          <stop offset="1" stopColor={T[2]} />
        </linearGradient>
        <linearGradient id={`${uid}-hg-coin-inner`} x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#aeaeb2" />
        </linearGradient>
      </defs>
      {coins.map(({ x, y }) => (
        <g key={y}>
          <path d={`M${x - 66} ${y} v20 a66 25 0 0 0 132 0 v-20 z`} fill={`url(#${uid}-hg-coin-side)`} />
          <ellipse cx={x} cy={y} rx="66" ry="25" fill={`url(#${uid}-hg-coin-top)`} />
          <ellipse cx={x} cy={y} rx="51" ry="18" fill={`url(#${uid}-hg-coin-inner)`} stroke="#8e8e93" strokeOpacity="0.55" />
          <ellipse cx={x} cy={y} rx="65" ry="24.2" fill="none" stroke="#fff" strokeOpacity="0.9" />
        </g>
      ))}
    </svg>
  )
}

/** An isometric chrome office block: three lit faces with window rows. */
export function HeadquartersGraphic({ className = "", tone = "sky" }: GraphicProps) {
  const T = TONES[tone]
  const uid = useGradientId()
  const slope = 32 / 60
  const rows = [0, 1, 2, 3]
  const columns = [0, 1]
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={T[3]} />
          <stop offset="1" stopColor={T[1]} />
        </linearGradient>
        <linearGradient id={`${uid}-left`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T[1]} />
          <stop offset="1" stopColor={T[4]} />
        </linearGradient>
        <linearGradient id={`${uid}-right`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T[2]} />
          <stop offset="1" stopColor={T[5]} />
        </linearGradient>
      </defs>
      <polygon points="100,30 160,62 100,94 40,62" fill={`url(#${uid}-top)`} />
      <polygon points="40,62 100,94 100,180 40,148" fill={`url(#${uid}-left)`} />
      <polygon points="100,94 160,62 160,148 100,180" fill={`url(#${uid}-right)`} />
      <polygon points="88,50 112,62 100,68 76,56" fill="#8e8e93" opacity="0.6" />
      {rows.map((row) =>
        columns.map((column) => {
          const lx = 48 + column * 24
          const ly = 62 + (lx - 40) * slope + 14 + row * 20
          const rx = 108 + column * 24
          const ry = 94 - (rx - 100) * slope + 14 + row * 20
          return (
            <g key={`${row}-${column}`}>
              <polygon points={`${lx},${ly} ${lx + 16},${ly + 16 * slope} ${lx + 16},${ly + 16 * slope + 11} ${lx},${ly + 11}`} fill="#1c1c1e" opacity="0.78" />
              <polygon points={`${rx},${ry} ${rx + 16},${ry - 16 * slope} ${rx + 16},${ry - 16 * slope + 11} ${rx},${ry + 11}`} fill="#0b0b0c" opacity="0.85" />
              <polygon points={`${rx + 2},${ry + 1} ${rx + 7},${ry - 1.6} ${rx + 7},${ry + 8} ${rx + 2},${ry + 10}`} fill="#fff" opacity={row === 1 && column === 0 ? 0.55 : 0.08} />
            </g>
          )
        })
      )}
      <polyline points="40,62 100,94 160,62" fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.2" />
      <line x1="100" y1="94" x2="100" y2="180" stroke="#fff" strokeOpacity="0.35" />
    </svg>
  )
}

/** A signed page with a chrome seal. */
export function SealedDocumentGraphic({ className = "", tone = "amber" }: GraphicProps) {
  const uid = useGradientId()
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#aeaeb2" />
        </linearGradient>
        <Metal tone={tone} id={`${uid}-seal`} angle="d" />
      </defs>
      <rect x="54" y="30" width="104" height="138" rx="12" fill="#48484a" transform="rotate(8 106 99)" />
      <path d="M48 26 h76 l30 30 v110 a10 10 0 0 1 -10 10 h-96 a10 10 0 0 1 -10 -10 v-130 a10 10 0 0 1 10 -10 z" fill={`url(#${uid}-paper)`} />
      <path d="M124 26 v22 a8 8 0 0 0 8 8 h22 z" fill="#8e8e93" />
      {[62, 78, 94, 110].map((y, index) => (
        <rect key={y} x="56" y={y} width={index === 3 ? 48 : 78} height="7" rx="3.5" fill="#3a3a3c" opacity="0.45" />
      ))}
      <path d="M58 140 c8 -10 14 6 22 -4 s12 4 20 -2" fill="none" stroke="#1c1c1e" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <circle cx="142" cy="148" r="32" fill={`url(#${uid}-seal)`} />
      <circle cx="142" cy="148" r="31" fill="none" stroke="#fff" strokeOpacity="0.7" strokeDasharray="3 3" />
      <circle cx="142" cy="148" r="22" fill="#1c1c1e" stroke="#fff" strokeOpacity="0.6" />
      <path d="M131 148 l7 7 l14 -15" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function VaultGraphic({ className = "", tone = "sky" }: GraphicProps) {
  const uid = useGradientId()
  const ticks = Array.from({ length: 24 }, (_, i) => (i * 360) / 24)
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-hg-vault-ring`} angle="d" />
        <radialGradient id={`${uid}-hg-vault-face`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#4a4a4e" />
          <stop offset="0.6" stopColor="#1c1c1e" />
          <stop offset="1" stopColor="#050506" />
        </radialGradient>
        <Metal tone={tone} id={`${uid}-hg-vault-hub`} angle="y" />
      </defs>
      <circle cx="100" cy="100" r="92" fill={`url(#${uid}-hg-vault-ring)`} />
      <circle cx="100" cy="100" r="74" fill={`url(#${uid}-hg-vault-face)`} stroke="#000" strokeWidth="2" />
      {ticks.map((angle) => (
        <line key={angle} x1="100" y1="33" x2="100" y2="41" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" transform={`rotate(${angle} 100 100)`} />
      ))}
      {[20, 140, 260].map((angle) => (
        <rect key={angle} x="94" y="52" width="12" height="48" rx="6" fill={`url(#${uid}-hg-vault-hub)`} transform={`rotate(${angle} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="23" fill={`url(#${uid}-hg-vault-ring)`} />
      <circle cx="100" cy="100" r="13" fill="#1c1c1e" stroke="#fff" strokeOpacity="0.5" />
    </svg>
  )
}

export function BarsGraphic({ className = "", tone = "mint" }: GraphicProps) {
  const uid = useGradientId()
  const bars = [
    { x: 26, height: 62 },
    { x: 68, height: 98 },
    { x: 110, height: 128 },
    { x: 152, height: 168 },
  ]
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-hg-bar`} />
        <linearGradient id={`${uid}-hg-bar-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d1d1d6" />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      {bars.map(({ x, height }) => (
        <g key={x}>
          <rect x={x} y={190 - height} width="32" height={height} rx="9" fill={`url(#${uid}-hg-bar)`} />
          <rect x={x + 3} y={193 - height} width="26" height="10" rx="5" fill={`url(#${uid}-hg-bar-top)`} />
        </g>
      ))}
    </svg>
  )
}

export function GemGraphic({ className = "", tone = "violet" }: GraphicProps) {
  const T = TONES[tone]
  const facets: [string, string][] = [
    ["100,30 60,30 74,74", T[3]],
    ["100,30 140,30 126,74", T[1]],
    ["100,30 74,74 126,74", T[1]],
    ["60,30 20,74 74,74", T[2]],
    ["140,30 180,74 126,74", T[4]],
    ["20,74 74,74 100,178", T[2]],
    ["74,74 126,74 100,178", T[3]],
    ["126,74 180,74 100,178", T[5]],
  ]
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      {facets.map(([points, fill]) => (
        <polygon key={points} points={points} fill={fill} stroke="#000" strokeOpacity="0.18" strokeLinejoin="round" />
      ))}
      <polyline points="20,74 60,30 140,30 180,74 100,178 20,74" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="1.5" strokeLinejoin="round" />
      <polyline points="20,74 180,74" fill="none" stroke="#fff" strokeOpacity="0.5" />
    </svg>
  )
}

export function TargetGraphic({ className = "", tone = "coral" }: GraphicProps) {
  const T = TONES[tone]
  const uid = useGradientId()
  return (
    <svg viewBox="0 0 240 240" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-hg-target`} angle="d" />
        <radialGradient id={`${uid}-hg-target-core`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor={T[3]} />
          <stop offset="0.6" stopColor={T[2]} />
          <stop offset="1" stopColor={T[5]} />
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="102" fill="none" stroke={`url(#${uid}-hg-target)`} strokeWidth="26" />
      <circle cx="120" cy="120" r="64" fill="none" stroke={`url(#${uid}-hg-target)`} strokeWidth="20" />
      <circle cx="120" cy="120" r="115" fill="none" stroke="#fff" strokeOpacity="0.55" />
      <circle cx="120" cy="120" r="33" fill={`url(#${uid}-hg-target-core)`} />
    </svg>
  )
}

/** Shown until there's something to draw: the chart's frame, with no invented numbers in it. */
export function EmptyChart({ label }: { label: string }) {
  return (
    <div className="relative h-52" role="img" aria-label={label}>
      <div className="hr-chart-grid absolute inset-x-0 bottom-0 top-3" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-[22%] h-px bg-gradient-to-r from-[#5aa9ff]/10 via-[#5aa9ff]/60 to-[#7dd3fc]" aria-hidden="true" />
      <span className="absolute bottom-[22%] right-0 h-2 w-2 translate-y-[3.5px] rounded-full bg-[#7dd3fc] shadow-[0_0_14px_3px_rgba(56,189,248,0.75)]" aria-hidden="true" />
      <p className="absolute inset-x-0 top-[34%] text-center text-sm text-[#8e8e93]">{label}</p>
    </div>
  )
}

export function BriefcaseGraphic({ className = "", tone = "iris" }: GraphicProps) {
  const uid = useGradientId()
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-body`} angle="d" />
        <Metal tone={tone} id={`${uid}-band`} />
      </defs>
      <path d="M70 62 V46 a14 14 0 0 1 14 -14 h32 a14 14 0 0 1 14 14 v16" fill="none" stroke={`url(#${uid}-band)`} strokeWidth="11" />
      <rect x="18" y="60" width="164" height="112" rx="20" fill={`url(#${uid}-body)`} />
      <rect x="18.5" y="60.5" width="163" height="111" rx="19.5" fill="none" stroke="#fff" strokeOpacity="0.8" />
      <path d="M18 106 H182" stroke="#1c1c1e" strokeOpacity="0.55" strokeWidth="3" />
      <rect x="84" y="94" width="32" height="26" rx="7" fill="#1c1c1e" stroke="#fff" strokeOpacity="0.7" />
      <rect x="95" y="102" width="10" height="10" rx="2.5" fill={`url(#${uid}-band)`} />
    </svg>
  )
}

export function TowerGraphic({ className = "", tone = "sky" }: GraphicProps) {
  const uid = useGradientId()
  const towers = [
    { x: 20, y: 86, width: 52, height: 100 },
    { x: 128, y: 62, width: 52, height: 124 },
    { x: 66, y: 22, width: 68, height: 164 },
  ]
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-tower`} />
      </defs>
      {towers.map(({ x, y, width, height }) => (
        <g key={x}>
          <rect x={x} y={y} width={width} height={height} rx="7" fill={`url(#${uid}-tower)`} stroke="#000" strokeOpacity="0.45" />
          {Array.from({ length: Math.floor((height - 20) / 22) }, (_, row) =>
            [0, 1, 2].map((column) => (
              <rect key={`${row}-${column}`} x={x + 9 + column * ((width - 18) / 3)} y={y + 14 + row * 22} width={(width - 18) / 3 - 5} height="12" rx="2" fill="#1c1c1e" fillOpacity="0.72" />
            ))
          )}
        </g>
      ))}
    </svg>
  )
}

export function ShieldGraphic({ className = "", tone = "mint" }: GraphicProps) {
  const uid = useGradientId()
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-shield`} angle="d" />
        <radialGradient id={`${uid}-face`} cx="0.35" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#4a4a4e" />
          <stop offset="1" stopColor="#0b0b0c" />
        </radialGradient>
      </defs>
      <path d="M100 12 L176 40 V100 C176 146 142 174 100 190 C58 174 24 146 24 100 V40 Z" fill={`url(#${uid}-shield)`} />
      <path d="M100 32 L158 53 V100 C158 134 133 155 100 169 C67 155 42 134 42 100 V53 Z" fill={`url(#${uid}-face)`} />
      <path d="M70 100 L92 122 L133 78" fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PieGraphic({ className = "", tone = "violet" }: GraphicProps) {
  const T = TONES[tone]
  const uid = useGradientId()
  const radius = 62
  const circumference = 2 * Math.PI * radius
  const slices = [
    { share: 0.46, rotate: -90, stroke: `url(#${uid}-a)` },
    { share: 0.3, rotate: 76, stroke: `url(#${uid}-b)` },
    { share: 0.19, rotate: 186, stroke: T[4] },
  ]
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-a`} angle="d" />
        <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={T[1]} />
          <stop offset="1" stopColor={T[4]} />
        </linearGradient>
      </defs>
      {slices.map(({ share, rotate, stroke }) => (
        <circle key={rotate} cx="100" cy="100" r={radius} fill="none" stroke={stroke} strokeWidth="46" strokeDasharray={`${circumference * share} ${circumference}`} transform={`rotate(${rotate} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="86" fill="none" stroke="#fff" strokeOpacity="0.45" />
    </svg>
  )
}

export function RocketGraphic({ className = "", tone = "coral" }: GraphicProps) {
  const T = TONES[tone]
  const uid = useGradientId()
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-hull`} />
        <linearGradient id={`${uid}-flame`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="rotate(38 100 100)">
        <path d="M86 150 L100 200 L114 150 Z" fill={`url(#${uid}-flame)`} />
        <path d="M70 112 L40 150 L74 142 Z" fill={T[2]} />
        <path d="M130 112 L160 150 L126 142 Z" fill={T[5]} />
        <path d="M100 4 C128 34 136 72 130 112 L124 150 H76 L70 112 C64 72 72 34 100 4 Z" fill={`url(#${uid}-hull)`} stroke="#fff" strokeOpacity="0.5" />
        <circle cx="100" cy="72" r="18" fill="#1c1c1e" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" />
        <circle cx="94" cy="66" r="5" fill="#fff" fillOpacity="0.75" />
      </g>
    </svg>
  )
}

export function HexCoinGraphic({ className = "", tone = "amber" }: GraphicProps) {
  const uid = useGradientId()
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <Metal tone={tone} id={`${uid}-hex`} angle="d" />
      </defs>
      <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill={`url(#${uid}-hex)`} />
      <polygon points="100,38 154,69 154,131 100,162 46,131 46,69" fill="#1c1c1e" stroke="#fff" strokeOpacity="0.5" />
      <polygon points="100,62 133,81 100,100 67,81" fill="#ffffff" />
      <polygon points="67,81 100,100 100,138 67,119" fill="#aeaeb2" />
      <polygon points="133,81 100,100 100,138 133,119" fill="#6e6e73" />
    </svg>
  )
}

export function OrbsGraphic({ className = "", tone = "violet" }: GraphicProps) {
  const T = TONES[tone]
  const uid = useGradientId()
  const orbs = [
    { cx: 128, cy: 66, r: 50 },
    { cx: 62, cy: 86, r: 42 },
    { cx: 112, cy: 142, r: 46 },
  ]
  return (
    <svg viewBox="0 0 200 200" className={className} data-tone={tone} aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}-orb`} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor={T[3]} />
          <stop offset="0.42" stopColor={T[1]} />
          <stop offset="0.8" stopColor={T[5]} />
          <stop offset="1" stopColor={T[2]} />
        </radialGradient>
      </defs>
      {orbs.map(({ cx, cy, r }) => (
        <circle key={cx} cx={cx} cy={cy} r={r} fill={`url(#${uid}-orb)`} />
      ))}
    </svg>
  )
}

/** A fanned stack of blank transaction cards, for before there are any real ones. */
export function ReceiptStack() {
  const row = (width: string) => (
    <>
      <span className="h-9 w-9 flex-none rounded-full bg-current opacity-20" />
      <span className="flex-1 space-y-1.5">
        <span className={`block h-2 rounded-full bg-current opacity-30 ${width}`} />
        <span className="block h-2 w-1/3 rounded-full bg-current opacity-15" />
      </span>
      <span className="h-2 w-10 rounded-full bg-current opacity-30" />
    </>
  )
  return (
    <div className="relative mx-auto h-[118px] w-full max-w-[300px]" aria-hidden="true">
      <div className="hr-receipt absolute inset-x-8 top-1 -rotate-2 text-white opacity-50">{row("w-1/2")}</div>
      <div className="hr-receipt absolute inset-x-4 top-7 rotate-1 text-white opacity-80">{row("w-3/5")}</div>
      <div className="hr-receipt hr-receipt-front absolute inset-x-0 top-[52px] text-black">{row("w-2/3")}</div>
    </div>
  )
}
