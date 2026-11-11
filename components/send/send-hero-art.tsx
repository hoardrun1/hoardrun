/**
 * The Send money hero art: a tilted phone with a paper plane on its screen, an orbit of light and
 * two $ coins. Vector, so it stays sharp and loads with the page. Decorative only.
 */
export function SendHeroArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 280" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="sh-glow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#2f6bff" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#1d4ed8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sh-frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8cc8ff" />
          <stop offset="35%" stopColor="#3d7bff" />
          <stop offset="100%" stopColor="#0d1f63" />
        </linearGradient>
        <linearGradient id="sh-screen" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#2a5cf0" />
          <stop offset="55%" stopColor="#14318f" />
          <stop offset="100%" stopColor="#0a1640" />
        </linearGradient>
        <linearGradient id="sh-plane" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#b9d7ff" />
        </linearGradient>
        <linearGradient id="sh-plane-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fb4ff" />
          <stop offset="100%" stopColor="#3b6fe8" />
        </linearGradient>
        <radialGradient id="sh-coin" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#9fd0ff" />
          <stop offset="45%" stopColor="#3b82ff" />
          <stop offset="100%" stopColor="#123ea8" />
        </radialGradient>
        <linearGradient id="sh-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0" />
          <stop offset="30%" stopColor="#60a5fa" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#2f6bff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#2f6bff" stopOpacity="0" />
        </linearGradient>
        <filter id="sh-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="sh-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" /></filter>
      </defs>

      {/* glow */}
      <ellipse cx="185" cy="150" rx="150" ry="120" fill="url(#sh-glow)" />

      {/* back half of the orbit, behind the phone */}
      <ellipse cx="185" cy="168" rx="138" ry="34" fill="none" stroke="url(#sh-ring)" strokeWidth="7" opacity="0.35" filter="url(#sh-blur)" transform="rotate(-10 185 168)" />
      <path d="M 50 175 A 138 34 -10 0 1 318 128" fill="none" stroke="url(#sh-ring)" strokeWidth="3" opacity="0.7" transform="rotate(0)" />

      {/* phone */}
      <g transform="rotate(16 190 140)">
        <rect x="128" y="22" width="128" height="236" rx="28" fill="#06102e" />
        <rect x="124" y="16" width="128" height="236" rx="28" fill="url(#sh-frame)" />
        <rect x="131" y="23" width="114" height="222" rx="22" fill="url(#sh-screen)" />
        <rect x="167" y="30" width="42" height="11" rx="5.5" fill="#050b22" />
        <path d="M 138 60 Q 190 40 238 70 L 238 90 Q 190 64 138 82 Z" fill="#ffffff" opacity="0.06" />
        {/* paper plane */}
        <g transform="translate(188 128) rotate(-8)">
          <path d="M -46 6 L 44 -34 L 10 40 L -2 14 Z" fill="url(#sh-plane)" />
          <path d="M -2 14 L 44 -34 L 6 22 Z" fill="url(#sh-plane-shade)" />
          <path d="M -2 14 L 6 22 L 10 40 Z" fill="#9cc4ff" />
        </g>
        <circle cx="188" cy="128" r="58" fill="#3b82ff" opacity="0.12" filter="url(#sh-blur)" />
      </g>

      {/* front half of the orbit, over the phone */}
      <path d="M 318 128 A 138 34 -10 0 1 52 182" fill="none" stroke="url(#sh-ring)" strokeWidth="4" strokeLinecap="round" />
      <path d="M 318 128 A 138 34 -10 0 1 52 182" fill="none" stroke="#9fd0ff" strokeWidth="1.2" opacity="0.9" filter="url(#sh-soft)" />

      {/* coins */}
      <g transform="translate(92 62) rotate(-14)">
        <ellipse cx="0" cy="4" rx="26" ry="26" fill="#0b2a7a" />
        <circle r="26" fill="url(#sh-coin)" />
        <circle r="19" fill="none" stroke="#cfe6ff" strokeOpacity="0.55" strokeWidth="1.5" />
        <text x="0" y="9" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="26" fill="#ffffff">$</text>
      </g>
      <g transform="translate(286 212) rotate(10)">
        <ellipse cx="0" cy="6" rx="34" ry="34" fill="#0b2a7a" />
        <circle r="34" fill="url(#sh-coin)" />
        <circle r="25" fill="none" stroke="#cfe6ff" strokeOpacity="0.55" strokeWidth="1.8" />
        <text x="0" y="12" textAnchor="middle" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="34" fill="#ffffff">$</text>
      </g>

      {/* sparkles */}
      <circle cx="58" cy="128" r="2.2" fill="#9fd0ff" />
      <circle cx="312" cy="70" r="1.8" fill="#9fd0ff" />
      <circle cx="248" cy="30" r="1.4" fill="#ffffff" opacity="0.8" />
      <path d="M 70 210 l 3 -9 l 3 9 l 9 3 l -9 3 l -3 9 l -3 -9 l -9 -3 z" fill="#cfe6ff" opacity="0.85" transform="scale(0.6) translate(40 120)" />
    </svg>
  )
}
