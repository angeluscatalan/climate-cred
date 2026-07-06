// ===========================================================================
// FRONTEND — Evidence ledger (static prototype, header only)
// Map over your backend's retrieved passages here to render the ledger rows.
// ===========================================================================

export function EvidenceLedger() {
  return (
    <section className="py-8 animate-slide-in-up" style={{animationDelay: '0.2s'}}>
      <div className="mb-2 flex items-baseline justify-between border-b-[3px] border-gradient-to-r from-forest to-transparent pb-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink flex items-center gap-2">
          Evidence
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest animate-pulse-slow" />
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          No passages retrieved
        </span>
      </div>

      {/* Evidence rows go here */}
    </section>
  )
}
