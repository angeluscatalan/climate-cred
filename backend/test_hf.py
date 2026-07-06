from dotenv import load_dotenv
import os

load_dotenv(override=True)

token = os.getenv("HF_TOKEN", "")
print(f"Token: {token[:12]}... (len={len(token)})")

from huggingface_hub import HfApi
api = HfApi(token=token)

try:
    info = api.repo_info("RCSCode/Climate_Cred")
    print(f"Repo found: {info.id} | private: {info.private}")
except Exception as e:
    print(f"Error: {e}")
