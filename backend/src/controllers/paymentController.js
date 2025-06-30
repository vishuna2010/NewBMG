// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Initialize Stripe with secret key from .env
const Stripe = require('stripe'); // Import Stripe constructor

// It's generally better to initialize Stripe once and export it or pass it around,
// but for a simple stub, initializing here is okay.
// Ensure STRIPE_SECRET_KEY is in your .env file
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
    console.warn("STRIPE_SECRET_KEY not found in .env. Payment controller will not function correctly.");
    // Create a mock stripe object for basic code structure to work without crashing if key is missing during early dev
    stripe = {
        paymentIntents: {
            create: async () => {
                console.error("Stripe not configured: STRIPE_SECRET_KEY is missing.");
                throw new Error("Stripe is not configured due to missing secret key.");
            }
        }
    };
}


// @desc    Create a Stripe Payment Intent
// @route   POST /api/v1/payments/create-payment-intent
// @access  Private (Authenticated User) - TODO: Add auth middleware
exports.createPaymentIntent = async (req, res, next) => {
  const { amount, currency, customerId, paymentMethodId, description, metadata } = req.body;
  // amount should be in the smallest currency unit (e.g., cents for USD)

  if (!amount || !currency) {
    return res.status(400).json({ success: false, error: 'Amount and currency are required.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ success: false, error: 'Stripe payment gateway is not configured on the server.' });
  }

  try {
    const paymentIntentParams = {
      amount: Math.round(amount * 100), // Convert to cents/smallest unit
      currency: currency.toLowerCase(), // Stripe expects lowercase currency codes
      description: description || 'Insurance Policy Premium', // Optional but good
      // customer: stripeCustomerId, // Optional: If you have Stripe Customer IDs stored
      // payment_method: paymentMethodId, // Optional: If you have a specific payment method ID
      // confirm: true, // Optional: Set to true to attempt to confirm the PaymentIntent immediately
      // automatic_payment_methods: { enabled: true }, // Recommended by Stripe for flexibility
      metadata: {
        internalCustomerId: customerId || 'N/A', // Your app's customer ID
        // policyId: relatedPolicyId, // Any other relevant IDs
        ...metadata // Any other metadata you want to pass
      },
    };

    // If you want to let Stripe automatically handle payment methods on the client (recommended)
    paymentIntentParams.automatic_payment_methods = { enabled: true };

    // If you are passing a specific payment_method_id and want to confirm immediately:
    // if (paymentMethodId) {
    //   paymentIntentParams.payment_method = paymentMethodId;
    //   paymentIntentParams.confirm = true;
    //   // paymentIntentParams.return_url = 'your_return_url_after_payment'; // if using off-session confirmation
    // }


    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret, // This is sent to the frontend to confirm the payment
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Stripe Payment Intent Error:', error);
    // More specific Stripe error handling can be added here
    // e.g., error.type, error.code, error.message
    res.status(500).json({ success: false, error: error.message || 'Failed to create payment intent.' });
  }
};

// TODO: Add webhook handler for Stripe events (payment_intent.succeeded, payment_intent.payment_failed, etc.)
// This is crucial for reliably updating order/payment status in your database.
// exports.stripeWebhookHandler = (req, res) => { ... }
