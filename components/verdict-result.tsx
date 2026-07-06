// ===========================================================================
// FRONTEND — Verdict + Token-Level Explanation (static prototype)
// The verdict word, confidence gauge, and highlighted tokens are intentionally
// left empty. Populate them from your backend response (see lib/verify.ts).
// ===========================================================================

import { ConfidenceGauge } from './confidence-gauge'

export function VerdictResult({ verified = false }: { verified?: boolean }) {
  return (
    <section className="py-8 animate-slide-in-up">
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-muted">
        Verdict
      </h2>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          {verified ? (
            <>
              <div className="flex items-baseline gap-3">
                <p className="font-serif text-6xl font-medium leading-none text-forest sm:text-7xl animate-float">
                  Supports
                </p>
                <span className="inline-block w-2 h-2 rounded-full bg-forest animate-glow" />
              </div>
              <div className="mt-3 h-1 w-40 bg-gradient-to-r from-forest to-forest/40" />
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-forest/70">
                Verified against the evidence base
              </p>
            </>
          ) : (
            <>
              <p className="font-serif text-6xl font-medium leading-none text-ink-muted/30 sm:text-7xl">
                —
              </p>
              <div className="mt-3 h-1 w-40 bg-hairline" />
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                Awaiting verification
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center animate-float" style={{animationDelay: '0.2s'}}>
          <ConfidenceGauge
            value={verified ? 94 : 0}
            color={verified ? 'var(--forest)' : 'var(--ink-muted)'}
          />
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-muted">
            Confidence Index
          </span>
        </div>
      </div>

      {/* Token-level explainability — header only for the prototype */}
      <div className="mt-8 border-t border-hairline pt-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Token-Level Explanation
        </p>
        {/* Highlighted explanation tokens go here */}
      </div>
    </section>
  )
}
