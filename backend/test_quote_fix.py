import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
import ai

# Mock Wizard Data
mock_data = {
    "business_name": "Test Agency",
    "wizard_data": {
        "discoveryHistory": [
            {"q": "What is your main goal?", "a": "Sell custom furniture"},
            {"q": "Who is your audience?", "a": "High-end interior designers"},
            {"q": "Do you need e-commerce?", "a": "Yes, with Shopify integration"}
        ]
    }
}

print("Running Quote Generation Test...")
try:
    quote = ai.generate_quote(mock_data)
    print("SUCCESS: Quote Generated")
    print(f"Price: {quote.get('price')}")
    print(f"Reasoning: {quote.get('reasoning')}")
    
    # Simple semantic check
    reasoning = quote.get('reasoning', '').lower()
    if "furniture" in reasoning or "shopify" in reasoning or "e-commerce" in reasoning:
        print("VERIFIED: AI used context from discovery history.")
    else:
        print("WARNING: Context might be missing from reasoning (Check logs).")

except Exception as e:
    print(f"FAILED: {e}")
