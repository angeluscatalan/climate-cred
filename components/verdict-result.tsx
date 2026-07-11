// ===========================================================================
// FRONTEND — Verdict + Token-Level Explanation (live)
// ===========================================================================

import { ConfidenceGauge } from './confidence-gauge'
import type { Verdict, ExplanationToken } from '@/lib/verify'

const VERDICT_STYLES: Record<Verdict, { label: string; color: string; bar: string }> = {
  SUPPORTS: {
    label: 'Supports',
    color: 'text-forest',
    bar: 'from-forest to-forest/40',
  },
  REFUTES: {
    label: 'Refutes',
    color: 'text-red-600',
    bar: 'from-red-600 to-red-300',
  },
  INSUFFICIENT: {
    label: 'Insufficient',
    color: 'text-amber-500',
    bar: 'from-amber-500 to-amber-300',
  },
}

export function VerdictResult({
  verified = false,
  verdict,
  confidence,
  explanation,
}: {
  verified?: boolean
  verdict?: Verdict
  confidence?: number
  explanation?: ExplanationToken[]
}) {
  const style = verdict ? VERDICT_STYLES[verdict] : null

  return (
    <section className="py-8 animate-slide-in-up">
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-ink-muted">
        Verdict
      </h2>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          {verified && style ? (
            <>
              <div className="flex items-baseline gap-3">
                <p className={`font-serif text-6xl font-medium leading-none sm:text-7xl animate-float ${style.color}`}>
                  {style.label}
                </p>
                <span className={`inline-block w-2 h-2 rounded-full animate-glow ${style.color.replace('text-', 'bg-')}`} />
              </div>
              <div className={`mt-3 h-1 w-40 bg-gradient-to-r ${style.bar}`} />
              <p className={`mt-4 font-mono text-[11px] uppercase tracking-[0.18em] opacity-70 ${style.color}`}>
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

        <div className="flex flex-col items-center animate-float" style={{ animationDelay: '0.2s' }}>
          <ConfidenceGauge
            value={verified && confidence != null ? confidence : 0}
            color={style ? `var(--${verdict === 'SUPPORTS' ? 'forest' : verdict === 'REFUTES' ? 'red-600' : 'amber-500'})` : 'var(--ink-muted)'}
          />
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-muted">
            Confidence Index
          </span>
        </div>
      </div>

      {/* Token-level explanation */}
      <div className="mt-8 border-t border-hairline pt-6">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Token-Level Explanation
        </p>

        {explanation && explanation.length > 0 ? (
          <p className="font-serif text-lg leading-relaxed">
            {explanation.map((token, i) => (
              <span
                key={i}
                title={`Salience: ${(token.weight * 100).toFixed(0)}%`}
                className={`mr-1 px-0.5 rounded transition-colors ${
                  token.weight >= 0.4
                    ? 'bg-forest/20 text-forest font-medium'
                    : 'text-ink'
                }`}
              >
                {token.text}
              </span>
            ))}
          </p>
        ) : (
          <p className="font-mono text-[10px] text-ink-muted/60">
            {verified ? 'No explanation available.' : 'Submit a claim to see token highlights.'}
          </p>
        )}
      </div>
    </section>
  )
}
