// ===========================================================================
// FRONTEND — SHAP Explanation (static prototype, header only)
// Shows detailed feature importance and model interpretability using SHAP values.
// ===========================================================================

'use client'

import { useRouter } from 'next/navigation'
import { useLoading } from '@/components/page-load-provider'

export function ShapExplanation({ onTryAgain }: { onTryAgain?: () => void }) {
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleTryAgain = () => {
    if (onTryAgain) {
      // Same-page reset — no route change, no loader.
      onTryAgain()
    } else {
      // Navigate back to home with loading overlay.
      startLoading()
      router.push('/')
    }
  }
  return (
    <section className="py-8 animate-slide-in-up" style={{animationDelay: '0.4s'}}>
      <div className="mb-2 flex items-baseline justify-between border-b-[3px] border-gradient-to-r from-forest to-transparent pb-2">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink flex items-center gap-2">
          SHAP Explanation
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest animate-pulse-slow" />
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Feature importance
        </span>
      </div>

      {/* SHAP rows and charts go here */}

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
