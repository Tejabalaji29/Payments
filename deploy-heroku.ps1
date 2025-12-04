# Quick Heroku deployment script for Windows PowerShell
# Run from project root: .\deploy-heroku.ps1

param(
    [string]$AppName = "payments-app"
)

Write-Host "🚀 Deploying to Heroku as: $AppName" -ForegroundColor Green

# Check if Heroku CLI is installed
try {
    $herokuVersion = heroku --version
    Write-Host "✅ Heroku CLI found: $herokuVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Red
    exit 1
}

# Check if logged in
try {
    $whoami = heroku auth:whoami
    Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please login to Heroku" -ForegroundColor Yellow
    heroku login
}

# Create app
Write-Host "📝 Creating Heroku app: $AppName" -ForegroundColor Cyan
heroku create $AppName -ErrorAction Continue

# Add PostgreSQL database
Write-Host "📦 Adding PostgreSQL database" -ForegroundColor Cyan
heroku addons:create heroku-postgresql:hobby-dev -a $AppName -ErrorAction Continue

# Set environment variables
Write-Host "🔑 Setting environment variables (MOCK MODE - update with real Stripe keys)" -ForegroundColor Yellow
heroku config:set `
    STRIPE_SECRET=sk_test_your_key `
    STRIPE_PUBLISHABLE=pk_test_your_key `
    STRIPE_WEBHOOK_SECRET=whsec_your_key `
    NODE_ENV=production `
    -a $AppName

Write-Host "⚠️  Remember to update Stripe keys at: https://dashboard.heroku.com/apps/$AppName/settings" -ForegroundColor Yellow

# Push to Heroku
Write-Host "📤 Deploying to Heroku..." -ForegroundColor Cyan
git push heroku main

# Open app
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is now live at: https://$AppName.herokuapp.com" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View logs: heroku logs --tail -a $AppName" -ForegroundColor Cyan
Write-Host "🔧 Open Heroku dashboard: heroku open -a $AppName" -ForegroundColor Cyan

$openApp = Read-Host "Open app in browser now? (y/n)"
if ($openApp -eq 'y') {
    heroku open -a $AppName
}
