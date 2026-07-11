'use client'

interface LoadingScreenProps {
  visible: boolean
  fading: boolean
}

export function LoadingScreen({ visible, fading }: LoadingScreenProps) {
  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-paper transition-opacity duration-500 ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">Loading…</span>

      {/* Accent ring — mirrors Masthead decoration, scaled up */}
      <div className="relative w-24 h-24">
        {/* Outer rotating ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-forest/20 animate-spin"
          style={{ animationDuration: '8s' }}
        />
        {/* Middle pulsing circle */}
        <div className="absolute inset-2 rounded-full bg-forest/5 animate-pulse-slow" />
        {/* Forest glow halo */}
        <div className="absolute inset-4 rounded-full bg-forest/10 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
        {/* Center accent dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-forest animate-glow shadow-[0_0_12px_rgba(45,134,89,0.6)]" />
      </div>

      {/* Wordmark */}
      <p className="mt-6 font-serif text-2xl font-medium tracking-tight text-ink">
        ClimateCred
      </p>

      {/* Tagline */}
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
        Verifying the evidence…
      </p>
    </div>
  )
}
