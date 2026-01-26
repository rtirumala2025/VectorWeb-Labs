import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

try:
    # Query for the specific project
    result = supabase.table("projects").select("*").ilike("business_name", "Antigravity Cloud%").order("created_at", desc=True).limit(1).execute()
    
    if result.data:
        project = result.data[0]
        print("SUCCESS: Project Found")
        print(f"ID: {project.get('id')}")
        print(f"Business Name: {project.get('business_name')}")
        print(f"Status: {project.get('status')}")
        print(f"Wizard Step: {project.get('wizard_step')}")
        print(f"Wizard Data: {project.get('wizard_data')}")
    else:
        print("FAILURE: Project Not Found")

except Exception as e:
    print(f"Error: {e}")
