// ===========================================================================
// FRONTEND — Page layout (prototype)
// The ONLY interactive behavior: clicking "Verify Claim" reveals the Verdict.
// Everything else (Evidence, Token-Level Explanation) stays as empty headers.
// To make it fully live, fetch from the BACKEND (lib/verify.ts) and pass real
// data down into <VerdictResult />, the Token-Level Explanation, and <EvidenceLedger />.
// ===========================================================================

'use client'

import { useState } from 'react'
import { Masthead } from '@/components/masthead'
import { ClaimInput } from '@/components/claim-input'
import { VerdictResult } from '@/components/verdict-result'
import { EvidenceLedger } from '@/components/evidence-ledger'
import { ShapExplanation } from '@/components/shap-explanation'

export default function Page() {
  const [verified, setVerified] = useState(false)

  const AdBox = ({ label }: { label: string }) => (
    <div className="border border-hairline bg-card p-4 h-full">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
        {/* AD SPACE GOES HERE - {label} */}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      <main className="flex flex-1 w-full gap-6 px-5 sm:px-6 lg:gap-8">
        {/* Left ad box - full height on desktop */}
        <aside className="hidden h-full lg:block flex-shrink-0 w-72">
          <div className="sticky top-0 h-[calc(100vh-120px)] mt-4 mb-4">
            <AdBox label="left" />
          </div>
        </aside>

        {/* Center content - centered */}
        <div className="flex flex-1 flex-col overflow-y-auto max-w-3xl mx-auto w-full">
          <Masthead />
          <ClaimInput onVerify={() => setVerified(true)} verified={verified} />

          {/* Mobile ad box - show above verdict when verified */}
          {verified && (
            <div className="mb-6 lg:hidden">
              <AdBox label="mobile" />
            </div>
          )}

          {verified && (
            <>
              <VerdictResult verified={verified} />
              <EvidenceLedger />
              <ShapExplanation onTryAgain={() => setVerified(false)} />
            </>
          )}
        </div>

        {/* Right ad box - full height on desktop */}
        <aside className="hidden h-full lg:block flex-shrink-0 w-72">
          <div className="sticky top-0 h-[calc(100vh-120px)] mt-4 mb-4">
            <AdBox label="right" />
          </div>
        </aside>
      </main>

      {/* Footer - always at bottom */}
      <footer className="border-t border-hairline px-5 py-6 sm:px-6">
        <p className="mx-auto max-w-3xl text-center font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted">
          ClimateCred · Retrieval-augmented verification · Evidence drawn from
          peer-reviewed climate literature
        </p>
      </footer>
    </div>
  )
}
