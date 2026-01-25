"""
VectorWeb Labs - FastAPI Backend
Main application entry point with API routes.
"""

import os
from typing import Optional, Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import services
import db
import ai
import domains

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="VectorWeb Labs API",
    description="Python backend for VectorWeb Labs",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ══════════════════════════════════════════════════════════════════════════════

class ProjectCreate(BaseModel):
    """Input model for creating a new project."""
    business_name: str
    vibe_style: str  # 'modern', 'classic', or 'bold'
    user_id: str
    domain_choice: str
    client_phone: Optional[str] = None
    website_type: Optional[str] = None
    target_audience: Optional[str] = None
    project_scope: Optional[dict] = None


class ProjectResponseFull(BaseModel):
    """Full response model for project creation with AI quote."""
    project_id: str
    status: str
    ai_quote: Optional[dict] = None


class Project(BaseModel):
    """Full project model for API responses."""
    id: str
    business_name: str
    vibe_style: str
    domain_choice: str
    status: str
    created_at: str
    user_id: Optional[str] = None
    client_phone: Optional[str] = None
    website_type: Optional[str] = None
    target_audience: Optional[str] = None
    deposit_paid: Optional[bool] = False
    project_scope: Optional[dict] = None
    ai_price_quote: Optional[dict] = None

    class Config:
        extra = "ignore"


class ChatMessage(BaseModel):
    """Input model for chat messages."""
    message: str
    project_id: str


class ChatResponse(BaseModel):
    """Response model for chat."""
    response: str


class DomainCheckRequest(BaseModel):
    """Input model for domain check."""
    domain: str
    vibe: str = "modern"


class DomainCheckResponse(BaseModel):
    """Response model for domain check."""
    available: bool
    suggestions: list[str] = []


class DiscoveryRequestNext(BaseModel):
    """Input model for the adaptive discovery engine."""
    business_name: str
    industry: str
    current_q_index: int
    previous_answers: list[dict] = []  # List of {q: str, a: str}


class DiscoveryResponseNext(BaseModel):
    """Response model for discovery question and options."""
    question: str
    options: list[str]
    allow_multiple: bool = False


# ... (existing code)


@app.post("/api/discovery/next", response_model=DiscoveryResponseNext)
async def generate_discovery_next(request: DiscoveryRequestNext):
    """
    Generate the next technical discovery question based on context.
    Acts as the 'Dungeon Master' for the scoping phase.
    """
    result = ai.generate_discovery_question(
        request.business_name, 
        request.industry, 
        request.current_q_index, 
        request.previous_answers
    )
    return DiscoveryResponseNext(**result)


@app.post("/api/projects/{project_id}/pay")
async def pay_project(project_id: str):
    """Mark a project's deposit as paid and update status to 'building'."""
    db.mark_deposit_paid(project_id)
    return {"status": "success", "message": "Payment processed"}


# ══════════════════════════════════════════════════════════════════════════════
# CHAT ROUTES (OpenRouter AI)
# ══════════════════════════════════════════════════════════════════════════════

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(chat: ChatMessage):
    """Chat with AI using OpenRouter."""
    from openai import OpenAI
    
    if not OPENROUTER_API_KEY:
        # Fallback to mock if no key provided
        import random
        import asyncio
        await asyncio.sleep(1)
        responses = [
            "Your website is currently in the development phase. The design mockups were approved last week!",
            "Based on the timeline, we're on track for the Feb 5th launch date. No blockers so far.",
            "Great question! The contact form will integrate with your existing CRM via webhook.",
            "I can see the dev team pushed 12 commits today. They're working on the checkout flow.",
            "Would you like me to schedule a review call with the team? I can find available times."
        ]
        return {"response": f"[MOCK] {random.choice(responses)}"}

    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )

        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "VectorWeb Labs",
            },
            model="meta-llama/llama-3.3-70b-instruct:free",
            messages=[
                {
                    "role": "system", 
                    "content": f"You are Scout, an AI project assistant for VectorWeb Labs. You are helping a client with their project (ID: {chat.project_id}). Be professional, concise, and helpful."
                },
                {
                    "role": "user", 
                    "content": chat.message
                }
            ]
        )
        return {"response": completion.choices[0].message.content}
        
    except Exception as e:
        print(f"Error calling OpenRouter: {e}")
        raise HTTPException(status_code=500, detail=f"AI Error: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
