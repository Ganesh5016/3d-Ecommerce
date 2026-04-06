const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');

// Create Stripe payment intent
router.post('/create-payment-intent', protect, async (req, res, next) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount, currency = 'inr', orderId } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // paise
      currency,
      metadata: { orderId: orderId?.toString(), userId: req.user.id.toString() },
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (error) { next(error); }
});

// Confirm payment
router.post('/confirm', protect, async (req, res, next) => {
  try {
    const { orderId, paymentIntentId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.paymentStatus = 'paid';
    order.paymentId = paymentIntentId;
    order.status = 'confirmed';
    order.tracking.push({ status: 'confirmed', message: 'Payment confirmed. Order is being processed.' });
    await order.save();
    res.json({ success: true, order });
  } catch (error) { next(error); }
});

// Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      if (pi.metadata?.orderId) {
        await Order.findByIdAndUpdate(pi.metadata.orderId, { paymentStatus: 'paid', status: 'confirmed', paymentId: pi.id });
      }
    }
    res.json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
