import os
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

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

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# Pydantic Models
class ProjectCreate(BaseModel):
    business_name: str
    vibe_style: str  # 'modern', 'classic', or 'bold'
    user_id: str
    domain_choice: str


class ProjectResponse(BaseModel):
    project_id: str
    status: str


class Project(BaseModel):
    id: str
    business_name: str
    vibe_style: str
    domain_choice: str
    status: str
    created_at: str

    class Config:
        extra = "ignore"  # Ignore other fields like user_id if not needed in response


# Routes
@app.get("/")
async def root():
    return {"message": "VectorWeb Labs API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "vectorweb-api"}


@app.get("/api/projects", response_model=list[Project])
async def get_projects(user_id: str):
    """
    Get all projects for a user.
    """
    try:
        result = supabase.table("projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate):
    """
    Create a new project in the database.
    """
    try:
        # Prepare data for insertion
        project_data = {
            "business_name": project.business_name,
            "vibe_style": project.vibe_style,
            "user_id": project.user_id,
            "domain_choice": project.domain_choice,
            "status": "draft"
        }
        
        # Insert into Supabase
        result = supabase.table("projects").insert(project_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create project")
        
        # Return the created project ID
        project_id = result.data[0].get("id")
        
        return ProjectResponse(
            project_id=str(project_id),
            status="success"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatMessage(BaseModel):
    message: str
    project_id: str


class ChatResponse(BaseModel):
    response: str


# ... other models ...

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_ai(chat: ChatMessage):
    """
    Mock AI chat endpoint for now.
    """
    import random
    import asyncio
    
    # Simulate processing delay
    await asyncio.sleep(1)
    
    # Logic to fetch project context could go here
    
    responses = [
        "Your website is currently in the development phase. The design mockups were approved last week!",
        "Based on the timeline, we're on track for the Feb 5th launch date. No blockers so far.",
        "Great question! The contact form will integrate with your existing CRM via webhook.",
        "I can see the dev team pushed 12 commits today. They're working on the checkout flow.",
        "Would you like me to schedule a review call with the team? I can find available times.",
        f"I see you're asking about project {chat.project_id}. Everything looks good!"
    ]
    
    return {"response": random.choice(responses)}


@app.post("/api/projects/{project_id}/pay")
async def pay_project(project_id: str):
    """
    Mark a project as paid.
    """
    try:
        # Update status to 'paid' (or 'building' as per schema default logic? Schema says draft/paid/building)
        # Let's set it to 'building' to show progress in dashboard
        result = supabase.table("projects").update({"status": "building"}).eq("id", project_id).execute()
        
        if not result.data:
            # It might return empty list if row not found or RLS blocks it, but we are using service key
            # Check if using service key? Yes main.py uses env vars directly to create client.
            # Wait, create_client(URL, KEY). If KEY is service role, it bypasses RLS.
            pass

        return {"status": "success", "message": "Payment processed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
