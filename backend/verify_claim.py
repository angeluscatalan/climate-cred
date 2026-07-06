# verify.py
from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
from main import verify_claim_unified 

# Create the router
router = APIRouter()

class ClaimRequest(BaseModel):
    claim: str
    num_per_source: int = 5

@router.post("/verify-claim")
async def verify_claim(request: ClaimRequest):
    result_df = verify_claim_unified(request.claim, request.num_per_source)
    if isinstance(result_df, pd.DataFrame):
        return result_df.to_dict(orient='records')
    else:
        return {"error": result_df}