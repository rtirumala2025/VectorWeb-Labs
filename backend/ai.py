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
    Generate a technical discovery question for the Gauntlet phase.
    
    Args:
        business_name: The name of the client's business.
        industry: The industry/vibe.
        current_q_index: The current step index (0-9).
        previous_answers: List of {q, a} dicts from previous steps.
    
    Returns:
        dict: {
            "question": str,
            "options": list[str]
        }
    """
    if not client:
        # Fallbacks for offline/no-key mode
        if current_q_index == 0:
            return {
                "question": "What are the main goals of your new website?",
                "options": [
                    "Get more local customers to call me",
                    "Sell products directly online",
                    "Showcase my portfolio of work",
                    "Allow clients to book appointments"
                ],
                "allow_multiple": True
            }
        return {
            "question": f"Question {current_q_index + 1}: How many customers do you serve weekly?",
            "options": ["Just starting out", "1-50 customers", "50-500 customers", "500+ (High volume)"],
            "allow_multiple": False
        }

    system_prompt = """Role: You are a friendly, non-technical Web Agency Consultant. 
Your client is a small business owner (e.g., landscaper, dentist, cafe owner) who may not know what a 'CMS' or 'API' is.

Rules for Questions:
1. No Jargon: Never use words like 'SPA', 'React', 'Stack', 'Backend', 'Database', or 'Auth'.
2. Focus on Outcomes: Ask about what the business needs to do (e.g., 'Take bookings', 'Sell products', 'Show photos').
3. Tone: Professional but accessible. Simple English.
4. Adaptive Logic:
   - If Restaurant -> Ask about Menus/Reservations.
   - If Service -> Ask about Quote Forms/Service Areas.
   - If Retail -> Ask about Shipping/Pickup.
5. Multi-Select Logic (CRITICAL):
   - If asking about "Features", "Goals", "Pain Points", "Services", or "Requirements", ALWAYS set "allow_multiple": true.
   - If asking about "Budget" or "Timeline", set "allow_multiple": false.
   - Example Multi-Select: "Which features do you need?" -> allow_multiple: true.

Output STRICT JSON format:
{
  "question": "The question string",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "allow_multiple": boolean
}"""

    user_prompt = f"""Client: {business_name}
Industry: {industry}
Current Step: {current_q_index + 1}/10
Previous Answers: {json.dumps(previous_answers, indent=2)}

Task: Generate question #{current_q_index + 1}.
If Step 1, ask: "What are the main goals of your new website?" with options: ["Get more local customers", "Sell products online", "Showcase portfolio", "Book appointments"].
If Step > 1, look at previous answers and ask a logical follow-up about BUSINESS NEEDS, not technology.

JSON Response:"""

    try:
        response = _call_openrouter(system_prompt, user_prompt)
        cleaned = _strip_markdown_json(response)
        return json.loads(cleaned)
    except Exception as e:
        print(f"Discovery question generation error: {e}")
        return {
            "question": "What is your estimated timeline for launch?",
            "options": ["ASAP (1-2 weeks)", "Standard (4-6 weeks)", "Flexible (2-3 months)", "No strict deadline"]
        }
