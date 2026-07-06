// ===========================================================================
// BACKEND SEAM — Database, server functions, and AI model integration
// ===========================================================================
//
// This file is the single place to wire up the backend. Nothing in the UI
// calls it yet (the prototype is static). When you are ready to go live:
//
//   1. AI MODEL / VERIFICATION
//      Implement `verifyClaim` to call your model (RAG pipeline, FastAPI
//      endpoint, AI SDK, etc.). It should return a `VerificationResult`.
//
//   2. DATABASE / RETRIEVAL
//      Inside the backend that powers `verifyClaim`, query your vector store /
//      Postgres for the supporting passages and return them as `Evidence[]`.
//
//   3. FRONTEND HOOK-UP
//      In app/page.tsx, make the page interactive (or a Server Component that
//      awaits this), then pass the result into <VerdictResult /> and
//      <EvidenceLedger />. See the FRONTEND comment markers in those files.
//
// ---------------------------------------------------------------------------

export type Verdict = 'SUPPORTS' | 'REFUTES' | 'INSUFFICIENT'

export type ExplanationToken = {
  text: string
  /** salience 0–1; >0.4 gets highlighted in the Token-Level Explanation */
  weight: number
}

export type Evidence = {
  rank: number
  similarity: number // cosine similarity 0–1
  text: string
  citation: string
}

export type VerificationResult = {
  claim: string
  verdict: Verdict
  confidence: number // 0–100
  explanation: ExplanationToken[]
  evidence: Evidence[]
}

// Example implementation against a FastAPI / route handler backend:
//
// export async function verifyClaim(claim: string): Promise<VerificationResult> {
//   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ claim }),
//   })
//   if (!res.ok) throw new Error('Verification failed')
//   return res.json() as Promise<VerificationResult>
// }
