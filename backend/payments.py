"""
VectorWeb Labs - Payments Module
Handles Stripe checkout sessions and webhooks.
"""

import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from pydantic import BaseModel
from dotenv import load_dotenv

import db
from dependencies import get_current_user

load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
DOMAIN_URL = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")

router = APIRouter(prefix="/api", tags=["payments"])


class CreateCheckoutRequest(BaseModel):
    project_id: str


@router.post("/create-checkout-session")
async def create_checkout_session(data: CreateCheckoutRequest, user: dict = Depends(get_current_user)):
    """
    Create a Stripe Checkout Session for the 50% deposit.
    """
    project_id = data.project_id
    project = db.get_project(project_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Access control: Ensure user owns the project
    if project.get("user_id") != user.id:
        raise HTTPException(status_code=403, detail="Not authorized to pay for this project")

    # Calculate deposit (50% of quote)
    full_price = project.get("ai_price_quote", 0) or 1000  # Fallback to $1000 if 0
    deposit_amount = int(full_price * 0.5 * 100)  # Cents

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"50% Deposit - {project.get('business_name')}",
                            'description': 'Initial deposit to start development',
                        },
                        'unit_amount': deposit_amount,
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f"{DOMAIN_URL}/dashboard?payment_success=true",
            cancel_url=f"{DOMAIN_URL}/dashboard?payment_cancelled=true",
            metadata={
                "project_id": project_id,
                "user_id": user.id
            }
        )
        return {"checkout_url": checkout_session.url}
    except Exception as e:
        print(f"Stripe Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Handle Stripe webhooks to update project status.
    """
    payload = await request.body()

    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        project_id = session.get("metadata", {}).get("project_id")

        if project_id:
            # Update DB
            db.mark_deposit_paid(project_id)
            print(f"Payment successful for project {project_id}")

    return {"status": "success"}
