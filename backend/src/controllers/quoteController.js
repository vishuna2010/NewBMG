const Quote = require('../models/Quote');
const Product = require('../models/Product'); // To fetch product details for snapshot
const User = require('../models/User'); // To fetch customer email for notification
const { sendTemplatedEmail } = require('../utils/emailUtils'); // Updated import
const premiumCalculationService = require('../services/premiumCalculationService');

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

    // Validate quote inputs against rating factors
    const validation = await premiumCalculationService.validateQuoteInputs(product.productType, quoteInputs);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Quote input validation failed',
        details: validation.errors,
      });
    }

    // Calculate premium using the rating engine
    const calculationResult = await premiumCalculationService.calculatePremium({
      product,
      quoteInputs,
      customer: customerId ? await User.findById(customerId) : null
    });

    if (!calculationResult.success) {
      return res.status(400).json({
        success: false,
        error: `Premium calculation failed: ${calculationResult.error}`,
      });
    }

    // Snapshot product details
    const productDetailsSnapshot = {
      name: product.name,
      productType: product.productType,
      basePrice: product.basePrice, // Price at the time of quote
      currency: product.currency,
    };

    const quoteData = {
      product: productId,
      productDetailsSnapshot,
      quoteInputs,
      calculatedPremium: calculationResult.premium,
      premiumBreakdown: calculationResult.breakdown, // Store the calculation breakdown
      status: 'Quoted', // Or 'Draft' if there's a multi-step process
      // customerId will be added if provided and if user is authenticated and linked
    };

    // Assign customer and/or agent based on role
    if (loggedInUser.role === 'customer') {
      quoteData.customer = loggedInUser.id;
    } else if (loggedInUser.role === 'agent') {
      quoteData.agentId = loggedInUser.id;
      if (customerId) {
        // TODO: Validate if this agent is allowed to create a quote for this customerId.
        // For now, we'll assume they can if the customerId is valid.
        const customerExists = await User.findById(customerId);
        if (!customerExists || customerExists.role !== 'customer') { // Ensure it's a customer
          return res.status(404).json({ success: false, error: `Customer with ID ${customerId} not found or is not a customer.` });
        }
        quoteData.customer = customerId;
      }
      // If no customerId, it's a quote for a prospect by an agent.
    } else if (['admin', 'staff'].includes(loggedInUser.role)) {
      // Admin/staff can create quotes for any customer or for prospects
      if (customerId) {
        const customerExists = await User.findById(customerId);
         if (!customerExists || customerExists.role !== 'customer') {
          return res.status(404).json({ success: false, error: `Customer with ID ${customerId} not found or is not a customer.` });
        }
        quoteData.customer = customerId;
      }
      // They could also be assigned as an "agent" on the quote if a mechanism exists, or a general createdBy field.
      // For now, admin/staff created quotes won't have an agentId unless explicitly passed (which is not current logic).
    }

    // The pre-save hook in Quote.js will generate quoteNumber and set validUntil

    const newQuote = await Quote.create(quoteData);

    res.status(201).json({
      success: true,
      data: newQuote,
      calculation: {
        premium: calculationResult.premium,
        currency: calculationResult.currency,
        breakdown: calculationResult.breakdown
      }
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
      // Agents see quotes they created.
      queryFilters.agentId = loggedInUser.id;
      // If agent also wants to filter by a specific customer for their quotes:
      if (req.query.customerId) {
        queryFilters.customer = req.query.customerId;
      }
    }
    // Admins/staff can see all quotes unless they provide specific filters.
    // Admin/staff can filter by any field passed in req.query that matches schema (e.g., status, productId, customerId, agentId)
    if (['admin', 'staff'].includes(loggedInUser.role)) {
        if (req.query.customerId) queryFilters.customer = req.query.customerId;
        if (req.query.agentId) queryFilters.agentId = req.query.agentId;
        // other admin-specific filters can be added from req.query
    }
    if (req.query.status) queryFilters.status = req.query.status;
    if (req.query.productId) queryFilters.product = req.query.productId;


    const quotes = await Quote.find(queryFilters).populate('product', 'name productType').populate('customer', 'firstName lastName email').populate('agentId', 'firstName lastName email');

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
    // Agent authorization: Can view if they are the agent on the quote OR if it's for their customer (more complex check deferred)
    if (loggedInUser.role === 'agent' &&
        (!quote.agentId || quote.agentId.toString() !== loggedInUser.id) &&
        (!quote.customer || quote.customer._id.toString() !== loggedInUser.id) /* agent might also be customer */
    ) {
      // TODO: More complex agent logic: if quote.customer is one of agent's managed customers.
      // For now, simple check: if agent created it OR if it's a quote for themselves (as a customer).
      // If neither, and they are not admin/staff, then deny.
      if (!(quote.agentId && quote.agentId.toString() === loggedInUser.id)) {
         return res.status(403).json({ success: false, error: 'Agent not authorized for this quote unless directly linked or owner.' });
      }
    }
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
      // Agent can update status if they are linked to the quote via agentId
      if (!quote.agentId || quote.agentId.toString() !== loggedInUser.id) {
        // As a fallback, allow agent to update if they are also the customer on this quote (edge case)
        if (!quote.customer || quote.customer._id.toString() !== loggedInUser.id) {
            return res.status(403).json({ success: false, error: 'Agent not authorized to update this quote status unless linked or owner.' });
        }
        // If agent is also customer, apply customer transition rules
        const allowedTransitionsForCustomer = customerAllowedTransitions[quote.status];
        if (!allowedTransitionsForCustomer || !allowedTransitionsForCustomer.includes(status)) {
            return res.status(400).json({ success: false, error: `User (as customer) cannot change status from '${quote.status}' to '${status}'.` });
        }
      } else {
        // Agent is linked, apply admin-like allowed statuses for now
        // TODO: Define specific agent allowed status transitions if different from admin
        if (!adminAllowedStatuses.includes(status)) {
           return res.status(400).json({ success: false, error: `Invalid status value '${status}' for agent.`});
        }
      }
    } else if (loggedInUser.role === 'admin' || loggedInUser.role === 'staff') {
      if (!adminAllowedStatuses.includes(status)) {
         return res.status(400).json({ success: false, error: `Invalid status value '${status}' for admin/staff.`});
      }
    } else {
      // Should not happen if 'protect' middleware is effective
      return res.status(403).json({ success: false, error: 'Not authorized to update quote status due to unknown role.' });
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

const PDFDocument = require('pdfkit');
const { uploadToS3 } = require('../utils/s3Handler');
const { v4: uuidv4 } = require('uuid');

// @desc    Generate PDF for a quote, upload to S3, and save URL to quote
// @route   POST /api/v1/quotes/:id/generate-pdf
// @access  Private (Owner, Agent for their customers, Admin/Staff)
exports.generateQuotePdf = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('product')
      .populate('customer', 'firstName lastName email')
      .populate('agentId', 'firstName lastName email');

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote not found with id of ${req.params.id}`,
      });
    }

    // Authorization (similar to getQuoteById)
    const loggedInUser = req.user;
    if (loggedInUser.role === 'customer' && (!quote.customer || quote.customer._id.toString() !== loggedInUser.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to generate PDF for this quote' });
    }
    if (loggedInUser.role === 'agent' &&
        (!quote.agentId || quote.agentId.toString() !== loggedInUser.id) &&
        (!quote.customer || quote.customer._id.toString() !== loggedInUser.id)
    ) {
      if (!(quote.agentId && quote.agentId.toString() === loggedInUser.id)) {
         return res.status(403).json({ success: false, error: 'Agent not authorized for this quote unless directly linked or owner.' });
      }
    }
    // Admin/staff can proceed.

    // --- PDF Generation Logic ---
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const fileName = `quote_${quote.quoteNumber}_${uuidv4()}.pdf`;
      const s3Folder = `quotes/${quote._id.toString()}`; // Store in a folder specific to the quote

      try {
        const s3Data = await uploadToS3(pdfBuffer, fileName, 'application/pdf', s3Folder);

        quote.quotePdfUrl = s3Data.Location; // Assuming Quote model will have 'quotePdfUrl'
        await quote.save();

        res.status(200).json({
          success: true,
          message: 'Quote PDF generated and saved successfully.',
          data: { quotePdfUrl: s3Data.Location, quoteId: quote._id },
        });
      } catch (s3Error) {
        console.error('S3 upload or quote save error:', s3Error);
        return res.status(500).json({ success: false, error: 'Failed to upload PDF to S3 or save quote.' });
      }
    });

    // Content for the PDF
    doc.fontSize(20).text(`Quote: ${quote.quoteNumber}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`);
    if (quote.validUntil) {
      doc.text(`Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}`);
    }
    doc.moveDown();

    if (quote.customer) {
      doc.fontSize(14).text('Customer Details:', { underline: true });
      doc.fontSize(12).text(`Name: ${quote.customer.firstName} ${quote.customer.lastName}`);
      doc.text(`Email: ${quote.customer.email}`);
      doc.moveDown();
    }

    if (quote.agentId) {
      doc.fontSize(14).text('Agent Details:', { underline: true });
      doc.fontSize(12).text(`Name: ${quote.agentId.firstName} ${quote.agentId.lastName}`);
      doc.text(`Email: ${quote.agentId.email}`);
      doc.moveDown();
    }

    doc.fontSize(14).text('Product Details:', { underline: true });
    doc.fontSize(12).text(`Product: ${quote.productDetailsSnapshot.name} (${quote.productDetailsSnapshot.productType})`);
    doc.moveDown();

    doc.fontSize(14).text('Quote Inputs:', { underline: true });
    doc.fontSize(10);
    for (const key in quote.quoteInputs) {
      if (Object.hasOwnProperty.call(quote.quoteInputs, key)) {
        doc.text(`${key}: ${JSON.stringify(quote.quoteInputs[key])}`);
      }
    }
    doc.moveDown();
    doc.moveDown();

    doc.fontSize(16).text('Premium:', { underline: true });
    doc.fontSize(14).text(`${quote.calculatedPremium} ${quote.productDetailsSnapshot.currency}`, { align: 'right' });
    doc.moveDown();

    doc.fontSize(8).text('Thank you for your business!', { align: 'center'});

    doc.end();

  } catch (error) {
    console.error('Error in generateQuotePdf:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Quote not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error generating PDF' });
  }
};

// @desc    Create a new version of a quote
// @route   POST /api/v1/quotes/:id/versions
// @access  Private (Owner, Agent for their customers, Admin/Staff)
exports.createNewVersion = async (req, res, next) => {
  try {
    const { changes } = req.body;
    const loggedInUser = req.user;

    let quote = await Quote.findById(req.params.id).populate('customer', 'firstName lastName email');

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote not found with id of ${req.params.id}`,
      });
    }

    // Authorization check (similar to getQuoteById)
    if (loggedInUser.role === 'customer' && (!quote.customer || quote.customer._id.toString() !== loggedInUser.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to create version for this quote' });
    }
    if (loggedInUser.role === 'agent' &&
        (!quote.agentId || quote.agentId.toString() !== loggedInUser.id) &&
        (!quote.customer || quote.customer._id.toString() !== loggedInUser.id)
    ) {
      if (!(quote.agentId && quote.agentId.toString() === loggedInUser.id)) {
         return res.status(403).json({ success: false, error: 'Agent not authorized for this quote unless directly linked or owner.' });
      }
    }

    // Create new version
    const newVersion = await quote.createNewVersion(changes || 'Quote updated');

    res.status(201).json({
      success: true,
      data: newVersion,
      message: `New version ${newVersion.version} created successfully`,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Quote not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error creating new version' });
  }
};

// @desc    Get all versions of a quote
// @route   GET /api/v1/quotes/:id/versions
// @access  Private (Owner, Agent for their customers, Admin/Staff)
exports.getAllVersions = async (req, res, next) => {
  try {
    const loggedInUser = req.user;

    // First check if the quote exists and user has access
    const quote = await Quote.findById(req.params.id).populate('customer', 'firstName lastName email');

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: `Quote not found with id of ${req.params.id}`,
      });
    }

    // Authorization check (similar to getQuoteById)
    if (loggedInUser.role === 'customer' && (!quote.customer || quote.customer._id.toString() !== loggedInUser.id)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view versions for this quote' });
    }
    if (loggedInUser.role === 'agent' &&
        (!quote.agentId || quote.agentId.toString() !== loggedInUser.id) &&
        (!quote.customer || quote.customer._id.toString() !== loggedInUser.id)
    ) {
      if (!(quote.agentId && quote.agentId.toString() === loggedInUser.id)) {
         return res.status(403).json({ success: false, error: 'Agent not authorized for this quote unless directly linked or owner.' });
      }
    }

    // Get all versions
    const versions = await Quote.getAllVersions(req.params.id);

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Quote not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error fetching versions' });
  }
};
