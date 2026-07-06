from dotenv import load_dotenv
import os

load_dotenv(override=True)

token = os.getenv("HF_TOKEN", "")
print(f"Token length: {len(token)}")
print(f"Token starts with: '{token[:10]}'")
print(f"Has leading space: {token != token.strip()}")
