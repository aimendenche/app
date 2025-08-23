import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './db';

export class MockPaymentProvider {
  static async createCheckoutSession({ amount, currency = 'EUR', metadata = {} }) {
    const sessionId = `cs_test_${uuidv4()}`;
    const paymentIntentId = `pi_test_${uuidv4()}`;
    
    // Simulate successful payment
    const session = {
      id: sessionId,
      payment_intent: paymentIntentId,
      url: `/mock-checkout?session_id=${sessionId}&amount=${amount}&currency=${currency}`,
      amount_total: amount,
      currency: currency.toLowerCase(),
      metadata,
      payment_status: 'paid',
      status: 'complete'
    };

    return session;
  }

  static async retrieveSession(sessionId) {
    return {
      id: sessionId,
      payment_intent: `pi_test_${uuidv4()}`,
      payment_status: 'paid',
      status: 'complete',
      amount_total: 10000,
      currency: 'eur',
      metadata: {}
    };
  }

  static async createRefund({ paymentIntentId, amount }) {
    const refundId = `re_test_${uuidv4()}`;
    
    return {
      id: refundId,
      payment_intent: paymentIntentId,
      amount,
      status: 'succeeded',
      created: Math.floor(Date.now() / 1000)
    };
  }

  static async processWebhook(payload, signature) {
    // Mock webhook processing
    const event = JSON.parse(payload);
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      await this.handleCheckoutCompleted(session);
    } else if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      await this.handleRefund(charge);
    }

    return { received: true };
  }

  static async handleCheckoutCompleted(session) {
    const db = await getDatabase();
    
    // Update booking status
    if (session.metadata.booking_id) {
      const bookingId = session.metadata.booking_id;
      const paymentType = session.metadata.type || 'deposit';
      
      await db.collection('bookings').updateOne(
        { id: bookingId },
        {
          $set: {
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            status: paymentType === 'deposit' ? 'reserved_deposit_paid' : 'paid_in_full',
            updated_at: new Date()
          }
        }
      );

      // Create payment record
      await db.collection('payments').insertOne({
        id: uuidv4(),
        booking_id: bookingId,
        type: paymentType,
        amount_cents: session.amount_total,
        currency: session.currency.toUpperCase(),
        stripe_payment_intent_id: session.payment_intent,
        status: 'succeeded',
        created_at: new Date()
      });
    }
  }

  static async handleRefund(charge) {
    const db = await getDatabase();
    
    // Find the original payment
    const payment = await db.collection('payments').findOne({
      stripe_payment_intent_id: charge.payment_intent
    });

    if (payment) {
      // Create refund record
      await db.collection('payments').insertOne({
        id: uuidv4(),
        booking_id: payment.booking_id,
        type: 'refund',
        amount_cents: -charge.amount_refunded,
        currency: charge.currency.toUpperCase(),
        stripe_payment_intent_id: charge.payment_intent,
        status: 'succeeded',
        created_at: new Date()
      });

      // Update booking status
      await db.collection('bookings').updateOne(
        { id: payment.booking_id },
        {
          $set: {
            status: 'refunded',
            updated_at: new Date()
          }
        }
      );
    }
  }
}

export class StripePaymentProvider {
  // TODO: Implement when Stripe keys are available
  static async createCheckoutSession(params) {
    throw new Error('Stripe not configured. Set STRIPE_SECRET_KEY to use Stripe payments.');
  }
}

export function getPaymentProvider() {
  const provider = process.env.PAYMENT_PROVIDER || 'mock';
  
  if (provider === 'stripe' && process.env.STRIPE_SECRET_KEY) {
    return StripePaymentProvider;
  }
  
  return MockPaymentProvider;
}