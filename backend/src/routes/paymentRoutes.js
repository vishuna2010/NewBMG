const express = require('express');
const { createPaymentIntent, stripeWebhookHandler } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Assuming payments are by authenticated users

const router = express.Router();

// This endpoint creates a payment intent for the frontend to use with Stripe Elements/Checkout
router.post('/create-payment-intent', protect, createPaymentIntent);

// Stripe Webhook Endpoint - public, but verified by Stripe signature
// express.raw({type: 'application/json'}) is crucial for Stripe to verify the signature correctly,
// as it needs the raw request body, not a parsed JSON object.
router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhookHandler);

// Developer-only route for mocking Stripe events (ensure this is not available or heavily protected in production)
if (process.env.NODE_ENV !== 'production') {
    const { mockStripeEvent } = require('../controllers/paymentController'); // require it only here
    router.post('/mock-stripe-event', mockStripeEvent);
}

module.exports = router;
