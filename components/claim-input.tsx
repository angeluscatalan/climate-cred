"use client";

// ===========================================================================
// FRONTEND — Claim input (live, stateful)
// Captures the user's typed claim and passes it up via onVerify(claim).
// ===========================================================================

import { useState, KeyboardEvent } from "react";

export function ClaimInput({
  onVerify,
  verified = false,
  loading = false,
}: {
  onVerify?: (claim: string) => void;
  verified?: boolean;
  loading?: boolean;
}) {
  const [claim, setClaim] = useState("");

  const handleVerify = () => {
    if (claim.trim() && onVerify) onVerify(claim.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleVerify();
  };

  return (
    <section className="py-8 animate-slide-in-left">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-ink flex items-center gap-2">
          Claim No. 001
          {!verified && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-forest/50 animate-pulse" />
          )}
        </h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-muted">
          Enter a statement
        </span>
      </div>

      <input
        type="text"
        value={claim}
        onChange={(e) => setClaim(e.target.value.slice(0, 230))}
        onKeyDown={handleKeyDown}
        disabled={loading}
        id="claim-input"
        maxLength={230}
        placeholder="e.g. The last decade was the warmest on record."
        aria-label="Climate claim to verify"
        className="w-full border border-input bg-card px-4 py-3.5 font-serif text-lg text-ink outline-none placeholder:text-ink-muted/60 focus:border-forest focus:ring-2 focus:ring-forest/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="mt-1.5 flex justify-end">
        <span
          className={`font-mono text-[10px] tabular-nums transition-colors ${
            claim.length >= 230
              ? "text-red-500"
              : claim.length >= 200
                ? "text-amber-500"
                : "text-ink-muted/60"
          }`}
        >
          {claim.length}/230
        </span>
      </div>

      {!verified && (
        <button
          type="button"
          onClick={handleVerify}
          disabled={loading || !claim.trim()}
          id="verify-button"
          className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
        >
          {loading ? (
            <>
              Verifying
              <span
                aria-hidden
                className="text-base leading-none animate-pulse"
              >
                …
              </span>
            </>
          ) : (
            <>
              Verify Claim
              <span
                aria-hidden
                className="text-base leading-none animate-float"
                style={{ animationDuration: "2s" }}
              >
                →
              </span>
            </>
          )}
        </button>
      )}
    </section>
  );
}
