import os
import sys
import json
import ai

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

# Monkey patch _call_openrouter to avoid real API calls and verify logic
def mock_call_openrouter(system_prompt, user_prompt):
    # Extract phase from system prompt for verification
    if "PHASE 1" in system_prompt:
        print(f"{Colors.BLUE}   -> Verified Prompt Phase: 1 (Identity & Goals){Colors.ENDC}")
    elif "PHASE 2" in system_prompt:
        print(f"{Colors.CYAN}   -> Verified Prompt Phase: 2 (Features & Mechanics){Colors.ENDC}")
    elif "PHASE 3" in system_prompt:
        print(f"{Colors.WARNING}   -> Verified Prompt Phase: 3 (Logistics & Constraints){Colors.ENDC}")
    
    # Return dummy valid JSON to keep the loop going
    return json.dumps({
        "question": "Simulated AI Question checking logic",
        "options": ["Option A", "Option B"],
        "allow_multiple": False,
        "is_complete": False
    })

ai._call_openrouter = mock_call_openrouter
# Force client to be truthy so we don't hit the hardcoded fallback
ai.client = True 

def run_funnel_simulation():
    print(f"{Colors.HEADER}COMBAT SIMULATION: DISCOVERY PROTOCOL V2{Colors.ENDC}")
    print("Subject: Neon Sushi (Restaurant)")
    print("-" * 50)

    # Mock Data
    business_name = "Neon Sushi"
    industry = "Restaurant"
    previous_answers = []

    for step in range(11):  # 0 to 10
        # Determine Phase for logging
        if step <= 2:
            phase = f"{Colors.BLUE}[PHASE 1 - GOALS]{Colors.ENDC}"
        elif step <= 6:
            phase = f"{Colors.CYAN}[PHASE 2 - SPECS]{Colors.ENDC}"
        else:
            phase = f"{Colors.WARNING}[PHASE 3 - LOGISTICS]{Colors.ENDC}"

        # Generate Question
        print(f"\n{phase} Step {step} Processing...")
        try:
            response = ai.generate_discovery_question(
                business_name,
                industry,
                step,
                previous_answers
            )
        except Exception as e:
            print(f"{Colors.FAIL}CRITICAL ERROR:{Colors.ENDC} {e}")
            break

        # Check for completion
        if response.get("is_complete"):
            print(f"{Colors.GREEN}>> SYSTEM TRIGGERED COMPLETION AT STEP {step}{Colors.ENDC}")
            break

        question = response.get("question", "NO QUESTION GENERATED")
        options = response.get("options", [])
        
        print(f"AI: {Colors.BOLD}{question}{Colors.ENDC}")
        # print(f"Options: {options}")

        # Simulate Answer (Pick first option)
        selected_option = options[0] if options else "Mock Answer"
        print(f"User: {selected_option}")

        # Accumulate history
        previous_answers.append({"q": question, "a": selected_option})

    print("-" * 50)
    print(f"{Colors.GREEN}SIMULATION COMPLETE{Colors.ENDC}")

if __name__ == "__main__":
    # Ensure current directory is in path so imports work
    sys.path.append(os.getcwd())
    run_funnel_simulation()
