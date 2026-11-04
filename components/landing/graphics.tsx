"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { Check, Landmark, Lock, ShieldCheck } from "lucide-react"

/** The Hoardrun logo with its black background removed, so it only works on dark surfaces. */
export function LogoMark({ className = "" }: { className?: string }) {
  return <Image src="/hoardrun-logo-mark.png" alt="" width={792} height={352} className={`w-auto ${className}`} priority />
}

const PULSE_PATH = "M-20 340 H300 L338 312 L382 406 L424 262 L474 392 L516 332 H820 L1072 26 L1470 352"

/** The logo line at hero scale: it draws in on load, then a spark keeps travelling along it. */
export function PulseLine({ className = "" }: { className?: string }) {
  const stroke = { vectorEffect: "non-scaling-stroke" as const, fill: "none" }
  return (
    <svg viewBox="0 0 1440 420" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d={PULSE_PATH}
        pathLength={1}
        className="lp-pulse-draw"
        stroke="#ffffff"
        strokeWidth="16"
        strokeOpacity="0.28"
        style={{ ...stroke, filter: "blur(10px)" }}
      />
      <path d={PULSE_PATH} pathLength={1} className="lp-pulse-draw" stroke="#ffffff" strokeWidth="2" style={stroke} />
      <path
        d={PULSE_PATH}
        pathLength={1}
        className="lp-pulse-spark"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ ...stroke, filter: "drop-shadow(0 0 8px #ffffff)" }}
      />
    </svg>
  )
}

// Rough continents as lat/lon ellipses: [lat, lon, latRadius, lonRadius].
const LAND: [number, number, number, number][] = [
  [52, -105, 20, 34], [66, -150, 8, 18], [72, -42, 10, 16], [33, -96, 15, 20], [18, -96, 8, 9],
  [-8, -62, 15, 15], [-30, -63, 15, 8],
  [50, 12, 11, 16], [62, 18, 9, 12], [40, -3, 5, 6], [41, 25, 6, 12],
  [18, 8, 15, 26], [2, 22, 13, 14], [-18, 26, 14, 11], [-20, 47, 6, 3],
  [60, 95, 14, 58], [38, 95, 15, 36], [24, 46, 10, 10], [20, 78, 11, 8], [13, 103, 9, 7],
  [36, 138, 7, 5], [-2, 115, 6, 14], [-25, 134, 10, 15], [-42, 172, 4, 3],
]

const isLand = (lat: number, lon: number) =>
  LAND.some(([a, b, ra, rb]) => ((lat - a) / ra) ** 2 + ((lon - b) / rb) ** 2 < 1)

const toVec = (lat: number, lon: number) => {
  const phi = (lat * Math.PI) / 180
  const theta = (lon * Math.PI) / 180
  return [Math.cos(phi) * Math.sin(theta), Math.sin(phi), Math.cos(phi) * Math.cos(theta)] as const
}

const CITIES = {
  accra: toVec(5.6, -0.2),
  london: toVec(51.5, -0.1),
  newYork: toVec(40.7, -74),
  nairobi: toVec(-1.3, 36.8),
  dubai: toVec(25.2, 55.3),
  singapore: toVec(1.3, 103.8),
  saoPaulo: toVec(-23.5, -46.6),
}

const ROUTES = [
  [CITIES.accra, CITIES.london],
  [CITIES.london, CITIES.newYork],
  [CITIES.accra, CITIES.saoPaulo],
  [CITIES.accra, CITIES.nairobi],
  [CITIES.nairobi, CITIES.dubai],
  [CITIES.dubai, CITIES.singapore],
  [CITIES.london, CITIES.dubai],
]

/** Rotating dotted globe with live money routes. */
export function DottedGlobe({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const dots: (readonly [number, number, number])[] = []
    const total = 16000
    for (let i = 0; i < total; i++) {
      const lat = Math.asin(1 - (2 * (i + 0.5)) / total) * (180 / Math.PI)
      const lon = ((i * 137.508) % 360) - 180
      if (isLand(lat, lon)) dots.push(toVec(lat, lon))
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const tilt = -0.32
    const cosT = Math.cos(tilt)
    const sinT = Math.sin(tilt)
    let raf = 0
    let visible = true
    let width = 0
    const start = performance.now()

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth
      canvas.width = width * dpr
      canvas.height = width * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const render = (now: number) => {
      const elapsed = reduced ? 0 : Math.max(0, now - start) / 1000
      const rot = -0.25 + elapsed * 0.09
      const cosR = Math.cos(rot)
      const sinR = Math.sin(rot)
      const radius = width * 0.47
      const c = width / 2
      const project = ([x, y, z]: readonly [number, number, number], lift = 1) => {
        const x1 = x * cosR - z * sinR
        const z1 = x * sinR + z * cosR
        const y1 = y * cosT - z1 * sinT
        const z2 = y * sinT + z1 * cosT
        return [c + x1 * radius * lift, c - y1 * radius * lift, z2] as const
      }

      ctx.clearRect(0, 0, width, width)
      const glow = ctx.createRadialGradient(c - radius * 0.35, c - radius * 0.5, radius * 0.05, c, c, radius)
      glow.addColorStop(0, "rgba(255,255,255,0.2)")
      glow.addColorStop(0.55, "rgba(255,255,255,0.035)")
      glow.addColorStop(1, "rgba(255,255,255,0)")
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(c, c, radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = "rgba(255, 255, 255,0.22)"
      ctx.lineWidth = 1
      ctx.stroke()

      for (const d of dots) {
        const [px, py, pz] = project(d)
        if (pz < 0) continue
        ctx.fillStyle = `rgba(255,255,255,${0.12 + pz * pz * 0.85})`
        ctx.beginPath()
        ctx.arc(px, py, Math.max(0.6, width / 520), 0, Math.PI * 2)
        ctx.fill()
      }

      ROUTES.forEach(([a, b], i) => {
        const steps = 36
        const points = Array.from({ length: steps + 1 }, (_, s) => {
          const t = s / steps
          const v = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
          const len = Math.hypot(v[0], v[1], v[2]) || 1
          const unit = [v[0] / len, v[1] / len, v[2] / len] as const
          return project(unit, 1 + Math.sin(t * Math.PI) * 0.16)
        })
        ctx.lineWidth = 1.2
        ctx.strokeStyle = "rgba(255, 255, 255,0.55)"
        ctx.beginPath()
        let drawing = false
        for (const [x, y, z] of points) {
          if (z < 0) {
            drawing = false
            continue
          }
          if (drawing) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
          drawing = true
        }
        ctx.stroke()

        const head = points[Math.floor(((elapsed * 0.28 + i * 0.17) % 1) * steps)]
        if (head[2] > 0) {
          ctx.fillStyle = "#ffffff"
          ctx.shadowColor = "#ffffff"
          ctx.shadowBlur = 12
          ctx.beginPath()
          ctx.arc(head[0], head[1], 2.6, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      })
    }

    let last = 0
    const loop = (now: number) => {
      if (now - last >= 1000 / 30) {
        render(now)
        last = now
      }
      if (visible && !reduced) raf = requestAnimationFrame(loop)
    }
    const ro = new ResizeObserver(() => {
      size()
      render(performance.now())
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([entry]) => {
      const was = visible
      visible = entry.isIntersecting
      if (visible && !was && !reduced) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)
    size()
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className={`aspect-square w-full ${className}`} />
}

const STREAM = [
  ["Card payment", "12 ms"], ["Transfer settled", "84 ms"], ["Savings deposit", "31 ms"], ["Mobile money", "96 ms"],
  ["Investment order", "47 ms"], ["Bank withdrawal", "63 ms"], ["Card payment", "9 ms"], ["Transfer settled", "71 ms"],
]

/** Scrolling ledger of settled transactions. */
export function SpeedGraphic() {
  const rows = [...STREAM, ...STREAM]
  return (
    <div
      aria-hidden="true"
      className="h-full overflow-hidden"
      style={{ maskImage: "linear-gradient(transparent, #000 25%, #000 70%, transparent)", WebkitMaskImage: "linear-gradient(transparent, #000 25%, #000 70%, transparent)" }}
    >
      <div className="lp-stream">
        {rows.map(([label, time], i) => (
          <div key={i} className="flex items-center gap-3 border-b border-[#d2d2d7] py-3 text-sm text-[#1d1d1f]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d1d1f] text-[#ffffff]">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="flex-1 truncate">{label}</span>
            <span className="tabular-nums text-[#6e6e73]">{time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Concentric encrypted rings around a vault. */
export function SecurityGraphic() {
  const hex = "A7F3 09C2 5E1B D84A 72FE 11B9 C6D0 3A58 E94F 6B27 "
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="lp-vault" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <path id="lp-ring-text" d="M200 72 a128 128 0 1 1 -0.01 0" />
      </defs>
      <circle cx="200" cy="200" r="150" fill="url(#lp-vault)" className="lp-beat" />
      <g className="lp-ring">
        <circle cx="200" cy="200" r="176" fill="none" stroke="#6e6e73" strokeWidth="1" strokeDasharray="2 10" />
        <circle cx="200" cy="24" r="5" fill="#ffffff" />
      </g>
      <g className="lp-ring-rev">
        <text fontSize="13" fill="#ffffff" fillOpacity="0.8" letterSpacing="2.5" fontFamily="ui-monospace, monospace">
          <textPath href="#lp-ring-text">{hex + hex}</textPath>
        </text>
      </g>
      <g className="lp-ring">
        <circle cx="200" cy="200" r="96" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="60 22" />
      </g>
      <circle cx="200" cy="200" r="66" fill="#1d1d1f" stroke="#ffffff" strokeOpacity="0.6" />
      <foreignObject x="170" y="170" width="60" height="60">
        <div className="flex h-full w-full items-center justify-center text-[#ffffff]">
          <ShieldCheck className="h-11 w-11" strokeWidth={1.4} />
        </div>
      </foreignObject>
    </svg>
  )
}

/** Stacks of savings that climb towards a goal. */
export function SavingsGraphic() {
  const bars = [18, 26, 24, 36, 44, 42, 56, 66, 74, 92]
  return (
    <svg viewBox="0 0 520 240" preserveAspectRatio="xMidYMax meet" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="lp-bar" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#3a3a3c" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <line x1="0" x2="520" y1="26" y2="26" stroke="#ffffff" strokeOpacity="0.5" strokeDasharray="4 6" />
      {bars.map((h, i) => {
        const height = (h / 100) * 210
        return (
          <g key={i}>
            <rect x={10 + i * 51} y={240 - height} width="38" height={height} rx="8" fill="url(#lp-bar)" fillOpacity={0.35 + i * 0.065} />
            {Array.from({ length: Math.floor(height / 16) }, (_, r) => (
              <line key={r} x1={10 + i * 51} x2={48 + i * 51} y1={240 - r * 16} y2={240 - r * 16} stroke="#000000" strokeOpacity="0.45" />
            ))}
          </g>
        )
      })}
      <circle cx="489" cy="46" r="6" fill="#fff" className="lp-beat" />
    </svg>
  )
}

/** Portfolio growth curve over a measured grid. */
export function InvestingGraphic() {
  const line = "M0 170 C 40 165, 60 130, 95 138 S 150 165, 190 112 S 250 110, 285 76 S 345 56, 400 16"
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="lp-invest" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#3a3a3c" vectorEffect="non-scaling-stroke" />
      ))}
      {[80, 160, 240, 320].map((x) => (
        <line key={x} x1={x} x2={x} y1="0" y2="200" stroke="#3a3a3c" strokeDasharray="2 6" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={`${line} V200 H0 Z`} fill="url(#lp-invest)" />
      <path d={line} fill="none" stroke="#ffffff" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Funds moving from several sources into one protected balance. */
export function DepositsGraphic() {
  return (
    <div aria-hidden="true" className="relative h-full w-full">
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
        <defs>
          <radialGradient id="lp-sphere" cx="35%" cy="28%" r="80%">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.55" stopColor="#c7c7cc" />
            <stop offset="1" stopColor="#6e6e73" />
          </radialGradient>
        </defs>
        {[34, 100, 166].map((y) => (
          <path key={y} d={`M92 ${y} C 170 ${y}, 200 100, 276 100`} fill="none" stroke="#ffffff" strokeWidth="1.5" className="lp-flow" />
        ))}
        {[34, 100, 166].map((y) => (
          <g key={y}>
            <rect x="24" y={y - 21} width="68" height="42" rx="10" fill="#1d1d1f" stroke="#6e6e73" />
            <rect x="36" y={y - 8} width="30" height="4" rx="2" fill="#a1a1a6" />
            <rect x="36" y={y + 2} width="44" height="4" rx="2" fill="#3a3a3c" />
          </g>
        ))}
        <circle cx="318" cy="100" r="66" fill="#ffffff" fillOpacity="0.12" className="lp-beat" />
        <circle cx="318" cy="100" r="44" fill="url(#lp-sphere)" />
      </svg>
      <div className="pointer-events-none absolute inset-0">
        <svg viewBox="0 0 400 200" className="h-full w-full">
          <foreignObject x="296" y="78" width="44" height="44">
            <div className="flex h-full w-full items-center justify-center text-[#1d1d1f]">
              <Lock className="h-7 w-7" strokeWidth={1.6} />
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  )
}

/** Money jumping between two accounts over a live route. */
export function TransfersGraphic() {
  return (
    <svg viewBox="0 0 520 220" preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden="true">
      <path id="lp-transfer-arc" d="M86 150 C 170 10, 350 10, 434 150" fill="none" stroke="#ffffff" strokeWidth="1.5" className="lp-flow" />
      <path d="M86 150 C 170 70, 350 70, 434 150" fill="none" stroke="#3a3a3c" strokeWidth="1.5" />
      <circle r="7" fill="#fff" style={{ filter: "drop-shadow(0 0 8px #ffffff)" }}>
        <animateMotion dur="2.6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.5 0 0.3 1">
          <mpath href="#lp-transfer-arc" />
        </animateMotion>
      </circle>
      {[86, 434].map((x) => (
        <g key={x}>
          <circle cx={x} cy="150" r="46" fill="#ffffff" fillOpacity="0.1" className="lp-beat" />
          <circle cx={x} cy="150" r="30" fill="#1d1d1f" stroke="#ffffff" />
          <foreignObject x={x - 12} y="138" width="24" height="24">
            <div className="flex h-full w-full items-center justify-center text-[#ffffff]">
              <Landmark className="h-5 w-5" strokeWidth={1.5} />
            </div>
          </foreignObject>
        </g>
      ))}
    </svg>
  )
}
