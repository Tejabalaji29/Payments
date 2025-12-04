// Mock Stripe implementation for testing without real API keys
const crypto = require('crypto');

class MockStripe {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  paymentIntents = {
    create: async (options) => {
      if (!options.amount || options.amount <= 0) {
        throw new Error('Invalid amount');
      }

      const paymentIntentId = `pi_${crypto.randomBytes(12).toString('hex')}`;
      const clientSecret = `${paymentIntentId}_secret_${crypto.randomBytes(12).toString('hex')}`;

      return {
        id: paymentIntentId,
        amount: options.amount,
        currency: options.currency || 'inr',
        status: 'requires_payment_method', // Mock status
        client_secret: clientSecret,
        metadata: options.metadata || {},
        created: Math.floor(Date.now() / 1000),
        charges: {
          data: []
        }
      };
    },

    confirm: async (intentId, options) => {
      // Mock confirmation - simulate successful payment
      return {
        id: intentId,
        status: 'succeeded', // Mock successful confirmation
        amount: options.payment_method_data?.billing_details?.amount || 0,
        charges: {
          data: [{
            id: `ch_${crypto.randomBytes(12).toString('hex')}`,
            status: 'succeeded'
          }]
        }
      };
    },

    retrieve: async (intentId) => {
      return {
        id: intentId,
        status: 'succeeded',
        amount: 0,
        charges: {
          data: []
        }
      };
    }
  };

  webhooks = {
    constructEvent: (body, sig, secret) => {
      // Mock webhook event construction
      try {
        const payload = typeof body === 'string' ? JSON.parse(body) : body;
        return payload;
      } catch (e) {
        throw new Error('Invalid webhook payload');
      }
    }
  };
}

// Export mock instance
module.exports = MockStripe;
