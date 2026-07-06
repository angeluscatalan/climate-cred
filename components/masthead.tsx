export function Masthead() {
  return (
    <header className="pt-12 pb-6 sm:pt-16 animate-slide-in-left">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink-muted">
            Retrieval-Augmented Climate Claim Verification
          </p>
          <h1 className="mt-3 font-serif text-5xl font-medium tracking-tight text-ink sm:text-6xl">
            ClimateCred
          </h1>
          <div className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            <span>Evidence-First Fact-Checking</span>
            <span>Est. 2025 · Corpus v3</span>
          </div>
        </div>
        
        {/* Animated accent decoration */}
        <div className="ml-6 hidden sm:block">
          <div className="relative w-20 h-20">
            {/* Outer rotating circle */}
            <div className="absolute inset-0 rounded-full border-2 border-forest/20 animate-spin" style={{animationDuration: '8s'}} />
            {/* Middle pulsing circle */}
            <div className="absolute inset-2 rounded-full bg-forest/5 animate-pulse-slow" />
            {/* Center accent dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-forest animate-glow" />
          </div>
        </div>
      </div>
      
      {/* thick rule + hairline, journal style */}
      <div className="mt-2 h-[3px] w-full bg-gradient-to-r from-forest to-forest/30" />
      <div className="mt-[3px] h-px w-full bg-hairline" />
    </header>
  )
}
