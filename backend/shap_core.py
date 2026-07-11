import os
import torch
import spacy
from transformers import AutoModelForSequenceClassification, AutoTokenizer
import shap
import numpy as np

HF_TOKEN = userdata.get('HF_TOKEN_WRITE')
MODEL_ID = "RCSCode/Climate_Cred"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_ID, token=HF_TOKEN
).to(device)
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, token=HF_TOKEN)

nlp = spacy.load("en_core_web_sm")

LABEL_MAP = {0: "REFUTES", 1: "SUPPORTS", 2: "NOT_ENOUGH_INFO"}

def predict_sentence_pair(text_pairs):
    """
    SHAP passes an array of text strings. For cross-sentence tasks, 
    we separate the paired sentences back out to feed RoBERTa properly.
    """
    # Parse the strings back into individual sequences if passed as paired list
    first_sentences = [pair[0] if isinstance(pair, (tuple, list)) else pair for pair in text_pairs]
    second_sentences = [pair[1] if isinstance(pair, (tuple, list)) and len(pair) > 1 else "" for pair in text_pairs]
    
    inputs = tokenizer(
        first_sentences, 
        second_sentences, 
        padding=True, 
        truncation=True, 
        return_tensors="pt"
    ).to(device)
    
    with torch.no_grad():
        outputs = model(**inputs)
        
    probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
    return probs.cpu().numpy()

explainer = shap.Explainer(
    predict_sentence_pair, 
    masker=shap.maskers.Text(tokenizer),
    output_names=[LABEL_MAP[i] for i in range(len(LABEL_MAP))]
)



# ---------------------------------------------------------------------------
# Call this function with a pair of sentences to get SHAP values and the predicted class index
# ---------------------------------------------------------------------------
def explain_prediction(sentence_1, sentence_2):
    # Combine into a single sequence input structure for SHAP's text layout
    # RoBERTa tokenizer natively handles string pairs when wrapped this way
    raw_pair = [(sentence_1, sentence_2)]
    
    # Extract the already predicted values first
    probabilities = predict_sentence_pair(raw_pair)[0]
    predicted_class_idx = np.argmax(probabilities)
    predicted_label = LABEL_MAP[predicted_class_idx]
    confidence = probabilities[predicted_class_idx]
    
    print(f"Pre-predicted Label: {predicted_label} ({confidence*100:.2f}% confidence)")
    
    # Generate token attributions 
    # Passing the exact joint tuple structure to match the masker expectations
    shap_values = explainer([f"{sentence_1} {tokenizer.sep_token} {sentence_2}"])
    
    return shap_values, predicted_class_idx