# main.py
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from verify_claim import router as verify_router

load_dotenv()

app = FastAPI(title="ClimateCred API")

# ---------------------------------------------------------------------------
# CORS — allow the Next.js dev server and any production origin you deploy to
# ---------------------------------------------------------------------------
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", ""),  # set in production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],  # filter empty strings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify_router)


@app.get("/")
async def root():
    return {"message": "Welcome to the ClimateCred Verification API"}
