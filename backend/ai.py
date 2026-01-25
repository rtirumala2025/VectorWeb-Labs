"""
VectorWeb Labs - AI Service
Handles AI-powered quote generation and domain suggestions via OpenRouter.
"""

import os
import json
import re
from typing import Optional
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenRouter client
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

client: Optional[OpenAI] = None
if OPENROUTER_API_KEY:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )


# ══════════════════════════════════════════════════════════════════════════════
# VECTORWEB SCOUT SYSTEM PROMPT
# ══════════════════════════════════════════════════════════════════════════════

SCOUT_SYSTEM_PROMPT = """Role: You are Scout, the Lead Estimator and Technical Architect for VectorWeb Labs, a high-performance student-run web agency.

Core Identity: Professional, energetic, "hacker-chic," and extremely concise.

Fundamental Rules:

1. Output Format (CRITICAL): You must ALWAYS return a raw JSON object. Do not wrap it in markdown ticks. No conversational filler.

2. Pricing Logic:
   - Base: $500
   - +$100 per page
   - Multipliers: 1.5x (E-commerce), 2.0x (Custom/Complex)
   - Student Discount: -20%

3. Risk Detection: Flag "impossible" requests (e.g., "Facebook clone", "AI that writes itself") in the risks field.

4. Response Schema (JSON Only):
{
    "price": number,
    "reasoning": string,
    "features": string[],
    "risks": string[],
    "suggested_stack": string
}"""


def _strip_markdown_json(text: str) -> str:
    """
    Strip markdown code block ticks from AI response if present.
    Handles ```json, ```, and leading/trailing whitespace.
    """
    # Remove ```json or ``` wrapper
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def _call_openrouter(system_prompt: str, user_prompt: str) -> str:
    """
    Make a call to OpenRouter and return the response content.
    """
    if not client:
        raise RuntimeError("OpenRouter API key not configured")
    
    completion = client.chat.completions.create(
        extra_headers={
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "VectorWeb Labs",
        },
        model="meta-llama/llama-3.3-70b-instruct:free",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )
    return completion.choices[0].message.content


def generate_quote(business_data: dict) -> dict:
    """
    Generate an AI-powered price quote for a project.
    
    Args:
        business_data: Dictionary containing:
            - business_name (str)
            - website_type (str): e.g., "E-commerce", "Portfolio", "Landing Page"
            - target_audience (str): Description of target users
            - vibe_style (str): "modern", "classic", or "bold"
            - project_scope (dict): Optional, containing pages/features
    
    Returns:
        dict: {
            "price": int,
            "reasoning": str,
            "features": list[str],
            "risks": list[str],
            "suggested_stack": str
        }
    """
    if not client:
        # Fallback mock response if no API key
        return {
            "price": 1200,
            "reasoning": "[MOCK] Estimated based on standard portfolio site with 5 pages.",
            "features": ["Responsive Design", "Contact Form", "SEO Optimization"],
            "risks": [],
            "suggested_stack": "Next.js + Tailwind CSS + Supabase"
        }
    
    # Build user prompt from business data
    user_prompt = f"""Generate a price quote for this project:

Business Name: {business_data.get('business_name', 'Unknown')}
Website Type: {business_data.get('website_type', 'Portfolio')}
Target Audience: {business_data.get('target_audience', 'General')}
Design Style: {business_data.get('vibe_style', 'modern')}
Scope: {json.dumps(business_data.get('project_scope', {}), indent=2) if business_data.get('project_scope') else 'Standard 5-page website'}

Return ONLY a valid JSON object with: price, reasoning, features, risks, suggested_stack."""

    try:
        response = _call_openrouter(SCOUT_SYSTEM_PROMPT, user_prompt)
        cleaned = _strip_markdown_json(response)
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"Failed to parse AI response as JSON: {e}")
        print(f"Raw response: {response}")
        # Return fallback
        return {
            "price": 1000,
            "reasoning": "Unable to generate AI quote. Default estimate provided.",
            "features": ["Basic Website"],
            "risks": ["AI quote generation failed"],
            "suggested_stack": "Next.js + Tailwind CSS"
        }
    except Exception as e:
        print(f"AI quote generation error: {e}")
        return {
            "price": 1000,
            "reasoning": f"Error: {str(e)}",
            "features": [],
            "risks": ["AI service error"],
            "suggested_stack": "Next.js"
        }


def generate_domain_ideas(domain: str, vibe: str) -> list[str]:
    """
    Generate alternative domain suggestions when the requested domain is taken.
    
    Args:
        domain: The taken domain name (e.g., "coolbrand.com")
        vibe: The brand vibe (e.g., "modern", "classic", "bold")
    
    Returns:
        list[str]: List of 3 alternative domain suggestions
    """
    if not client:
        # Fallback mock suggestions
        base = domain.replace(".com", "").replace(".io", "").replace(".co", "")
        return [
            f"{base}.io",
            f"{base}lab.co",
            f"get{base}.com"
        ]
    
    user_prompt = f"""The domain '{domain}' is taken. The brand vibe is '{vibe}'. 
Suggest 3 available, creative alternatives (e.g., with .io, .co, .lab, .dev, .app).
Return ONLY a JSON list of strings, no other text."""

    try:
        response = _call_openrouter(
            "You are a domain name expert. Return ONLY valid JSON arrays with no markdown formatting.",
            user_prompt
        )
        cleaned = _strip_markdown_json(response)
        suggestions = json.loads(cleaned)
        
        # Ensure we return a list
        if isinstance(suggestions, list):
            return suggestions[:5]  # Limit to 5 suggestions
        return []
    except Exception as e:
        print(f"Domain idea generation error: {e}")
        # Fallback suggestions
        base = domain.replace(".com", "").replace(".io", "").replace(".co", "")
        return [
            f"{base}.io",
            f"{base}lab.co",
            f"get{base}.com"
        ]


def generate_discovery_question(business_name: str, industry: str, current_q_index: int, previous_answers: list[dict]) -> dict:
    """
    Generate a technical discovery question using a Phase-Based Funnel.
    
    Phases:
    1. Identity & Goals (Index 0-2)
    2. Features & Mechanics (Index 3-6)
    3. Logistics & Constraints (Index 7-9)
    """
    
    # 1. THE FINISH LINE
    # If we've reached 10 questions, forcing completion.
    if current_q_index >= 10:
        return {
            "question": "",
            "options": [],
            "allow_multiple": False,
            "is_complete": True
        }

    # 2. Extract topics to avoid loops
    topics_covered = []
    for item in previous_answers:
        q_text = item.get('q', '').lower()
        if 'goal' in q_text: topics_covered.append('goals')
        if 'audience' in q_text: topics_covered.append('audience')
        if 'feature' in q_text: topics_covered.append('features')
        if 'budget' in q_text: topics_covered.append('budget')
        if 'timeline' in q_text: topics_covered.append('timeline')
        if 'content' in q_text: topics_covered.append('content')
        if 'integration' in q_text: topics_covered.append('integrations')
        if 'design' in q_text or 'style' in q_text: topics_covered.append('design')

    # Determine Phase
    phase_instruction = ""
    if current_q_index <= 2:
        phase = "PHASE 1: IDENTITY & GOALS"
        phase_instruction = "Focus ONLY on business model, target audience, and primary success metrics (leads vs sales). Do NOT ask about specific features yet."
    elif current_q_index <= 6:
        phase = "PHASE 2: FEATURES & MECHANICS"
        phase_instruction = "Focus on specific WEBSITE FEATURES based on the business model (e.g., Menu for restaurants, Booking for services). Do NOT ask about budget/timeline yet."
    else:
        phase = "PHASE 3: LOGISTICS & CONSTRAINTS"
        phase_instruction = "Focus on execution: Timeline, Content Readiness (logos/text), Budget range, or Maintenance needs."

    if not client:
        # Fallbacks for offline/no-key mode
        # Progressive mock questions to simulate a real flow without looping
        mock_questions = [
            {
                "question": "What are the main goals of your new website?",
                "options": ["Get more local customers", "Sell products online", "Showcase portfolio", "Book appointments"],
                "allow_multiple": True
            },
            {
                "question": "How many customers do you serve weekly?",
                "options": ["Just starting out", "1-50 customers", "50-500 customers", "500+ (High volume)"],
                "allow_multiple": False
            },
            {
                "question": "Do you have existing branding assets?",
                "options": ["Yes, full brand guide", "Just a logo", "Starting from scratch", "Need a refresh"],
                "allow_multiple": False
            },
            {
                "question": "What features are essential for launch?",
                "options": ["Contact Form", "Live Chat", "Blog / News", "Photo Gallery", "User Login"],
                "allow_multiple": True
            },
            {
                "question": "What is your approximate budget range?",
                "options": ["$500 - $1,000", "$1,000 - $2,500", "$2,500 - $5,000", "$5,000+"],
                "allow_multiple": False
            },
            {
                "question": "When are you looking to launch?",
                "options": ["ASAP (1-2 weeks)", "Standard (4-6 weeks)", "Flexible timeline", "No rush"],
                "allow_multiple": False
            },
            {
                "question": "Who will handle ongoing content updates?",
                "options": ["I will (Need CMS)", "My team", "I need a maintenance plan", "Not sure yet"],
                "allow_multiple": False
            },
            {
                "question": "Do you need integration with other tools?",
                "options": ["CRM (Salesforce/HubSpot)", "Email Marketing", "Booking System", "Payment Gateway", "None"],
                "allow_multiple": True
            },
            {
                "question": "What describes your ideal aesthetic?",
                "options": ["Clean & Minimalist", "Bold & Colorful", "Corporate & Professional", "Warm & Welcoming"],
                "allow_multiple": False
            },
            {
                "question": "Final Confirmation: Ready for your quote?",
                "options": ["Yes, show me the numbers", "Review answers first"],
                "allow_multiple": False
            }
        ]
        
        # Return question based on index, defaulting to the last one if out of bounds
        if current_q_index < len(mock_questions):
            return mock_questions[current_q_index]
        else:
             return {
                "question": "",
                "options": [],
                "allow_multiple": False,
                "is_complete": True
            }

    system_prompt = f"""Role: You are a friendly, non-technical Web Agency Consultant. 
Your client is a small business owner.
    
Current Phase: {phase}
Instruction: {phase_instruction}

Rules:
1. No Jargon (No 'SPA', 'React', 'Backend').
2. Adaptive Logic: Ask relevant follow-ups based on previous answers.
3. Multi-Select: Set "allow_multiple": true for Features, Goals, Pain Points.
4. LOOP PREVENTION: 
   - DO NOT ask about: {', '.join(topics_covered)}
   - If you feel you have enough info to estimate a quote, set "is_complete": true.

Output STRICT JSON:
{{
  "question": "The question string",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "allow_multiple": boolean,
  "is_complete": boolean
}}"""

    def sanitize(text: str) -> str:
        """Sanitize input to prevent injection in f-strings."""
        return str(text).replace("{", "{{").replace("}", "}}").replace("<", "&lt;").replace(">", "&gt;")

    user_prompt = f"""<client_data>
Client: {sanitize(business_name)}
Industry: {sanitize(industry)}
Current Step: {current_q_index + 1}/10
Previous Answers: {json.dumps(previous_answers, indent=2)}
</client_data>

Task: Generate question #{current_q_index + 1} for {phase}.
JSON Response:"""

    try:
        response = _call_openrouter(system_prompt, user_prompt)
        cleaned = _strip_markdown_json(response)
        data = json.loads(cleaned)
        
        # Ensure is_complete is present
        if "is_complete" not in data:
            data["is_complete"] = False
            
        return data
        
    except Exception as e:
        print(f"Discovery question generation error: {e}")
        return {
            "question": "What is your estimated timeline for launch?",
            "options": ["ASAP (1-2 weeks)", "Standard (4-6 weeks)", "Flexible (2-3 months)", "No strict deadline"],
            "allow_multiple": False,
            "is_complete": False
        }

