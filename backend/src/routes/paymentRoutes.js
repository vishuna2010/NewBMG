const express = require('express');
const { createPaymentIntent /*, stripeWebhookHandler */ } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware'); // Assuming payments are by authenticated users

const router = express.Router();

// This endpoint creates a payment intent for the frontend to use with Stripe Elements/Checkout
router.post('/create-payment-intent', protect, createPaymentIntent);

// Stripe Webhook Endpoint - public, but verified by Stripe signature
// router.post('/webhook', express.raw({type: 'application/json'}), stripeWebhookHandler);
// Note: express.raw middleware is needed for Stripe to verify the webhook signature.

module.exports = router;
