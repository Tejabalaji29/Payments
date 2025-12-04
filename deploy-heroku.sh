#!/bin/bash
# Quick Heroku deployment script for Windows/PowerShell
# Run from project root: ./deploy-heroku.sh

set -e

APP_NAME=${1:-payments-app}
echo "🚀 Deploying to Heroku as: $APP_NAME"

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku"
    heroku login
fi

# Create app (or skip if exists)
echo "📝 Creating Heroku app: $APP_NAME"
heroku create $APP_NAME || echo "ℹ️  App already exists"

# Add PostgreSQL database
echo "📦 Adding PostgreSQL database"
heroku addons:create heroku-postgresql:hobby-dev -a $APP_NAME || echo "ℹ️  Database already added"

# Set environment variables
echo "🔑 Setting environment variables"
echo "⚠️  Please update these with real Stripe keys from https://dashboard.stripe.com"
heroku config:set \
  STRIPE_SECRET=sk_test_your_key \
  STRIPE_PUBLISHABLE=pk_test_your_key \
  STRIPE_WEBHOOK_SECRET=whsec_your_key \
  NODE_ENV=production \
  -a $APP_NAME

# Push to Heroku
echo "📤 Deploying to Heroku..."
git push heroku main

# Open app
echo "✅ Deployment complete!"
echo "🌐 Opening app in browser..."
heroku open -a $APP_NAME

echo "📊 View logs: heroku logs --tail -a $APP_NAME"
