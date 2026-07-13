# verify_claim.py
# ---------------------------------------------------------------------------
# FastAPI router — imports ML logic from ml_core, never from main.py
# ---------------------------------------------------------------------------
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ml_core import verify_claim_unified
from shap_core import explain_prediction
import numpy as np

router = APIRouter()


class ClaimRequest(BaseModel):
    claim: str
    num_per_source: int = 3


class ExplainRequest(BaseModel):
    claim: str
    evidence: str


@router.post("/verify-claim")
async def verify_claim(request: ClaimRequest):
    if not request.claim.strip():
        raise HTTPException(status_code=422, detail="Claim cannot be empty.")

    result = verify_claim_unified(request.claim, request.num_per_source)

    # verify_claim_unified returns a string only when all sources fail
    if isinstance(result, str):
        raise HTTPException(status_code=502, detail=result)

    return result


@router.post("/explain")
async def explain(request: ExplainRequest):
    """
    Run SHAP on a (claim, evidence) pair and return per-token attributions
    for the predicted class.

    Response shape:
    {
      "predicted_label": "SUPPORTS" | "REFUTES" | "NOT_ENOUGH_INFO",
      "confidence": 0.87,
      "tokens": [
        { "text": "carbon", "shap_value": 0.32, "label": "SUPPORTS" },
        ...
      ]
    }
    """
    claim = request.claim.strip()
    evidence = request.evidence.strip()

    if not claim or not evidence:
        raise HTTPException(
            status_code=422, detail="Both claim and evidence must be non-empty."
        )

    try:
        shap_values, predicted_class_idx = explain_prediction(claim, evidence)
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"SHAP explanation failed: {str(exc)}"
        )

    from shap_core import LABEL_MAP, predict_sentence_pair

    # Confidence from direct model call (already done inside explain_prediction,
    # but we re-use the raw probs for the response).
    probs = predict_sentence_pair([(claim, evidence)])[0]
    confidence = float(probs[predicted_class_idx])
    predicted_label = LABEL_MAP[predicted_class_idx]

    # shap_values is a shap.Explanation object.
    # .values shape: (1, num_tokens, num_classes)
    # .data[0] contains the token strings.
    values = shap_values.values[0]          # (num_tokens, num_classes)
    tokens = shap_values.data[0]            # list of token strings

    token_list = []
    for token_text, token_vals in zip(tokens, values):
        token_list.append(
            {
                "text": str(token_text),
                # Attribution for the predicted class (float, can be negative)
                "shap_value": float(token_vals[predicted_class_idx]),
                # Also expose per-class values so the frontend can switch views
                "shap_per_class": {
                    LABEL_MAP[i]: float(v) for i, v in enumerate(token_vals)
                },
            }
        )

    return {
        "predicted_label": predicted_label,
        "confidence": confidence,
        "tokens": token_list,
    }
