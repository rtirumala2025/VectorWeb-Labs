#!/bin/bash

echo "🔵 Starting Stripe Webhook Listener..."
echo "👉 If asked to log in, press Enter and follow the browser prompts."
echo "⚠️  LOOK FOR: 'Your webhook signing secret is whsec_...'"
echo ""

# Check if stripe CLI is available
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found!"
    echo "Install it with: brew install stripe/stripe-cli/stripe"
    echo "Or download from: https://github.com/stripe/stripe-cli/releases"
    exit 1
fi

# Check if logged in, if not, trigger login
if ! stripe config --list > /dev/null 2>&1; then
    echo "🔐 Logging in to Stripe..."
    stripe login
fi

echo ""
echo "📡 Forwarding webhooks to localhost:8000/api/webhooks/stripe"
echo "────────────────────────────────────────────────────────────"

# Start listening and forwarding to the Python Backend
stripe listen --forward-to localhost:8000/api/webhooks/stripe
