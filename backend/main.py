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


class DiscoveryRequest(BaseModel):
    """Input model for discovery question generation."""
    business_name: str
    industry: str


class DiscoveryResponse(BaseModel):
    """Response model for discovery question."""
    question: str


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    return {"message": "VectorWeb Labs API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vectorweb-api"}


# ══════════════════════════════════════════════════════════════════════════════
# DOMAIN ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.post("/api/check-domain", response_model=DomainCheckResponse)
async def check_domain(request: DomainCheckRequest):
    """
    Check if a domain is available.
    If taken, returns AI-generated alternative suggestions.
    """
    result = domains.check_availability(request.domain, request.vibe)
    return DomainCheckResponse(**result)


# ══════════════════════════════════════════════════════════════════════════════
# PROJECT ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/api/projects", response_model=list[Project])
async def get_projects(user_id: str):
    """Get all projects for a user."""
    return db.get_projects_by_user(user_id)


@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Fetch a single project by ID."""
    project = db.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.post("/api/projects", response_model=ProjectResponseFull)
async def create_project(project: ProjectCreate):
    """
    Create a new project in the database.
    
    1. Save project to Supabase via db.create_project
    2. Generate AI price quote via ai.generate_quote
    3. Update the project row with the AI quote
    4. Return the full project object with the price
    """
    # Step 1: Create the project
    project_data = project.model_dump()
    project_id = db.create_project(project_data)
    
    # Step 2: Generate AI quote
    ai_quote = ai.generate_quote({
        "business_name": project.business_name,
        "website_type": project.website_type or "Portfolio",
        "target_audience": project.target_audience or "General",
        "vibe_style": project.vibe_style,
        "project_scope": project.project_scope
    })
    
    # Step 3: Update project with AI quote (graceful - may fail if migration not applied)
    try:
        db.update_project(project_id, {"ai_price_quote": ai_quote})
    except Exception as e:
        # Log but don't fail - the project was created successfully
        print(f"Warning: Could not save AI quote to database (migration may not be applied): {e}")
    
    # Step 4: Return response with quote
    return ProjectResponseFull(
        project_id=project_id,
        status="success",
        ai_quote=ai_quote
    )


@app.post("/api/discovery", response_model=DiscoveryResponse)
async def generate_discovery(request: DiscoveryRequest):
    """Generate a technical discovery question."""
    question = ai.generate_discovery_question(request.business_name, request.industry)
    return DiscoveryResponse(question=question)


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
