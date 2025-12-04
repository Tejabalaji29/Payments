// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Stripe = require('stripe');
const MockStripe = require('./stripe-mock');
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');

// Use mock Stripe if key is not a real test key
const isRealStripeKey = (key) => key && key.startsWith('sk_test_') && key.length > 30 && !key.includes('*');
const stripe = isRealStripeKey(process.env.STRIPE_SECRET) 
  ? Stripe(process.env.STRIPE_SECRET)
  : new MockStripe(process.env.STRIPE_SECRET);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// serve static frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Raw body only for webhook route
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.json());

// GET publishable key for client
app.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE || '' });
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));


// create payment intent
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'inr', metadata } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'invalid amount' });
  try {
    const idempotencyKey = req.headers['idempotency-key'] || crypto.randomUUID();
    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: metadata || {}
    }, { idempotencyKey });

    // store minimal payment record
    await pool.query(
      `INSERT INTO payments(id, amount, currency, status, stripe_pid, metadata)
       VALUES($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
      [intent.id, amount, currency, intent.status, intent.id, JSON.stringify(metadata || {})]
    );

    res.json({ clientSecret: intent.client_secret, id: intent.id });
  } catch (err) {
    console.error('create-payment-intent error', err);
    res.status(500).json({ error: err.message });
  }
});

// webhook
// Store customer details
app.post('/save-customer', async (req, res) => {
  const { name, email, phone, address, city, postal, country, description } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  
  try {
    const result = await pool.query(
      `INSERT INTO customers(name, email, phone, address, city, postal_code, country, notes, created_at)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,now())
       ON CONFLICT (email) DO UPDATE SET updated_at = now()
       RETURNING id, email`,
      [name, email, phone, address, city, postal, country, description]
    );
    res.json({ customerId: result.rows[0].id, email: result.rows[0].email });
  } catch (err) {
    console.error('save-customer error', err);
    res.status(500).json({ error: err.message });
  }
});

// webhook
app.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  // persist event
  try {
    await pool.query(
      'INSERT INTO payment_events(event_id, type, payload) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',
      [event.id, event.type, JSON.stringify(data)]
    );
  } catch (e) {
    console.error('DB insert event error', e);
  }

  // handle common events
  try {
    if (event.type === 'payment_intent.succeeded') {
      await pool.query('UPDATE payments SET status=$1, updated_at = now() WHERE stripe_pid=$2', ['succeeded', data.id]);
      console.log('Payment succeeded', data.id);
    } else if (event.type === 'payment_intent.payment_failed') {
      await pool.query('UPDATE payments SET status=$1, updated_at = now() WHERE stripe_pid=$2', ['failed', data.id]);
      console.log('Payment failed', data.id);
    } else if (event.type === 'payment_intent.created') {
      await pool.query('UPDATE payments SET status=$1, updated_at = now() WHERE stripe_pid=$2', ['created', data.id]);
    }
  } catch (e) {
    console.error('Error updating payment status', e);
  }

  res.json({ received: true });
});

// simple admin list payments
app.get('/customers', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM customers ORDER BY created_at DESC LIMIT 100');
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// simple admin list payments
app.get('/payments', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 100');
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// bootstrap DB on start (create tables)
async function bootstrap() {
  const fs = require('fs');
  const sql = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8');
  await pool.query(sql);
}

bootstrap().then(() => {
  app.listen(PORT, () => console.log(`Payments service listening on ${PORT}`));
}).catch(err => {
  console.error('Bootstrap error', err);
  process.exit(1);
});
