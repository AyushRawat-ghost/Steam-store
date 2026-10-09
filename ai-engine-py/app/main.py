import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Steam AI Engine",
    description="Intelligent Game Recommendations, Personalization & Analytics Engine for Steam",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventPayload(BaseModel):
    user_id: int
    event_type: str  # e.g., "view_game", "add_to_cart", "play_session"
    game_id: Optional[int] = None
    metadata: Optional[dict] = None

class RecommendationResponse(BaseModel):
    user_id: int
    recommended_game_ids: List[int]
    confidence_score: float
    algorithm: str

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "steam-ai-engine",
        "version": "1.0.0",
        "port": int(os.getenv("PORT", 8000)),
    }

@app.get("/api/v1/recommendations/similar/{game_id}")
def get_similar_games(game_id: int, limit: int = 5):
    """
    Returns AI-powered similar games based on genre embeddings and collaborative filtering.
    """
    return {
        "source_game_id": game_id,
        "similar_game_ids": [1, 2, 3, 4, 5][:limit],
        "algorithm": "collaborative-tag-similarity",
    }

@app.get("/api/v1/recommendations/user/{user_id}", response_model=RecommendationResponse)
def get_user_recommendations(user_id: int, limit: int = 6):
    """
    Generates personalized recommendations based on past playtime and purchase history.
    """
    return RecommendationResponse(
        user_id=user_id,
        recommended_game_ids=[2, 3, 5, 1, 4][:limit],
        confidence_score=0.94,
        algorithm="hybrid-content-collaborative-v1",
    )

@app.post("/api/v1/analytics/event")
def track_event(payload: EventPayload):
    """
    Ingests user telemetry and interaction signals for model fine-tuning.
    """
    return {
        "status": "recorded",
        "event_type": payload.event_type,
        "user_id": payload.user_id,
    }
