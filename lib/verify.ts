// lib/verify.ts
// ---------------------------------------------------------------------------
// Single seam between the UI and the FastAPI backend.
// All components import types and verifyClaim from here.
// ---------------------------------------------------------------------------

export type Verdict = "SUPPORTS" | "REFUTES" | "INSUFFICIENT";

export type ExplanationToken = {
  text: string;
  /** salience 0–1; >0.4 gets highlighted */
  weight: number;
};

export type Evidence = {
  rank: number;
  source: string;
  title: string;
  verdict: Verdict;
  /** 0–100 */
  confidence: number;
  url: string;
  evidence_used: string;
};

export type VerificationResult = {
  claim: string;
  verdict: Verdict;
  /** 0–100 — average confidence across supporting/refuting evidence */
  confidence: number;
  explanation: ExplanationToken[];
  evidence: Evidence[];
};

// ---------------------------------------------------------------------------
// Raw shape returned by the FastAPI /verify-claim endpoint
// ---------------------------------------------------------------------------
type RawEvidenceItem = {
  source: string;
  title: string;
  verdict: string;
  confidence: number;
  url: string;
  evidence_used: string;
};

// ---------------------------------------------------------------------------
// Map the flat list from the backend into a structured VerificationResult.
// The backend returns one row per article; we derive the overall verdict by
// majority vote among SUPPORTS / REFUTES rows.
// ---------------------------------------------------------------------------
function mapToResult(
  claim: string,
  rows: RawEvidenceItem[],
): VerificationResult {
  const normalize = (v: string): Verdict => {
    if (v === "SUPPORTS") return "SUPPORTS";
    if (v === "REFUTES") return "REFUTES";
    return "INSUFFICIENT";
  };

  const evidence: Evidence[] = rows.map((row, i) => ({
    rank: i + 1,
    source: row.source,
    title: row.title,
    verdict: normalize(row.verdict),
    confidence: row.confidence,
    url: row.url,
    evidence_used: row.evidence_used,
  }));

  // Majority-vote overall verdict
  const counts: Record<Verdict, number> = {
    SUPPORTS: 0,
    REFUTES: 0,
    INSUFFICIENT: 0,
  };
  for (const e of evidence) counts[e.verdict]++;

  let verdict: Verdict = "INSUFFICIENT";
  if (counts.SUPPORTS > counts.REFUTES) verdict = "SUPPORTS";
  else if (counts.REFUTES > counts.SUPPORTS) verdict = "REFUTES";

  // Average confidence of decisive rows only
  const decisiveRows = evidence.filter((e) => e.verdict === verdict);
  const confidence =
    decisiveRows.length > 0
      ? Math.round(
          decisiveRows.reduce((sum, e) => sum + e.confidence, 0) /
            decisiveRows.length,
        )
      : 0;

  // Simple token-level explanation: split the claim into words and assign
  // a weight based on whether any evidence_used text contains that word.
  const claimWords = claim.split(/\s+/);
  const allEvidenceText = rows
    .map((r) => r.evidence_used.toLowerCase())
    .join(" ");
  const explanation: ExplanationToken[] = claimWords.map((word) => ({
    text: word,
    weight: allEvidenceText.includes(word.toLowerCase().replace(/[^a-z]/g, ""))
      ? 0.8
      : 0.1,
  }));

  return { claim, verdict, confidence, explanation, evidence };
}

// ---------------------------------------------------------------------------
// Public API — call this from any component or page
// ---------------------------------------------------------------------------
export async function verifyClaim(claim: string): Promise<VerificationResult> {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ claim }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ?? "Verification failed",
    );
  }

  const rows: RawEvidenceItem[] = await res.json();
  return mapToResult(claim, rows);
}
