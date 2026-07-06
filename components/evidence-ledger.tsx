// ===========================================================================
// FRONTEND — Evidence ledger (live)
// ===========================================================================

import type { Evidence } from '@/lib/verify'

const VERDICT_BADGE: Record<string, string> = {
  SUPPORTS: 'bg-forest/10 text-forest border-forest/30',
  REFUTES: 'bg-red-50 text-red-600 border-red-200',
  INSUFFICIENT: 'bg-amber-50 text-amber-600 border-amber-200',
}

export function EvidenceLedger({ evidence }: { evidence?: Evidence[] }) {
  const hasEvidence = evidence && evidence.length > 0

  return (
    <section className="py-8 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="mb-4 flex items-baseline justify-between border-b-[3px] border-gradient-to-r from-forest to-transparent pb-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink flex items-center gap-2">
          Evidence
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest animate-pulse-slow" />
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          {hasEvidence ? `${evidence.length} passage${evidence.length !== 1 ? 's' : ''} retrieved` : 'No passages retrieved'}
        </span>
      </div>

      {hasEvidence ? (
        <ol className="space-y-4">
          {evidence.map((item) => (
            <li
              key={item.rank}
              className="group border border-hairline bg-card p-4 transition-all hover:border-forest/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Rank + title */}
                <div className="flex items-start gap-3 min-w-0">
                  <span className="mt-0.5 font-mono text-[10px] text-ink-muted/60 tabular-nums shrink-0">
                    {String(item.rank).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-sm text-ink leading-snug">
                      {item.evidence_used || item.title}
                    </p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-ink-muted/70">
                      {item.source}
                    </p>
                  </div>
                </div>

                {/* Verdict badge + confidence */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span
                    className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.15em] ${
                      VERDICT_BADGE[item.verdict] ?? VERDICT_BADGE.INSUFFICIENT
                    }`}
                  >
                    {item.verdict}
                  </span>
                  <span className="font-mono text-[10px] text-ink-muted tabular-nums">
                    {item.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Source link */}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-forest/70 transition-colors hover:text-forest"
                >
                  View source
                  <span aria-hidden>↗</span>
                </a>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="font-mono text-[10px] text-ink-muted/60 py-4">
          Submit a claim to retrieve evidence.
        </p>
      )}
    </section>
  )
}
