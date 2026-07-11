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
from firecrawl import Firecrawl



load_dotenv()
F_CRAWL_KEY = os.getenv('F_CRAWL_KEY')
HF_TOKEN = os.getenv("HF_TOKEN")
C_API_TOKEN = os.getenv("C_API_TOKEN")
MODEL_ID = "RCSCode/Climate_Cred"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_ID, token=HF_TOKEN
).to(device)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=HF_TOKEN)
firecrawl = Firecrawl(
  api_key=F_CRAWL_KEY
)
nlp = spacy.load("en_core_web_sm")

LABEL_MAP = {0: "REFUTES", 1: "SUPPORTS", 2: "NOT_ENOUGH_INFO"}

exa_ai_prompt = "Extract a single, complete, sentence from the research paper that is most relevant to the claim. If no relevant information is found, return an empty string. Do not use ellipses or partial sentences. Return only the sentence, without any additional commentary or context."
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
# URL Crawler and Sentence Extractor
# ---------------------------------------------------------------------------
def fetch_relevant_sentence(url: str, reference_text: str) -> str:
    """
    Scrapes the provided URL and extracts the most relevant sentence 
    verbatim compared to the reference text.
    """
    extraction_format = {
        "type": "json",
        "prompt": f"Get the most relevant sentence from the page, verbatim, to the following sentence: {reference_text}"
    }
    
    try:
        result = firecrawl.scrape(
            url,
            formats=[extraction_format],
            only_main_content=False,
            timeout=1000
        )
        if hasattr(result, 'json') and result.json:
            return result.json.get('relevantSentence', reference_text)
            
    except Exception as e:
        print(f"Warning: Failed to scrape {url}. Using fallback text. Error: {e}")
        return reference_text

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
        
        # --- NEW CODE: Get the exact sentence from the article content ---
        # We use the article's title as the reference to find the best sentence
        extracted_evidence = fetch_relevant_sentence(article["url"], article["title"])
        # Fallback to original logic if the scraper returns nothing or fails
        if not extracted_evidence:
            extracted_evidence = f"{article['title']}. {article['description']}"
        pred_idx, conf = perform_nli(user_claim, extracted_evidence)
        results.append(
            {
                "source": "CurrentsAPI",
                "title": article["title"],
                "verdict": LABEL_MAP[pred_idx],
                "confidence": conf,
                "url": article["url"],
                "evidence_used": extracted_evidence,
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
        # --- NEW CODE: Get the exact sentence from the article content ---
        extracted_evidence = fetch_relevant_sentence(article["url"], article["title"])
        # Fallback to original logic if the scraper returns nothing or fails
        if not extracted_evidence:
            extracted_evidence = f"{article['title']}. {article['description']}"
        pred_idx, conf = perform_nli(user_claim, extracted_evidence)
        results.append(
            {
                "source": "GNews",
                "title": article["title"],
                "verdict": LABEL_MAP[pred_idx],
                "confidence": conf,
                "url": article["url"],
                "evidence_used": extracted_evidence,
            }
        )
    return pd.DataFrame(results)


def verify_with_exa(user_claim: str, num_articles: int = 5) -> pd.DataFrame | str:
    exa = Exa(os.getenv("EXA_API_KEY"))
    try:
        result_exa = exa.search(
            user_claim,
            num_results=num_articles,
            type="auto",
            category="research paper",
            contents={"highlights": {"query": exa_ai_prompt, "numSentences": 1, "highlightsPerUrl": 1}},
        )
    except Exception as e:
        print(f"Exa API error: {str(e)}")
        return pd.DataFrame()  # Return an empty DataFrame on error

    results = []
    for res in result_exa.results:
        full_highlight = " ".join(res.highlights) if res.highlights else ""
        if not full_highlight:
            pred_idx, conf = 2, 0.0  # NOT_ENOUGH_INFO if no highlights
            continue  
        pred_idx, conf = perform_nli(user_claim, full_highlight)
        results.append(
            {
                "source": "Exa",
                "title": res.title,
                "verdict": LABEL_MAP[pred_idx],
                "confidence": conf,
                "url": res.url,
                "evidence_used": full_highlight,
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
