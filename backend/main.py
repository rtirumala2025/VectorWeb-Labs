"""
VectorWeb Labs - FastAPI Backend
Main application entry point with API routes.
"""

import os
from typing import Optional, Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# Import services
import db
import ai
import domains
import payments
from dependencies import get_current_user

# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request, Depends
from pydantic import BaseModel, Field

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="VectorWeb Labs API",
    description="Python backend for VectorWeb Labs",
    version="1.0.0"
)

# Initialize Limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include Routers
app.include_router(payments.router)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/")
async def health_check():
    """
    Root health check endpoint.
    Returns server status and database connectivity.
    """
    db_status = "disconnected"
    db_error = None
    
    try:
        # Attempt a simple database query to verify connectivity
        result = db.supabase.table("projects").select("id").limit(1).execute()
        db_status = "connected"
    except Exception as e:
        db_error = str(e)
    
    return {
        "status": "online",
        "system": "VectorWeb Labs AI",
        "version": "1.0.0",
        "database": {
            "status": db_status,
            "error": db_error
        }
    }


# ══════════════════════════════════════════════════════════════════════════════
# PYDANTIC MODELS
# ══════════════════════════════════════════════════════════════════════════════

class ProjectCreate(BaseModel):
    """Input model for creating a new project."""
    business_name: str = Field(..., min_length=1, max_length=100)
    vibe_style: str  # 'modern', 'classic', or 'bold'
    user_id: str
    domain_choice: str
    client_phone: Optional[str] = None
    website_type: Optional[str] = None
    target_audience: Optional[str] = None
    target_audience: Optional[str] = None
    project_scope: Optional[dict] = None
    wizard_data: Optional[dict] = None


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
    wizard_step: Optional[int] = 1
    wizard_data: Optional[dict] = {}

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


class ProjectUpdate(BaseModel):
    """Model for incremental updates to project state."""
    business_name: Optional[str] = None
    vibe_style: Optional[str] = None
    domain_choice: Optional[str] = None
    wizard_step: Optional[int] = None
    wizard_data: Optional[dict] = None  # JSONB
    project_scope: Optional[dict] = None


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
    is_complete: bool = False



@app.post("/api/projects", response_model=ProjectResponseFull)
@limiter.limit("5/hour")
async def create_project(project: ProjectCreate, request: Request, user: dict = Depends(get_current_user)):
    """
    Create a new project, generate AI quote, and save to DB.
    """
    # 1. Save initial draft
    # 1. Save initial draft
    try:
        project_id = db.create_project(project.dict())
    except Exception as e:
        print(f"Error creating project draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # 2. AI Estimation (Immediate)
    quote_data = ai.generate_quote(project.dict())

    # 3. Update DB with Quote
    # 3. Update DB with Quote (Explicit Mapping)
    # STRICT MAPPING PROTOCOL
    db_update_payload = {
        "ai_price_quote": quote_data.get("price", 0),
        "ai_features": quote_data.get("features", []),
        "ai_reasoning": quote_data.get("reasoning", ""),
        "ai_suggested_stack": quote_data.get("suggested_stack", ""),
        "ai_risks": quote_data.get("risks", []),
        "discovery_notes": project.project_scope or {} 
    }
    updated_project = db.update_project(project_id, db_update_payload)

    return updated_project


@app.post("/api/projects/draft")
async def create_project_draft(user: Any = Depends(get_current_user)):
    """
    Create a new empty draft project for the wizard.
    """
    try:
        # Create minimal draft
        draft_data = {
            "business_name": "Untitled Project",
            "vibe_style": "modern", # default
            "domain_choice": "",
            "user_id": user.id,
            "status": "draft",
            "wizard_step": 1,
            "wizard_data": {}
        }
        project_id = db.create_project(draft_data)
        return {"project_id": project_id}
    except Exception as e:
        print(f"Error creating draft: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, user: Any = Depends(get_current_user)):
    """
    Fetch a single project by ID.
    """
    try:
        project = db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Access Check
        if project.get("user_id") != user.id:
             raise HTTPException(status_code=403, detail="Unauthorized")
             
        return project
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/projects/{project_id}")
async def update_project(project_id: str, update: ProjectUpdate, user: Any = Depends(get_current_user)):
    """
    Update a project incrementally.
    """
    try:
        project = db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
            
        if project.get("user_id") != user.id:
             raise HTTPException(status_code=403, detail="Unauthorized")
        
        # Filter out None values
        update_data = {k: v for k, v in update.dict().items() if v is not None}
        
        if not update_data:
            return project # No changes
            
        updated = db.update_project(project_id, update_data)
        return updated
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{project_id}/finalize")
async def finalize_project(project_id: str, user: Any = Depends(get_current_user)):
    """
    Finalize the wizard flow: Generate AI quote and mark as proposal ready.
    """
    try:
        project = db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project.get("user_id") != user.id:
             raise HTTPException(status_code=403, detail="Unauthorized")

        # Generate Quote (Force Refresh)
        quote_data = ai.generate_quote(project)
        
        # Update DB: Status -> proposal_ready
        db_update_payload = {
            "ai_price_quote": quote_data.get("price", 0),
            "ai_features": quote_data.get("features", []),
            "ai_reasoning": quote_data.get("reasoning", ""),
            "ai_suggested_stack": quote_data.get("suggested_stack", ""),
            "ai_risks": quote_data.get("risks", []),
            "status": "proposal_ready"
        }
        updated = db.update_project(project_id, db_update_payload)
        return updated

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error finalizing project {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects/{project_id}/quote")
async def generate_project_quote(project_id: str, user: Any = Depends(get_current_user)):
    """
    Generate an AI quote for an existing project.
    """
    try:
        project = db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project.get("user_id") != user.id:
             raise HTTPException(status_code=403, detail="Unauthorized")

        # Generate Quote
        quote_data = ai.generate_quote(project)
        
        # Update DB
        db_update_payload = {
            "ai_price_quote": quote_data.get("price", 0),
            "ai_features": quote_data.get("features", []),
            "ai_reasoning": quote_data.get("reasoning", ""),
            "ai_suggested_stack": quote_data.get("suggested_stack", ""),
            "ai_risks": quote_data.get("risks", []),
            "status": "quoted" # Update status to quoted
        }
        updated = db.update_project(project_id, db_update_payload)
        return updated

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating quote for {project_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/projects", response_model=list[Project])
async def list_projects(user: Any = Depends(get_current_user)):
    """
    Fetch all projects for the authenticated user.
    """
    try:
        return db.get_projects_by_user(user.id)
    except Exception as e:
        print(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/check-domain", response_model=DomainCheckResponse)
@limiter.limit("10/minute")
async def check_domain(request: Request, body: DomainCheckRequest):
    """
    Check availability of a domain.
    """
    try:
        result = domains.check_availability(body.domain, body.vibe)
        return result
    except Exception as e:
        print(f"Error checking domain {body.domain}: {e}")
        raise HTTPException(status_code=500, detail=str(e))



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
# VECTORBOT CHAT (Context-Aware AI Assistant)
# ══════════════════════════════════════════════════════════════════════════════

class ChatHistoryMessage(BaseModel):
    """Single chat message for history."""
    role: str  # 'user' or 'assistant'
    content: str


class VectorBotRequest(BaseModel):
    """Input model for VectorBot messages."""
    message: str
    context: Optional[str] = None  # Current page URL or wizard step
    history: list[ChatHistoryMessage] = []  # Previous conversation messages


class VectorBotResponse(BaseModel):
    """Response model for VectorBot."""
    reply: str


def _get_context_prompt(context: Optional[str]) -> str:
    """Generate context-aware system prompt injection based on current page."""
    if not context:
        return ""
    
    context_lower = context.lower()
    
    if '/wizard/domain' in context_lower:
        return " The user is currently looking for a domain name. Help them brainstorm or explain domain considerations."
    elif '/wizard/vibe' in context_lower:
        return " The user is choosing a design style/vibe. Explain the differences between modern, classic, and bold aesthetics."
    elif '/wizard/discovery' in context_lower:
        return " The user is in the technical discovery phase. Help them think through their website requirements."
    elif '/proposal' in context_lower:
        return " The user is looking at their contract/proposal. Explain terms simply and reassure them about the process."
    elif '/dashboard' in context_lower:
        return " The user is on their dashboard viewing their project status. Help them understand timelines and next steps."
    
    return ""


VECTORBOT_SYSTEM_PROMPT = """You are VectorBot, a helpful AI assistant for VectorWeb Labs, a student-run web development agency.

Personality: Cyber-minimalist. Professional but friendly. Concise and direct.

Rules:
1. Keep answers SHORT - under 2 sentences maximum.
2. Be helpful and informative.
3. If the user asks about exact pricing, tell them you need more project details first and guide them to complete the wizard.
4. Never make up project details or statuses you don't know about.
5. Use a slightly "techy" but approachable tone.
6. STOP CONDITION: Review the chat history. If the user has already provided their Service, Target Audience, and Unique Value, STOP asking discovery questions and say "Great, I have everything I need!" Do not ask the same question twice."""


@app.post("/api/vectorbot", response_model=VectorBotResponse)
@limiter.limit("30/minute")
async def vectorbot_chat(request: Request, body: VectorBotRequest):
    """
    VectorBot AI chat endpoint with context awareness.
    """
    from openai import OpenAI
    
    if not OPENROUTER_API_KEY:
        # Fallback mock response
        return {"reply": "System initializing. Try again in a moment."}
    
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )
        
        # Build context-aware system prompt
        context_injection = _get_context_prompt(body.context)
        full_system_prompt = VECTORBOT_SYSTEM_PROMPT + context_injection
        
        # Build messages array with history
        messages_list = [{"role": "system", "content": full_system_prompt}]
        for msg in body.history:
            messages_list.append({"role": msg.role, "content": msg.content})
        messages_list.append({"role": "user", "content": body.message})
        
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "VectorWeb Labs - VectorBot",
            },
            model="google/gemini-2.0-flash-001",
            messages=messages_list
        )
        
        return {"reply": completion.choices[0].message.content}
        
    except Exception as e:
        print(f"VectorBot Error: {e}")
        return {"reply": "My neural link is currently unstable. Please try again."}


# ══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
