from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import auth, stores, orders, users, bags

app = FastAPI(title="Too Good To Go API", version="2.0")

# Read an allowed origin from .env, or use a default list
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",  # 👈 Keeps you covered for your current session!
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(stores.router, prefix="/stores", tags=["stores"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(bags.router, prefix="/bags", tags=["bags"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "tgtg-api"}
