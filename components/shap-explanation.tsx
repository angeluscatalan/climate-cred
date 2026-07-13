// ===========================================================================
// FRONTEND — SHAP Explanation (live)
// Renders per-token SHAP attributions returned by /api/explain.
// Positive values push toward the predicted label (green bar, right).
// Negative values push away from it (red bar, left).
// ===========================================================================

'use client'

import { useRouter } from 'next/navigation'
import { useLoading } from '@/components/page-load-provider'
import type { ShapResult, ShapToken } from '@/lib/verify'

// ---------------------------------------------------------------------------
// Single token chip
// ---------------------------------------------------------------------------
function TokenChip({ token, maxAbs }: { token: ShapToken; maxAbs: number }) {
  const pct = maxAbs > 0 ? Math.abs(token.shap_value) / maxAbs : 0
  const isPositive = token.shap_value >= 0
  // Skip near-zero tokens (special chars, padding) visually but keep them in
  // the flow so the sentence stays readable.
  const barWidth = `${Math.round(pct * 100)}%`

  return (
    <span className="inline-flex flex-col items-center mx-0.5 mb-2 group">
      {/* attribution bar above the token */}
      <span className="relative w-full h-1 mb-0.5 flex items-end justify-center">
        <span
          className={`block rounded-full transition-all ${
            isPositive ? 'bg-forest' : 'bg-red-500'
          }`}
          style={{ width: barWidth, height: '4px', minWidth: pct > 0.01 ? '2px' : '0' }}
        />
      </span>

      {/* token text */}
      <span
        title={`SHAP: ${token.shap_value.toFixed(4)}`}
        className={`font-serif text-sm px-0.5 rounded transition-colors cursor-default ${
          pct >= 0.3
            ? isPositive
              ? 'bg-forest/15 text-forest font-medium'
              : 'bg-red-500/15 text-red-600 font-medium'
            : 'text-ink'
        }`}
      >
        {token.text}
      </span>
    </span>
  )
}

// ---------------------------------------------------------------------------
// Legend row
// ---------------------------------------------------------------------------
function Legend({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-muted">
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-1 rounded-full bg-forest" />
        Supports {label}
      </span>
      <span className="flex items-center gap-1">
        <span className="inline-block w-3 h-1 rounded-full bg-red-500" />
        Opposes {label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function ShapExplanation({
  shap,
  shapLoading = false,
  onExplain,
  onTryAgain,
}: {
  shap?: ShapResult
  shapLoading?: boolean
  onExplain?: () => void
  onTryAgain?: () => void
}) {
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleTryAgain = () => {
    if (onTryAgain) {
      onTryAgain()
    } else {
      startLoading()
      router.push('/')
    }
  }

  // Normalise: find the max absolute SHAP value so bars are relative
  const maxAbs =
    shap && shap.tokens.length > 0
      ? Math.max(...shap.tokens.map((t) => Math.abs(t.shap_value)), 1e-9)
      : 0

  return (
    <section className="py-8 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
      {/* Header */}
      <div className="mb-4 flex items-baseline justify-between border-b-[3px] border-gradient-to-r from-forest to-transparent pb-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink flex items-center gap-2">
          SHAP Explanation
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest animate-pulse-slow" />
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Feature importance
        </span>
      </div>

      {/* Prompt — shown before the user requests SHAP */}
      {!shap && !shapLoading && (
        <div className="flex flex-col gap-3 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
            Token-level attribution is computationally intensive and optional.
          </p>
          <button
            onClick={onExplain}
            id='show-shap-btn'
            disabled={!onExplain}
            className="self-start inline-flex items-center gap-2 border border-forest text-forest px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] transition-all hover:bg-forest hover:text-primary-foreground hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Run SHAP Explanation
            <span aria-hidden className="text-base leading-none">⚡</span>
          </button>
        </div>
      )}

      {/* Loading state — shown after the user clicks the button */}
      {shapLoading && (
        <div className="flex items-center gap-2 py-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block w-1.5 h-1.5 rounded-full bg-forest/50 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted" id='shap-processing-txt'>
            Computing token attributions…
          </p>
        </div>
      )}

      {/* Token attribution view */}
      {shap && (
        <>
          {/* Predicted label + confidence */}
          <div className="mb-4 flex items-center gap-3" >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
              Model prediction
            </span>
            <span
              className={`font-mono text-[10px] uppercase tracking-[0.14em] px-2 py-0.5 rounded ${
                shap.predicted_label === 'SUPPORTS'
                  ? 'bg-forest/10 text-forest'
                  : shap.predicted_label === 'REFUTES'
                  ? 'bg-red-500/10 text-red-600'
                  : 'bg-amber-400/10 text-amber-600'
              }`}
            >
              {shap.predicted_label.replace('_', ' ')}
            </span>
            <span className="font-mono text-[10px] text-ink-muted">
              {(shap.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <Legend label={shap.predicted_label.replace('_', ' ')} />

          {/* Token chips */}
          <div className="mt-4 flex flex-wrap items-end leading-none" id='shap-output'>
            {shap.tokens.map((token, i) => (
              <TokenChip key={i} token={token} maxAbs={maxAbs} />
            ))}
          </div>

          <p className="mt-3 font-mono text-[9px] text-ink-muted/60 leading-relaxed">
            Bar height indicates each token's influence on the prediction.
            Hover a token to see its exact SHAP value.
          </p>
        </>
      )}

      {/* Try again */}
      <div className="mt-8 pt-6 border-t border-hairline">
        <button
          onClick={handleTryAgain}
          className="inline-flex items-center gap-2 bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:scale-105 active:scale-95"
        >
          Try Again
          <span aria-hidden className="text-base leading-none animate-pulse-slow">
            ↻
          </span>
        </button>
      </div>
    </section>
  )
}
