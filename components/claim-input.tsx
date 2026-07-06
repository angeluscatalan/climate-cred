// ===========================================================================
// FRONTEND — Claim input (static prototype, no behavior wired up)
// To make this live: convert to a client component, add state for the input,
// and call your backend on submit. See lib/verify.ts for the BACKEND seam.
// ===========================================================================

export function ClaimInput({
  onVerify,
  verified = false,
}: {
  onVerify?: () => void
  verified?: boolean
}) {
  return (
    <section className="py-8 animate-slide-in-left">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink flex items-center gap-2">
          Claim No. 001
          {!verified && <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest/50 animate-pulse" />}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Enter a statement
        </span>
      </div>

      <input
        type="text"
        placeholder="e.g. The last decade was the warmest on record."
        aria-label="Climate claim to verify"
        className="w-full border border-input bg-card px-4 py-3.5 font-serif text-lg text-ink outline-none placeholder:text-ink-muted/60 focus:border-forest focus:ring-2 focus:ring-forest/40 transition-all"
      />

      {!verified && (
        <button
          type="button"
          onClick={onVerify}
          className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:scale-105 active:scale-95"
        >
          Verify Claim
          <span aria-hidden className="text-base leading-none animate-float" style={{animationDuration: '2s'}}>
            →
          </span>
        </button>
      )}
    </section>
  )
}
