// app/api/verify/route.ts
// ---------------------------------------------------------------------------
// Proxies POST /api/verify → FastAPI POST /verify-claim
// Keeps the FastAPI URL server-side so it never leaks to the browser,
// and avoids CORS issues in production.
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from 'next/server'

const FASTAPI_URL = process.env.FASTAPI_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.claim || typeof body.claim !== 'string' || !body.claim.trim()) {
      return NextResponse.json({ detail: 'Claim cannot be empty.' }, { status: 422 })
    }

    // --- CLIMATE KEYWORD FILTER ---
    // Checks the claim against common environmental keywords before sending to backend
    const climateRegex = /\b(climate|climate change|carbon|emission|emissions|warming|co2|greenhouse|fossil|temperature|environment|environmental|methane|renewable|solar|wind|coal|oil|gas|petroleum|hydro|nuclear|biodiversity|deforestation|forest|ocean|glacier|ice|sea level|coral|ecology|ecosystem|extinction|pollution|ozone|smog|sustainability|sustainable|net-zero|net zero|offset|footprint|mitigation|adaptation|drought|flood|hurricane|wildfire|heatwave)\b/i;    
    if (!climateRegex.test(body.claim)) {
      return NextResponse.json(
        { detail: 'Please enter a statement related to climate or the environment.' }, 
        { status: 400 }
      )
    }
    // ------------------------------

    const upstream = await fetch(`${FASTAPI_URL}/verify-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claim: body.claim.trim(),
        num_per_source: body.num_per_source ?? 3,
      }),
    })

    const data = await upstream.json()

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/verify]', err)
    return NextResponse.json(
      { detail: 'Failed to reach the verification backend.' },
      { status: 503 },
    )
  }
}