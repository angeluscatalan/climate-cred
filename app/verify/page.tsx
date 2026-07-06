'use client'

// ===========================================================================
// FRONTEND — Verify page (live)
// Calls the FastAPI backend via /api/verify and passes real data to all
// child components.
// ===========================================================================

import { useState } from 'react'
import { Masthead } from '@/components/masthead'
import { ClaimInput } from '@/components/claim-input'
import { VerdictResult } from '@/components/verdict-result'
import { EvidenceLedger } from '@/components/evidence-ledger'
import { ShapExplanation } from '@/components/shap-explanation'
import { verifyClaim, type VerificationResult } from '@/lib/verify'

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const handleVerify = async (claim: string) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await verifyClaim(claim)
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleTryAgain = () => {
    setResult(null)
    setError(null)
  }

  const verified = result !== null

  const AdBox = ({ label }: { label: string }) => (
    <div className="border border-hairline bg-card p-4 h-full">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        {/* AD SPACE — {label} */}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      <main className="flex flex-1 w-full gap-6 px-5 sm:px-6 lg:gap-8">
        {/* Left ad */}
        <aside className="hidden h-full lg:block flex-shrink-0 w-72">
          <div className="sticky top-0 h-[calc(100vh-120px)] mt-4 mb-4">
            <AdBox label="left" />
          </div>
        </aside>

        {/* Center content */}
        <div className="flex flex-1 flex-col overflow-y-auto max-w-3xl mx-auto w-full">
          <Masthead />

          <ClaimInput
            onVerify={handleVerify}
            verified={verified}
            loading={loading}
          />

          {/* Loading state */}
          {loading && (
            <div className="py-8 flex flex-col items-center gap-3 animate-slide-in-up">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-2 h-2 rounded-full bg-forest animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
                Querying sources &amp; running model…
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="py-6 border border-red-200 bg-red-50 px-4 animate-slide-in-up">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-red-600 mb-1">
                Verification failed
              </p>
              <p className="font-serif text-sm text-red-700">{error}</p>
              <button
                onClick={handleTryAgain}
                className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-red-600 underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Mobile ad */}
          {verified && (
            <div className="mb-6 lg:hidden">
              <AdBox label="mobile" />
            </div>
          )}

          {/* Results */}
          {verified && result && (
            <>
              <VerdictResult
                verified={verified}
                verdict={result.verdict}
                confidence={result.confidence}
                explanation={result.explanation}
              />
              <EvidenceLedger evidence={result.evidence} />
              <ShapExplanation onTryAgain={handleTryAgain} />
            </>
          )}
        </div>

        {/* Right ad */}
        <aside className="hidden h-full lg:block flex-shrink-0 w-72">
          <div className="sticky top-0 h-[calc(100vh-120px)] mt-4 mb-4">
            <AdBox label="right" />
          </div>
        </aside>
      </main>

      <footer className="border-t border-hairline px-5 py-6 sm:px-6">
        <p className="mx-auto max-w-3xl text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          ClimateCred · Retrieval-augmented verification · Evidence drawn from
          peer-reviewed climate literature
        </p>
      </footer>
    </div>
  )
}
