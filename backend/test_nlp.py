from dotenv import load_dotenv
load_dotenv()

import spacy
nlp = spacy.load("en_core_web_sm")

claim = "The last decade was the warmest on record."

doc = nlp(claim)
chunks = [chunk.text for chunk in doc.noun_chunks]
subjects = [token.text for token in doc if "subj" in token.dep_]

print(f"Noun phrases: {chunks}")
print(f"Subjects: {subjects}")
print(f"Search query would be: '{chunks[0] if chunks else claim}'")
