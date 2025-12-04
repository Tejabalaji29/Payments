# Heroku Deployment Guide

## Prerequisites
- Heroku CLI installed (`npm install -g heroku` or download from heroku.com/download)
- GitHub repo connected (already done: https://github.com/Tejabalaji29/Payments)
- Heroku account (free tier available at heroku.com)

## Deployment Steps

### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

### 2. Create Heroku App
```bash
heroku create payments-app
# Or with a custom name:
heroku create your-custom-app-name
```

### 3. Add PostgreSQL Database
```bash
heroku addons:create heroku-postgresql:hobby-dev -a payments-app
```

### 4. Set Environment Variables
```bash
heroku config:set \
  STRIPE_SECRET=sk_test_your_key \
  STRIPE_PUBLISHABLE=pk_test_your_key \
  STRIPE_WEBHOOK_SECRET=whsec_your_key \
  NODE_ENV=production \
  -a payments-app
```

Or set them via Heroku Dashboard:
- Go to https://dashboard.heroku.com/apps/payments-app
- Settings → Config Vars → Add the above variables

### 5. Deploy from GitHub
```bash
# Link your GitHub repo
heroku git:remote -a payments-app
git remote -v

# Deploy
git push heroku main
```

Or enable automatic deployments:
- Go to Deploy tab → GitHub → Connect to repository
- Select `Tejabalaji29/Payments`
- Enable automatic deploys

### 6. Verify Deployment
```bash
heroku logs --tail -a payments-app
heroku open -a payments-app
```

## Accessing Your Live App
- URL: `https://payments-app.herokuapp.com` (or your custom name)
- Database: Managed by Heroku PostgreSQL
- Logs: `heroku logs --tail -a payments-app`

## Database Migrations on Heroku
Your `migrations.sql` will run automatically when the app starts because it's baked into the Docker image.

To manually run migrations:
```bash
heroku run "psql $DATABASE_URL < migrations.sql" -a payments-app
```

## Troubleshooting

### App crashes after deploy
```bash
heroku logs --tail -a payments-app
```

### Database connection issues
```bash
heroku pg:info -a payments-app
heroku pg:credentials:url DATABASE -a payments-app
```

### View live app logs
```bash
heroku logs --tail -a payments-app
```

## Next Steps

1. **Update Stripe Keys** — Get real test keys from https://dashboard.stripe.com
2. **Configure Custom Domain** — `heroku domains:add your-domain.com`
3. **Enable HTTPS** — Automatic on Heroku (already included)
4. **Monitor Performance** — Use Heroku Metrics dashboard
5. **Add CI/CD** — GitHub Actions can auto-deploy on push

## Free Tier Limits
- 550 free dyno hours per month (always on: ~23 hours)
- PostgreSQL: 20 MB limit (upgrade for more)
- After 30 mins inactivity, free app goes to sleep

**Upgrade to Paid Tier for:**
- Always-on hosting ($7/month)
- Larger database (Standard: $50/month, up to 10GB)
- More dyno hours
