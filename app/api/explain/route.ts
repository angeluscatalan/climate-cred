// app/api/explain/route.ts
// ---------------------------------------------------------------------------
// Proxies POST /api/explain → FastAPI POST /explain
// Keeps the FastAPI URL server-side; never leaks to the browser.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (
      !body.claim ||
      typeof body.claim !== 'string' ||
      !body.evidence ||
      typeof body.evidence !== 'string'
    ) {
      return NextResponse.json(
        { detail: 'Both claim and evidence must be non-empty strings.' },
        { status: 422 },
      )
    }

    const upstream = await fetch(`${FASTAPI_URL}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claim: body.claim.trim(),
        evidence: body.evidence.trim(),
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/explain]', err)
    return NextResponse.json(
      { detail: 'Failed to reach the SHAP explanation backend.' },
      { status: 503 },
    )
  }
}
