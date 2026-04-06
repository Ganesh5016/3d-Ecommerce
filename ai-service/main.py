"""
LUXE AI Recommendation Microservice
FastAPI-based service for product recommendations and semantic search
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import json
import os
import uvicorn

app = FastAPI(title="LUXE AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────────────────────────────

class RecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    product_id: Optional[str] = None
    category: Optional[str] = None
    limit: int = 8

class SearchRequest(BaseModel):
    query: str
    limit: int = 10

class ChatRequest(BaseModel):
    message: str
    context: Optional[List[dict]] = []

# ─── Sample product data (in production, fetch from MongoDB) ──────────────────

SAMPLE_PRODUCTS = [
    {"id": "1", "name": "Aurora Headphones", "category": "electronics", "price": 18999, "tags": ["audio", "wireless", "ai"], "embedding": [0.8, 0.2, 0.1, 0.5]},
    {"id": "2", "name": "Silk Noir Dress", "category": "fashion", "price": 12500, "tags": ["luxury", "silk", "evening"], "embedding": [0.1, 0.9, 0.2, 0.3]},
    {"id": "3", "name": "Crystal Serum", "category": "beauty", "price": 4299, "tags": ["skincare", "gold", "antiaging"], "embedding": [0.2, 0.3, 0.9, 0.1]},
    {"id": "4", "name": "SmartWatch Pro", "category": "electronics", "price": 32999, "tags": ["smartwatch", "health", "gps"], "embedding": [0.7, 0.1, 0.1, 0.8]},
    {"id": "5", "name": "Cashmere Blazer", "category": "fashion", "price": 9800, "tags": ["luxury", "cashmere", "formal"], "embedding": [0.2, 0.8, 0.1, 0.3]},
]

# ─── Cosine similarity ────────────────────────────────────────────────────────

def cosine_similarity(a: list, b: list) -> float:
    a, b = np.array(a), np.array(b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "LUXE AI", "version": "1.0.0"}

@app.post("/recommendations")
def get_recommendations(req: RecommendationRequest):
    """Get product recommendations using collaborative filtering"""
    products = SAMPLE_PRODUCTS

    if req.category:
        products = [p for p in products if p["category"] == req.category]

    if req.product_id:
        # Content-based: find similar products by embedding
        base = next((p for p in SAMPLE_PRODUCTS if p["id"] == req.product_id), None)
        if base:
            scored = [(p, cosine_similarity(base["embedding"], p["embedding"])) for p in SAMPLE_PRODUCTS if p["id"] != req.product_id]
            scored.sort(key=lambda x: x[1], reverse=True)
            products = [p for p, _ in scored[:req.limit]]
        else:
            products = SAMPLE_PRODUCTS[:req.limit]
    else:
        products = products[:req.limit]

    return {"success": True, "recommendations": products, "count": len(products)}

@app.post("/search")
def semantic_search(req: SearchRequest):
    """AI-powered semantic search with fuzzy matching"""
    query = req.query.lower()
    results = []

    for product in SAMPLE_PRODUCTS:
        score = 0.0
        name_lower = product["name"].lower()
        cat_lower = product["category"].lower()
        tags_lower = [t.lower() for t in product["tags"]]

        # Exact match
        if query in name_lower:
            score += 1.0
        if query in cat_lower:
            score += 0.8
        if any(query in t for t in tags_lower):
            score += 0.6

        # Fuzzy: check if any word in query matches
        for word in query.split():
            if len(word) > 2:
                if word in name_lower:
                    score += 0.4
                if any(word in t for t in tags_lower):
                    score += 0.2

        if score > 0:
            results.append({"product": product, "score": round(score, 3)})

    results.sort(key=lambda x: x["score"], reverse=True)
    return {
        "success": True,
        "query": req.query,
        "results": [r["product"] for r in results[:req.limit]],
        "count": len(results),
    }

@app.post("/typo-correct")
def typo_correction(body: dict):
    """Basic typo correction using common substitutions"""
    query = body.get("query", "")
    corrections = {
        "headphon": "headphones", "heeadphones": "headphones",
        "drss": "dress", "parfum": "perfume",
        "smartwach": "smartwatch", "jewlery": "jewelry",
    }
    corrected = query.lower()
    for wrong, right in corrections.items():
        corrected = corrected.replace(wrong, right)
    return {"original": query, "corrected": corrected, "changed": corrected != query.lower()}

@app.post("/trending")
def get_trending(body: dict = {}):
    """Get trending products (simulated)"""
    trending = sorted(SAMPLE_PRODUCTS, key=lambda x: x["price"], reverse=True)
    return {"success": True, "trending": trending[:5]}

@app.post("/price-prediction")
def predict_optimal_price(body: dict):
    """Basic price prediction (rule-based simulation)"""
    category = body.get("category", "electronics")
    current_price = body.get("current_price", 1000)
    demand_score = body.get("demand_score", 0.5)

    # Simple dynamic pricing rule
    multiplier = 1.0
    if demand_score > 0.8:
        multiplier = 1.15  # High demand → increase price
    elif demand_score < 0.3:
        multiplier = 0.90  # Low demand → decrease price

    suggested_price = round(current_price * multiplier, -2)
    return {
        "current_price": current_price,
        "suggested_price": suggested_price,
        "change_percent": round((multiplier - 1) * 100, 1),
        "reason": "High demand detected" if demand_score > 0.8 else "Low demand — suggest discount" if demand_score < 0.3 else "Optimal price range",
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
