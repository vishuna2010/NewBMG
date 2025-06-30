const Quote = require('../models/Quote');
const Product = require('../models/Product'); // To fetch product details for snapshot
const User = require('../models/User'); // To fetch customer email for notification
const sendEmail = require('../utils/emailUtils'); // Import the email utility

// @desc    Create a new quote
// @route   POST /api/v1/quotes
// @access  Private (TODO: Add auth middleware - e.g., for customer or agent)
exports.createQuote = async (req, res, next) => {
  try {
    const { productId, customerId, quoteInputs } = req.body;

    if (!productId || !quoteInputs) {
      return res.status(400).json({
        success: false,
        error: 'Please provide productId and quoteInputs',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found with id of ${productId}`,
      });
    }

    // Snapshot product details
    const productDetailsSnapshot = {
      name: product.name,
      productType: product.productType,
      basePrice: product.basePrice, // Price at the time of quote
      currency: product.currency,
    };

    // --- Mock Premium Calculation ---
    // In a real scenario, this would involve complex logic based on product type,
    // quoteInputs, rating engine, underwriting rules etc.
    let calculatedPremium = product.basePrice; // Start with base price
    // Example: Add 10% if a certain input is true (very simplistic)
    if (quoteInputs.someOptionalFeature === true) {
      calculatedPremium *= 1.10;
    }
    calculatedPremium = parseFloat(calculatedPremium.toFixed(2));
    // --- End Mock Premium Calculation ---

    const quoteData = {
      product: productId,
      productDetailsSnapshot,
      quoteInputs,
      calculatedPremium,
      status: 'Quoted', // Or 'Draft' if there's a multi-step process
      // customerId will be added if provided and if user is authenticated and linked
    };

    if (customerId) { // Assuming customerId might come from authenticated user or form
      quoteData.customer = customerId;
    }

    // The pre-save hook in Quote.js will generate quoteNumber and set validUntil

    const newQuote = await Quote.create(quoteData);

    res.status(201).json({
      success: true,
      data: newQuote,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error during quote creation' });
  }
};

// @desc    Get all quotes
// @route   GET /api/v1/quotes
// @access  Private (TODO: Add auth middleware - admin/agent view, or customer sees their own)
exports.getAllQuotes = async (req, res, next) => {
  try {
    // TODO: Implement filtering based on user role (customer sees own, admin sees all/filtered)
    // For now, fetches all. Add req.query for filtering later.
    const query = {}; // Example: if (req.user.role !== 'admin') query.customer = req.user.id;

    const quotes = await Quote.find(query).populate('product', 'name productType').populate('customer', 'name email'); // Populate basic details

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Get a single quote by ID
// @route   GET /api/v1/quotes/:id
// @access  Private (TODO: Add auth middleware - owner or admin/agent)
exports.getQuoteById = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('product').populate('customer');

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote not found with id of ${req.params.id}`,
      });
    }

    // TODO: Add authorization check: if user is customer, ensure they own this quote.

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Quote not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Update quote status
// @route   PUT /api/v1/quotes/:id/status
// @access  Private (TODO: Add auth middleware - customer for accept/reject, or admin)
exports.updateQuoteStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Accepted', 'Rejected', 'Expired']; // Example statuses a user might set

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`,
      });
    }

    let quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote not found with id of ${req.params.id}`,
      });
    }

    // TODO: Add authorization:
    // - Customer can accept/reject their own 'Quoted' quotes.
    // - Admin might be able to change status more freely or expire.
    // - Prevent changing status from/to certain states (e.g., can't change from 'Accepted' back to 'Draft' easily)

    if (quote.status === 'ConvertedToPolicy') {
        return res.status(400).json({ success: false, error: 'Cannot change status of a quote already converted to a policy.' });
    }

    quote.status = status;
    if (status === 'Accepted' || status === 'Rejected') {
        // Potentially clear validUntil or log acceptance/rejection date
    }
    await quote.save();

    // Send notification email if quote is accepted
    if (quote.status === 'Accepted' && quote.customer) {
      try {
        const customer = await User.findById(quote.customer);
        if (customer && customer.email) {
          await sendEmail({
            to: customer.email,
            subject: `Your Quote ${quote.quoteNumber} has been Accepted!`,
            text: `Hi ${customer.firstName},\n\nGreat news! Your quote (Ref: ${quote.quoteNumber}) for product "${quote.productDetailsSnapshot.name}" with a premium of ${quote.calculatedPremium} ${quote.productDetailsSnapshot.currency} has been marked as Accepted.\n\nPlease proceed to the next steps for policy issuance if applicable.\n\nBest Regards,\nThe Insurance Platform Team`,
            html: `<p>Hi ${customer.firstName},</p><p>Great news! Your quote (Ref: ${quote.quoteNumber}) for product "${quote.productDetailsSnapshot.name}" with a premium of ${quote.calculatedPremium} ${quote.productDetailsSnapshot.currency} has been marked as Accepted.</p><p>Please proceed to the next steps for policy issuance if applicable.</p><p>Best Regards,<br/>The Insurance Platform Team</p>`,
          });
        }
      } catch (emailError) {
        console.error(`Failed to send quote acceptance email for quote ${quote.quoteNumber}:`, emailError);
        // Do not fail the main operation if email sending fails, just log it.
      }
    }

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Quote not found with id of ${req.params.id}` });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// Optional: Update quote details (e.g., if it's a draft)
// exports.updateQuoteDetails = async (req, res, next) => { ... }

// Optional: Delete a quote (e.g., if it's a draft and user wants to remove it)
// exports.deleteQuote = async (req, res, next) => { ... }
