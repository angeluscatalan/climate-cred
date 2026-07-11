# ml_core.py
# ---------------------------------------------------------------------------
# All ML / data-fetching logic lives here.
# Both main.py and verify_claim.py import FROM this file — never the reverse.
# ---------------------------------------------------------------------------

import os
import pandas as pd
import numpy as np
import torch
import torch.nn.functional as F
import requests
import spacy
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from exa_py import Exa
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
C_API_TOKEN = os.getenv("C_API_TOKEN")
MODEL_ID = "RCSCode/Climate_Cred"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_ID, token=HF_TOKEN
).to(device)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=HF_TOKEN)

nlp = spacy.load("en_core_web_sm")

LABEL_MAP = {0: "REFUTES", 1: "SUPPORTS", 2: "NOT_ENOUGH_INFO"}


# ---------------------------------------------------------------------------
# NLI helpers
# ---------------------------------------------------------------------------

def perform_nli(claim: str, evidence: str) -> tuple[int, float]:
    """Run the NLI model and return (label_index, confidence_percent)."""
    inputs = tokenizer(
        claim,
        evidence,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=512,
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = F.softmax(outputs.logits, dim=-1)

    prediction = torch.argmax(probs, dim=-1).item()
    confidence = probs[0][prediction].item() * 100
    return prediction, confidence


def extract_main_subject(text: str) -> dict:
    doc = nlp(text)
    chunks = [chunk.text for chunk in doc.noun_chunks]
    subjects = [token.text for token in doc if "subj" in token.dep_]

    # Build a meaningful search query — prefer the full claim trimmed to
    # 80 chars rather than a single short noun phrase like "decade"
    short_claim = text.strip().rstrip(".")
    search_query = short_claim if len(short_claim) <= 80 else " ".join(short_claim.split()[:10])

    return {"main_subjects": subjects, "noun_phrases": chunks, "search_query": search_query}


# ---------------------------------------------------------------------------
# Per-source fetchers
# ---------------------------------------------------------------------------

def verify_with_currents(user_claim: str, num_articles: int = 10) -> pd.DataFrame | str:
    extracted = extract_main_subject(user_claim)
    search_query = extracted["noun_phrases"][0] if extracted["noun_phrases"] else user_claim

    res = requests.get(
        "https://api.currentsapi.services/v1/search",
        params={"keywords": search_query, "language": "en", "apiKey": C_API_TOKEN},
    )
    news_data = res.json().get("news", [])

    if not news_data and extracted["main_subjects"]:
        fallback_query = extracted["main_subjects"][0]
        res = requests.get(
            "https://api.currentsapi.services/v1/search",
            params={"keywords": fallback_query, "language": "en", "apiKey": C_API_TOKEN},
        )
        news_data = res.json().get("news", [])

    if not news_data:
        return f"No relevant news articles found for '{search_query}'."

    results = []
    for article in news_data[:num_articles]:
        evidence = f"{article['title']}. {article['description']}"
        pred_idx, conf = perform_nli(user_claim, evidence)
        results.append(
            {
                "source": "CurrentsAPI",
                "title": article["title"],
                "verdict": LABEL_MAP[pred_idx],
                "confidence": conf,
                "url": article["url"],
                "evidence_used": article["title"],
            }
        )
    return pd.DataFrame(results)


def verify_with_gnews(user_claim: str, num_articles: int = 5) -> pd.DataFrame | str:
    extracted = extract_main_subject(user_claim)
    search_query = extracted["noun_phrases"][0] if extracted["noun_phrases"] else user_claim

    GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
    url = (
        f"https://gnews.io/api/v4/search"
        f"?q={search_query}&lang=en&max={num_articles}&apikey={GNEWS_API_KEY}"
    )
    data = requests.get(url).json()
    articles = data.get("articles", [])

    if not articles:
        return f"No results found on GNews for '{search_query}'."

    results = []
    for article in articles:
        evidence = f"{article['title']}. {article['description']}"
        pred_idx, conf = perform_nli(user_claim, evidence)
        results.append(
            {
                "source": "GNews",
                "title": article["title"],
                "verdict": LABEL_MAP[pred_idx],
                "confidence": conf,
                "url": article["url"],
                "evidence_used": article["title"],
            }
        )
    return pd.DataFrame(results)


def verify_with_exa(user_claim: str, num_articles: int = 5) -> pd.DataFrame | str:
    exa = Exa(os.getenv("EXA_API_KEY"))
    result_exa = exa.search(
        user_claim,
        num_results=num_articles,
        type="auto",
        contents={"highlights": True, "category": "research paper"},
    )

    results = []
    for res in result_exa.results:
        full_highlight = " ".join(res.highlights) if res.highlights else ""
        evidence = (
            full_highlight.split(". ")[0] + "." if ". " in full_highlight else full_highlight
        )
        pred_idx, conf = perform_nli(user_claim, evidence)
        results.append(
            {
                "source": "Exa",
                "title": res.title,
                "verdict": LABEL_MAP[pred_idx],
                "confidence": conf,
                "url": res.url,
                "evidence_used": evidence,
            }
        )
    return pd.DataFrame(results)


# ---------------------------------------------------------------------------
# Unified verifier — returns a list of dicts (JSON-friendly)
# ---------------------------------------------------------------------------

def verify_claim_unified(claim: str, num_per_source: int = 5) -> list[dict] | str:
    all_dfs = []

    for fetch_fn in (verify_with_currents, verify_with_gnews, verify_with_exa):
        result = fetch_fn(claim, num_per_source)
        if isinstance(result, pd.DataFrame):
            all_dfs.append(result)

    if not all_dfs:
        return "No results found across any APIs."

    master_df = pd.concat(all_dfs, ignore_index=True)

    # Keep only decisive verdicts
    significant = master_df[master_df["verdict"] != "NOT_ENOUGH_INFO"].copy()

    if significant.empty:
        return master_df.to_dict(orient="records")

    return significant.to_dict(orient="records")
