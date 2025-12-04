# Manual Heroku Deployment Steps

Since Heroku CLI is not installed, follow these manual steps:

## Step 1: Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli
Then restart PowerShell.

## Step 2: Login to Heroku
```powershell
heroku login
```

## Step 3: Create Heroku App
```powershell
heroku create payments-app-tejabalaji
```

## Step 4: Add PostgreSQL Database
```powershell
heroku addons:create heroku-postgresql:hobby-dev -a payments-app-tejabalaji
```

## Step 5: Set Environment Variables
```powershell
heroku config:set STRIPE_SECRET="sk_test_your_key" -a payments-app-tejabalaji
heroku config:set STRIPE_PUBLISHABLE="pk_test_your_key" -a payments-app-tejabalaji
heroku config:set STRIPE_WEBHOOK_SECRET="whsec_your_key" -a payments-app-tejabalaji
heroku config:set NODE_ENV="production" -a payments-app-tejabalaji
```

## Step 6: Add Heroku Remote
```powershell
heroku git:remote -a payments-app-tejabalaji
```

## Step 7: Deploy
```powershell
git push heroku main
```

## Step 8: View Logs
```powershell
heroku logs --tail -a payments-app-tejabalaji
```

## Step 9: Open App
```powershell
heroku open -a payments-app-tejabalaji
```

Your app will be live at: https://payments-app-tejabalaji.herokuapp.com
