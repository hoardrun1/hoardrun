'use client'

/**
 * The artwork behind the balance on Home (phones and tablets): orbit rings of light around a glass
 * orb, a sweeping arc, and a few glints. Drawn as vector art so it stays sharp and loads with the
 * page; the colour mesh and grain underneath are CSS (.hr-wallpaper in app-theme.css).
 * Purely decorative: hidden from screen readers.
 */
import { useId } from 'react'

export function HomeWallpaperArt({ fit = 'xMidYMin slice' }: { fit?: string }) {
  // Each copy needs its own gradient ids: Home draws one for phones and one for computers
  const id = useId().replace(/:/g, '')
  return (
    <svg className="hr-wallpaper-art" viewBox="0 0 400 520" preserveAspectRatio={fit} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`hw-ring-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#9fd0ff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`hw-arc-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7cc0ff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`hw-orb-${id}`} cx="0.32" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.28" stopColor="#bfe1ff" stopOpacity="0.55" />
          <stop offset="0.7" stopColor="#3d7bff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.05" />
        </radialGradient>
        <radialGradient id={`hw-orb-glow-${id}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#7cc0ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7cc0ff" stopOpacity="0" />
        </radialGradient>
        <filter id={`hw-soft-${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4" /></filter>
      </defs>

      {/* Orbit rings around the glass orb, top right */}
      <g className="hr-wallpaper-orbit" transform="translate(338 120)">
        <circle r="150" fill="none" stroke={`url(#hw-ring-${id})`} strokeWidth="1" />
        <circle r="112" fill="none" stroke={`url(#hw-ring-${id})`} strokeWidth="1.2" strokeDasharray="2 7" />
        <circle r="78" fill="none" stroke={`url(#hw-ring-${id})`} strokeWidth="1.4" />
      </g>
      <circle cx="338" cy="120" r="70" fill={`url(#hw-orb-glow-${id})`} />
      <circle cx="338" cy="120" r="40" fill={`url(#hw-orb-${id})`} />
      <circle cx="338" cy="120" r="40" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="1" />
      <path d="M 312 104 A 30 30 0 0 1 336 88" fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2.4" strokeLinecap="round" filter={`url(#hw-soft-${id})`} />

      {/* A long arc of light sweeping through the lower half */}
      <path d="M -40 470 C 80 330, 260 300, 460 360" fill="none" stroke={`url(#hw-arc-${id})`} strokeWidth="1.6" />
      <path d="M -40 500 C 90 380, 270 350, 460 410" fill="none" stroke={`url(#hw-arc-${id})`} strokeWidth="0.8" opacity="0.6" />

      {/* Glints */}
      <g fill="#ffffff" className="hr-wallpaper-glints">
        <path d="M 44 132 l 2.4 -7 l 2.4 7 l 7 2.4 l -7 2.4 l -2.4 7 l -2.4 -7 l -7 -2.4 z" opacity="0.85" />
        <path d="M 262 258 l 1.6 -4.6 l 1.6 4.6 l 4.6 1.6 l -4.6 1.6 l -1.6 4.6 l -1.6 -4.6 l -4.6 -1.6 z" opacity="0.7" />
        <circle cx="96" cy="64" r="1.4" opacity="0.7" />
        <circle cx="210" cy="40" r="1" opacity="0.6" />
        <circle cx="30" cy="300" r="1.2" opacity="0.5" />
      </g>
    </svg>
  )
}
