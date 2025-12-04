# Payments Demo — Stripe + Node.js + PostgreSQL

A full-stack payment processing application built with Express.js, PostgreSQL, and Stripe integration.

**Features:**
- ✅ Stripe payment integration (with mock mode for testing)
- ✅ Customer data collection and persistence
- ✅ PostgreSQL database for payments and customer records
- ✅ Docker containerization
- ✅ Production-ready (deployable to Heroku, Azure, AWS)
- ✅ Test mode with mock Stripe processor

## Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (optional if using Docker)
- PostgreSQL (optional if using Docker)

### Quick Start (Docker)

```bash
# Start the app locally
docker compose up --build

# Open in browser
open http://localhost:3001
```

The app will:
- Create PostgreSQL database automatically
- Run migrations
- Serve frontend on port 3001
- Backend API on port 3001/api

### Manual Setup (Without Docker)

```bash
# Install dependencies
npm install

# Set environment variables (.env file)
cp .env.example .env
# Edit .env with your Stripe keys and database URL

# Start backend
npm start

# Start PostgreSQL separately (if not using Docker)
# Then open http://localhost:3000
```

## Testing Payments

The app includes a mock Stripe processor for testing without real API keys.

**Test Mode (Default):**
- Fill payment form with any values
- Click "Pay Now"
- Mock payment succeeds automatically
- Data saved to database

**Real Stripe:**
1. Get test keys: https://dashboard.stripe.com/apikeys
2. Update `.env` with real keys
3. Restart app: `docker compose restart`

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Auth Required: `4000 2500 0000 3155`

## Deployment

### Deploy to Heroku (Recommended for Beginners)

**Fastest way (PowerShell):**
```powershell
.\deploy-heroku.ps1 -AppName payments-app
```

**Or manually:**
```bash
npm install -g heroku
heroku login
heroku create payments-app
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set STRIPE_SECRET=sk_test_... STRIPE_PUBLISHABLE=pk_test_...
git push heroku main
heroku open
```

See `HEROKU_DEPLOYMENT.md` for detailed steps.

### Deploy to Azure
```bash
az containerapp create --resource-group myRG --name payments-app \
  --image paymentapp:latest --environment myenv --target-port 3000
```

### Deploy to AWS (ECS)
```bash
aws ecs create-service --cluster payments --service-name payments-app \
  --task-definition payments-app --desired-count 1
```

## Database Schema

**tables:**
- `customers` — Full customer records (email unique)
- `payments` — Payment intents and status
- `payment_events` — Webhook events log

**Migrations:** Auto-run on startup from `migrations.sql`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/config` | Stripe publishable key |
| POST | `/create-payment-intent` | Create payment (with customer metadata) |
| POST | `/webhook` | Stripe webhook handler |
| GET | `/payments` | List all payments (JSON) |
| GET | `/customers` | List all customers (JSON) |

## Project Structure

```
├── backend.js              # Express server
├── frontend.html           # Single-page payment form
├── stripe-mock.js          # Mock Stripe for testing
├── migrations.sql          # Database schema
├── Dockerfile              # Container image
├── docker-compose.yml      # Multi-container setup
├── package.json            # Node dependencies
├── .env                    # Environment variables (secrets)
├── Procfile                # Heroku process file
├── heroku.yml              # Heroku Docker config
├── deploy-heroku.ps1       # Deployment script
└── HEROKU_DEPLOYMENT.md    # Detailed deployment guide
```

## Python Helper (Optional)

This repo also includes a minimal Python/Flask example:

```powershell
# Create venv
py -3 -m venv venv

# Install packages
.\venv\Scripts\python -m pip install -r requirements.txt

# Run Flask app
.\venv\Scripts\python app_flask.py
# Open http://localhost:5000/health
```

## Environment Variables

```env
PORT=3000
STRIPE_SECRET=sk_test_your_key           # Get from https://dashboard.stripe.com
STRIPE_PUBLISHABLE=pk_test_your_key      # Get from https://dashboard.stripe.com
STRIPE_WEBHOOK_SECRET=whsec_your_key     # Set up webhooks in Stripe dashboard
DATABASE_URL=postgresql://user:pass@db:5432/payments
NODE_ENV=production
```

## Troubleshooting

**Port 3000 already in use:**
```bash
docker compose down
docker compose up --build
```

**Database connection error:**
```bash
docker compose logs db
docker compose exec -T db psql -U payments_user -d payments -c "SELECT VERSION();"
```

**Stripe key invalid:**
- Check `.env` file
- Get real keys from https://dashboard.stripe.com/apikeys
- Restart: `docker compose restart`

## License

MIT — Feel free to use and modify for your projects.

## Support

- Stripe Docs: https://stripe.com/docs
- Heroku Docs: https://devcenter.heroku.com
- Docker Docs: https://docs.docker.com
