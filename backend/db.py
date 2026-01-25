"""
VectorWeb Labs - Database Service
Handles all Supabase database operations with robust error handling.
"""

import os
from typing import Optional, Any
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import HTTPException

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def create_project(data: dict) -> str:
    """
    Create a new project in the database.
    
    Args:
        data: Dictionary containing project fields:
            - business_name (str): Required
            - vibe_style (str): Required - 'modern', 'classic', or 'bold'
            - user_id (str): Required
            - domain_choice (str): Required
            - client_phone (str): Optional
            - website_type (str): Optional
            - target_audience (str): Optional
            - project_scope (dict): Optional - JSONB for pages/features
    
    Returns:
        str: The newly created project ID
    
    Raises:
        HTTPException: 500 error if database operation fails
    """
    try:
        # Build project data with required fields
        project_data = {
            "business_name": data.get("business_name"),
            "vibe_style": data.get("vibe_style"),
            "user_id": data.get("user_id"),
            "domain_choice": data.get("domain_choice"),
            "status": "draft",
            "deposit_paid": False,
        }
        
        # Add optional fields if provided
        if data.get("client_phone"):
            project_data["client_phone"] = data["client_phone"]
        if data.get("website_type"):
            project_data["website_type"] = data["website_type"]
        if data.get("target_audience"):
            project_data["target_audience"] = data["target_audience"]
        if data.get("project_scope"):
            project_data["project_scope"] = data["project_scope"]
        
        # Insert into Supabase
        result = supabase.table("projects").insert(project_data).execute()
        
        if not result.data:
            print("Error: Supabase insert returned no data")
            raise HTTPException(status_code=500, detail="Failed to create project - no data returned")
        
        project_id = result.data[0].get("id")
        return str(project_id)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error in create_project: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_project(project_id: str) -> Optional[dict]:
    """
    Fetch a single project by ID.
    
    Args:
        project_id: The UUID of the project
    
    Returns:
        dict: The project data or None if not found
    
    Raises:
        HTTPException: 500 error if database operation fails
    """
    try:
        result = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        return result.data
    except Exception as e:
        # Check if it's a "not found" error
        if "PGRST116" in str(e):
            return None
        print(f"Database error in get_project: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def get_projects_by_user(user_id: str) -> list[dict]:
    """
    Fetch all projects for a user, ordered by creation date.
    
    Args:
        user_id: The UUID of the user
    
    Returns:
        list: List of project dictionaries
    
    Raises:
        HTTPException: 500 error if database operation fails
    """
    try:
        result = supabase.table("projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data or []
    except Exception as e:
        print(f"Database error in get_projects_by_user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def update_project(project_id: str, data: dict) -> dict:
    """
    Update a project with the given data.
    
    Args:
        project_id: The UUID of the project
        data: Dictionary of fields to update
    
    Returns:
        dict: The updated project data
    
    Raises:
        HTTPException: 500 error if database operation fails
    """
    try:
        result = supabase.table("projects").update(data).eq("id", project_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Database error in update_project: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def mark_deposit_paid(project_id: str) -> dict:
    """
    Mark a project's deposit as paid and update status to 'building'.
    
    Args:
        project_id: The UUID of the project
    
    Returns:
        dict: The updated project data
    """
    return update_project(project_id, {
        "deposit_paid": True,
        "status": "building"
    })
