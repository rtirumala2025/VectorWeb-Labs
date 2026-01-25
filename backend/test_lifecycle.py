
import os
import sys
import json
import time
from dotenv import load_dotenv

# Ensure we can import backend modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import db
import ai
from supabase import create_client

# Load env vars
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Critical Error: Missing Supabase credentials")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

import uuid

def run_lifecycle_test():
    print("🚀 Starting Lifecycle Test...")

    # 0. Get a Valid User ID
    print("[0/5] Fetching a valid User ID...")
    try:
        users_response = supabase.auth.admin.list_users()
        print(f"DEBUG: users_response type: {type(users_response)}")
        
        users = []
        if isinstance(users_response, list):
            users = users_response
        elif hasattr(users_response, "users"):
            users = users_response.users
        else:
             # Try dict access?
             users = getattr(users_response, "users", [])

        if not users:
             print("❌ No users found! details:", users_response)
             return
             
        # Handle user object having 'id' attribute or dictionary key
        first_user = users[0]
        if hasattr(first_user, "id"):
            valid_user_id = first_user.id
        elif isinstance(first_user, dict) and "id" in first_user:
            valid_user_id = first_user["id"]
        else:
            print("❌ User object format unknown:", first_user)
            return

        print(f"✅ Using User ID: {valid_user_id}")
    except Exception as e:
        print(f"❌ Failed to list users: {e}")
        return

    # 1. Simulate Frontend: Create Project
    print("\n[1/5] Simulating Frontend Project Creation...")
    dummy_project = {
        "business_name": "Lifecycle Test Biz",
        "vibe_style": "bold",
        "user_id": valid_user_id,
        "domain_choice": "lifecycle-test.io",
        "client_phone": "555-0199",
        "website_type": "Startup",
        "target_audience": "Developers"
    }

    try:
        project_id = db.create_project(dummy_project)
        print(f"✅ Project Created. ID: {project_id}")
    except Exception as e:
        print(f"❌ Failed to create project: {e}")
        return

    # 2. Verify in Supabase
    print("\n[2/5] Verifying Draft in Supabase...")
    try:
        row = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        if not row.data:
            print("❌ Project not found in Supabase!")
            return
        print("✅ Project found in DB.")
    except Exception as e:
        print(f"❌ Supabase Lookup Error: {e}")
        return

    # 3. Trigger AI
    print("\n[3/5] Triggering AI Quote Generation...")
    try:
        ai_data = ai.generate_quote(dummy_project)
        print("✅ AI Generated Quote:")
        print(json.dumps(ai_data, indent=2))
    except Exception as e:
        print(f"❌ AI Generation Failed: {e}")
        return

    # 4. Save to DB (The Critical Step being Audited)
    print("\n[4/5] Saving to DB with Mapping...")
    try:
        # Simulate what main.py does
        db_update_payload = {
            "ai_price_quote": ai_data.get("price"),
            "ai_features": ai_data.get("features"),
            "ai_reasoning": ai_data.get("reasoning"),
            "ai_suggested_stack": ai_data.get("suggested_stack")
        }
        db.update_project(project_id, db_update_payload)
        print("✅ Update command sent.")
    except Exception as e:
        print(f"❌ Update Failed: {e}")
        return

    # 5. Final Verification
    print("\n[5/5] Final Supabase Verification...")
    try:
        final_row = supabase.table("projects").select("*").eq("id", project_id).single().execute()
        data = final_row.data
        
        # Check specific fields
        dropped_data = []
        if not data.get("ai_price_quote"): dropped_data.append("ai_price_quote")
        if not data.get("ai_features"): dropped_data.append("ai_features")
        if not data.get("ai_reasoning"): dropped_data.append("ai_reasoning")
        
        if dropped_data:
            print(f"❌ DATA DROPPED! Missing fields in DB: {dropped_data}")
        else:
            print("🎉 SUCCESS! All AI data persisted correctly.")
            print(f"   Price: {data.get('ai_price_quote')}")
            print(f"   Features: {len(data.get('ai_features', []))} items")
            
    except Exception as e:
        print(f"❌ Final Verification Failed: {e}")

if __name__ == "__main__":
    run_lifecycle_test()
