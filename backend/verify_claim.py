# verify_claim.py
# ---------------------------------------------------------------------------
# FastAPI router — imports ML logic from ml_core, never from main.py
# ---------------------------------------------------------------------------
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ml_core import verify_claim_unified

router = APIRouter()


class ClaimRequest(BaseModel):
    claim: str
    num_per_source: int = 5


@router.post("/verify-claim")
async def verify_claim(request: ClaimRequest):
    if not request.claim.strip():
        raise HTTPException(status_code=422, detail="Claim cannot be empty.")

    result = verify_claim_unified(request.claim, request.num_per_source)

    # verify_claim_unified returns a string only when all sources fail
    if isinstance(result, str):
        raise HTTPException(status_code=502, detail=result)

    return result
