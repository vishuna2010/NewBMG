const Quote = require('../models/Quote');
const Product = require('../models/Product'); // To fetch product details for snapshot
const User = require('../models/User'); // To fetch customer email for notification
const { sendTemplatedEmail } = require('../utils/emailUtils'); // Updated import

// @desc    Create a new quote
// @route   POST /api/v1/quotes
// @access  Private (Authenticated users - customer, agent, admin)
exports.createQuote = async (req, res, next) => {
  try {
    const { productId, customerId, quoteInputs } = req.body; // customerId might be optional if agent creates for new prospect or customer uses their own ID
    const loggedInUser = req.user; // Set by 'protect' middleware

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

    // Assign customer based on role and provided customerId
    if (loggedInUser.role === 'customer') {
      quoteData.customer = loggedInUser.id;
    } else if (customerId) { // For agent/admin creating for a specific customer
      // TODO: Add validation here: an agent should only be able to create quotes for their assigned customers, or admin can do for any.
      const customerExists = await User.findById(customerId);
      if (!customerExists) {
        return res.status(404).json({ success: false, error: `Customer with ID ${customerId} not found.` });
      }
      quoteData.customer = customerId;
    } else if (loggedInUser.role === 'agent' || loggedInUser.role === 'admin' || loggedInUser.role === 'staff') {
      // If agent/admin/staff and no customerId, quote might be for a prospect (customer field remains null)
      // Or, require customerId for agents/admins too if quotes must always be linked.
      // For now, allow customer to be null if not a 'customer' role user and no customerId provided.
      // This means anonymous quotes are possible if logged in user is not a customer.
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
// @access  Private (Role-dependent filtering)
exports.getAllQuotes = async (req, res, next) => {
  try {
    let queryFilters = {};
    const loggedInUser = req.user;

    if (loggedInUser.role === 'customer') {
      queryFilters.customer = loggedInUser.id;
    } else if (loggedInUser.role === 'agent') {
      // TODO: Agents might see quotes they created, or for customers they manage.
      // This requires an `agentId` field on the Quote model or linking agents to customers.
      // For now, an agent might see all customer quotes or be restricted like customers.
      // Let's assume for now they see quotes linked to any customerId they might pass in query, or their own if they are also a customer.
      // Or, if no specific filter, they might see a broader set if allowed by business rules (e.g. all quotes from their agency).
      // For simplicity here, if agent and specific customerId in query, filter by that.
      if (req.query.customerIdForAgent) {
          queryFilters.customer = req.query.customerIdForAgent;
      }
      // If you want agents to only see quotes they are associated with (e.g. quoteData.agent = loggedInUser.id when creating)
      // queryFilters.agent = loggedInUser.id;
    }
    // Admins/staff can see all, or apply further filters from req.query
    // (e.g., req.query.status, req.query.productId)
    if (req.query.status) queryFilters.status = req.query.status;
    if (req.query.productId) queryFilters.product = req.query.productId;
    // If an admin specifically queries for a customerId, allow it
    if ((loggedInUser.role === 'admin' || loggedInUser.role === 'staff') && req.query.customerId) {
        queryFilters.customer = req.query.customerId;
    }

    const quotes = await Quote.find(queryFilters).populate('product', 'name productType').populate('customer', 'firstName lastName email');

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
// @access  Private (Owner, Agent for their customers, Admin/Staff)
exports.getQuoteById = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('product').populate('customer', 'firstName lastName email');

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote not found with id of ${req.params.id}`,
      });
    }

    const loggedInUser = req.user;
    // Authorization check:
    if (loggedInUser.role === 'customer' && (!quote.customer || quote.customer._id.toString() !== loggedInUser.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to access this quote' });
    }
    // TODO: Add agent authorization logic:
    // if (loggedInUser.role === 'agent' && !isAgentAuthorizedForCustomer(loggedInUser.id, quote.customer._id)) {
    //   return res.status(403).json({ success: false, error: 'Not authorized to access this quote' });
    // }
    // Admin/staff can access any quote.

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
// @access  Private (Owner for accept/reject; Admin/Staff/Agent for others)
exports.updateQuoteStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const loggedInUser = req.user;

    // Define allowed statuses based on roles or current quote status
    const customerAllowedTransitions = { 'Quoted': ['Accepted', 'Rejected'] };
    // Admins/staff/agents might have more leeway, e.g., setting to 'Expired'
    const adminAllowedStatuses = ['Draft', 'Quoted', 'Accepted', 'Rejected', 'Expired'];


    let quote = await Quote.findById(req.params.id).populate('customer', 'email firstName'); // Populate for notification

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote not found with id of ${req.params.id}`,
      });
    }

    // Authorization & State Transition Logic
    if (quote.status === 'ConvertedToPolicy') {
      return res.status(400).json({ success: false, error: 'Cannot change status of a quote already converted to a policy.' });
    }

    if (loggedInUser.role === 'customer') {
      if (!quote.customer || quote.customer._id.toString() !== loggedInUser.id) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this quote status.' });
      }
      const allowedTransitionsForCustomer = customerAllowedTransitions[quote.status];
      if (!allowedTransitionsForCustomer || !allowedTransitionsForCustomer.includes(status)) {
        return res.status(400).json({ success: false, error: `Customers cannot change status from '${quote.status}' to '${status}'.` });
      }
    } else if (loggedInUser.role === 'agent') {
      // TODO: Agent specific logic: Can they update status for their customer's quotes?
      // For now, let's assume an agent has similar permissions to admin for status changes for simplicity,
      // but this should be refined based on business rules.
      if (!adminAllowedStatuses.includes(status)) {
         return res.status(400).json({ success: false, error: `Invalid status value: ${status}.`});
      }
    } else if (loggedInUser.role === 'admin' || loggedInUser.role === 'staff') {
      if (!adminAllowedStatuses.includes(status)) {
         return res.status(400).json({ success: false, error: `Invalid status value: ${status}.`});
      }
    } else {
      return res.status(403).json({ success: false, error: 'Not authorized to update quote status.' });
    }

    quote.status = status;
    // Update validUntil if quote becomes 'Quoted' and validUntil is not already set
    if (status === 'Quoted' && !quote.validUntil) {
        quote.validUntil = new Date(new Date().setDate(new Date().getDate() + 30)); // Default 30 days
    } else if (status === 'Accepted' || status === 'Rejected' || status === 'Expired') {
        // Potentially clear validUntil or log acceptance/rejection date
    }
    await quote.save();

    // Send notification email if quote is accepted
    // Send notification email if quote is accepted
    if (quote.status === 'Accepted' && quote.customer) { // quote.customer should be populated with at least email and firstName
      try {
        // const customer = await User.findById(quote.customer._id); // Not needed if quote.customer is populated properly
        if (quote.customer && quote.customer.email) {
          await sendTemplatedEmail({
            to: quote.customer.email,
            templateName: 'quoteAccepted', // This template needs to be created in the DB
            dataContext: {
              firstName: quote.customer.firstName,
              quoteNumber: quote.quoteNumber,
              productName: quote.productDetailsSnapshot.name,
              premiumAmount: quote.calculatedPremium,
              premiumCurrency: quote.productDetailsSnapshot.currency,
              // Add other relevant details like a link to the quote or next steps
              // quoteLink: `${process.env.FRONTEND_URL}/quotes/${quote._id}` // Example
            },
          });
        }
      } catch (emailError) {
        console.error(`Failed to send quote acceptance email for quote ${quote.quoteNumber}:`, emailError.message);
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
