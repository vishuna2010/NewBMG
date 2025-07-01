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

const Policy = require('../models/Policy'); // Needed for updating policy status
const { sendTemplatedEmail } = require('../utils/emailUtils'); // For payment confirmation email
const User = require('../models/User'); // To fetch user details for email

// @desc    Handle Stripe Webhooks
// @route   POST /api/v1/payments/webhook
// @access  Public (Webhook signature is used for verification)
exports.stripeWebhookHandler = async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe webhook secret (STRIPE_WEBHOOK_SECRET) not configured.");
    return res.status(500).send('Webhook secret not configured.');
  }
  if (!stripe || typeof stripe.webhooks.constructEvent !== 'function') {
    console.error("Stripe SDK not properly initialized for webhooks.");
    return res.status(500).send('Stripe SDK error for webhooks.');
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // req.body needs to be the raw request body for signature verification
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntentSucceeded.id);
      // Business logic for successful payment:
      try {
        // Example: Update policy status if policyId is in metadata
        if (paymentIntentSucceeded.metadata && paymentIntentSucceeded.metadata.policyId) {
          const policy = await Policy.findById(paymentIntentSucceeded.metadata.policyId);
          if (policy && policy.status === 'PendingActivation') { // Or other relevant status
            policy.status = 'Active';
            // Add payment details to policy if needed (e.g., transaction ID, payment date)
            // policy.payments = policy.payments || [];
            // policy.payments.push({
            //   stripePaymentIntentId: paymentIntentSucceeded.id,
            //   amount: paymentIntentSucceeded.amount / 100, // convert from cents
            //   currency: paymentIntentSucceeded.currency,
            //   paymentDate: new Date(paymentIntentSucceeded.created * 1000) // Stripe timestamp is in seconds
            // });
            await policy.save();
            console.log(`Policy ${policy.policyNumber} status updated to Active.`);

            // Send payment confirmation email
            if (policy.customer) {
              const customer = await User.findById(policy.customer);
              if (customer && customer.email) {
                await sendTemplatedEmail({
                  to: customer.email,
                  templateName: 'paymentConfirmation', // Create this template
                  dataContext: {
                    firstName: customer.firstName,
                    policyNumber: policy.policyNumber,
                    amountPaid: (paymentIntentSucceeded.amount / 100).toFixed(2),
                    currency: paymentIntentSucceeded.currency.toUpperCase(),
                  }
                }).catch(emailErr => console.error("Failed to send payment confirmation email:", emailErr));
              }
            }
          } else if (policy) {
            console.log(`Policy ${policy.policyNumber} already active or in different state: ${policy.status}. No status change from webhook for PI: ${paymentIntentSucceeded.id}`);
          } else {
             console.warn(`Policy not found for policyId: ${paymentIntentSucceeded.metadata.policyId} in PaymentIntent ${paymentIntentSucceeded.id}`);
          }
        } else {
            console.log('PaymentIntent succeeded but no policyId in metadata:', paymentIntentSucceeded.id);
        }
        // TODO: Handle other scenarios, like generic order payments if not tied to a policy.
      } catch (dbError) {
        console.error('Error updating application state after payment success:', dbError);
        // Optionally, you could return a 500 here to signal Stripe to retry (if applicable for your error)
        // but be cautious with retries for database errors.
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      console.log('PaymentIntent failed:', paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
      // Business logic for failed payment:
      // - Notify the customer
      // - Update order/policy status to 'PaymentFailed' or similar
      // - Log the error details
      // Example:
      // if (paymentIntentFailed.metadata && paymentIntentFailed.metadata.policyId) {
      //    // ... find policy, update status, send email ...
      // }
      break;

    // ... handle other event types as needed (e.g., charge.succeeded, invoice.payment_succeeded)

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// @desc    Mock a Stripe event for local testing (DEVELOPMENT ONLY)
// @route   POST /api/v1/payments/mock-stripe-event
// @access  Development only (should be disabled or protected in production)
exports.mockStripeEvent = async (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, error: 'This endpoint is not available in production.' });
  }

  const mockEvent = req.body; // Expects a mock Stripe event object in the request body

  if (!mockEvent || !mockEvent.type || !mockEvent.data || !mockEvent.data.object) {
    return res.status(400).json({ success: false, error: 'Invalid mock event structure.' });
  }

  console.log(`\n--- MOCK STRIPE EVENT RECEIVED (${mockEvent.type}) ---`);
  // Simulate the core logic of stripeWebhookHandler for the given event type
  // This bypasses signature verification and direct Stripe interaction.

  try {
    switch (mockEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = mockEvent.data.object;
        console.log('Mock PaymentIntent succeeded:', paymentIntentSucceeded.id);
        if (paymentIntentSucceeded.metadata && paymentIntentSucceeded.metadata.policyId) {
          const policy = await Policy.findById(paymentIntentSucceeded.metadata.policyId);
          if (policy && policy.status === 'PendingActivation') {
            policy.status = 'Active';
            await policy.save();
            console.log(`Mock: Policy ${policy.policyNumber} status updated to Active.`);
            // Simulate sending email
            if (policy.customer) {
              const customer = await User.findById(policy.customer);
              if (customer && customer.email) {
                console.log(`Mock: Would send 'paymentConfirmation' email to ${customer.email}`);
                // sendTemplatedEmail({ ... }) // Actual call can be made if Ethereal is set up
              }
            }
          } else if(policy) {
            console.log(`Mock: Policy ${policy.policyNumber} status is ${policy.status}, not PendingActivation. No change.`);
          } else {
            console.warn(`Mock: Policy not found for policyId: ${paymentIntentSucceeded.metadata.policyId}`);
          }
        } else {
            console.log('Mock: PaymentIntent succeeded but no policyId in metadata:', paymentIntentSucceeded.id);
        }
        break;

      case 'payment_intent.payment_failed':
        const paymentIntentFailed = mockEvent.data.object;
        console.log('Mock PaymentIntent failed:', paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
        // Add mock logic for failed payment if needed for testing
        break;

      default:
        console.log(`Mock: Unhandled event type ${mockEvent.type}`);
    }
    res.status(200).json({ success: true, message: `Mock event ${mockEvent.type} processed.` });
  } catch (error) {
    console.error("Error processing mock Stripe event:", error);
    res.status(500).json({ success: false, error: `Error processing mock event: ${error.message}`});
  }
};
