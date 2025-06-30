const Policy = require('../models/Policy');
const Quote = require('../models/Quote');
const Customer = require('../models/Customer'); // May not be strictly needed here if IDs are sufficient
const Product = require('../models/Product');   // May not be strictly needed here

// @desc    Create a new policy from an accepted quote
// @route   POST /api/v1/policies/from-quote
// @access  Private (TODO: Add auth - e.g., customer or admin/agent)
exports.createPolicyFromQuote = async (req, res, next) => {
  const { quoteId } = req.body;

  if (!quoteId) {
    return res.status(400).json({ success: false, error: 'Quote ID is required' });
  }

  try {
    const quote = await Quote.findById(quoteId).populate('product').populate('customer');

    if (!quote) {
      return res.status(404).json({ success: false, error: `Quote not found with id ${quoteId}` });
    }

    if (quote.status !== 'Accepted') {
      return res.status(400).json({ success: false, error: `Quote status must be 'Accepted' to create a policy. Current status: ${quote.status}` });
    }

    // Check if a policy already exists for this quote
    const existingPolicy = await Policy.findOne({ originalQuote: quoteId });
    if (existingPolicy) {
        return res.status(400).json({ success: false, error: `A policy already exists for quote ${quoteId}. Policy number: ${existingPolicy.policyNumber}`});
    }

    // Determine effective and expiry dates (example logic: starts today, term 1 year)
    // This logic would typically be more sophisticated, based on quote or product terms.
    const effectiveDate = new Date();
    const expiryDate = new Date(effectiveDate);
    const policyTerm = "12 Months"; // This should ideally come from product or quote specifics
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);


    const policyData = {
      customer: quote.customer._id, // Assuming customer is populated and we need its ID
      product: quote.product._id,   // Assuming product is populated
      originalQuote: quote._id,
      policyDetailsSnapshot: {
        productName: quote.productDetailsSnapshot.name || quote.product.name,
        productType: quote.productDetailsSnapshot.productType || quote.product.productType,
        coverages: quote.quoteInputs, // Assuming quoteInputs directly translate to chosen coverages for snapshot
        quoteInputs: quote.quoteInputs, // Or a more structured version if needed
      },
      premiumAmount: quote.calculatedPremium,
      premiumCurrency: quote.productDetailsSnapshot.currency || quote.product.currency,
      status: 'PendingActivation', // Or 'Active' if payment is assumed/handled elsewhere
      effectiveDate,
      expiryDate,
      term: policyTerm, // Example term
      paymentSchedule: 'Annual', // Example, should ideally come from quote/product
      // documents: [] // Initialize or add initial documents like quote PDF
    };

    const newPolicy = await Policy.create(policyData);

    // Update the quote status
    quote.status = 'ConvertedToPolicy';
    await quote.save();

    res.status(201).json({
      success: true,
      data: newPolicy,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    if (error.name === 'CastError' && error.path === 'product') { // Example specific cast error
        return res.status(404).json({ success: false, error: `Invalid product ID format found in quote.` });
    }
    console.error("Create Policy Error:", error);
    res.status(500).json({ success: false, error: error.message || 'Server Error creating policy' });
  }
};


// --- Admin CRUD Operations for Policies ---

// @desc    Get all policies
// @route   GET /api/v1/policies
// @access  Private (Admin/Agent) - TODO: Add auth middleware
exports.getAllPolicies = async (req, res, next) => {
  try {
    // TODO: Implement filtering (by customer, status, product, dates) and pagination
    const policies = await Policy.find(req.query) // Basic filtering via query params
      .populate('customer', 'firstName lastName email')
      .populate('product', 'name productType')
      .populate('originalQuote', 'quoteNumber calculatedPremium');

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Get a single policy by ID
// @route   GET /api/v1/policies/:id
// @access  Private (Admin/Agent or Customer owner) - TODO: Add auth middleware
exports.getPolicyById = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id)
      .populate('customer')
      .populate('product')
      .populate('originalQuote');

    if (!policy) {
      return res.status(404).json({
        success: false,
        error: `Policy not found with id of ${req.params.id}`,
      });
    }
    // TODO: Authorization: Check if user is admin or owner of the policy
    res.status(200).json({ success: true, data: policy });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Update a policy (e.g., status, add documents)
// @route   PUT /api/v1/policies/:id
// @access  Private (Admin) - TODO: Add auth middleware
exports.updatePolicy = async (req, res, next) => {
  try {
    // Determine what fields can be updated by admin.
    // Critical financial details or core terms might need endorsement process instead.
    const { status, documents, notes, paymentSchedule /* other updatable fields */ } = req.body;

    // Construct update object carefully
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentSchedule) updateData.paymentSchedule = paymentSchedule;
    if (notes) updateData.notes = notes;
    // For documents, decide on handling: replace array, push to array, etc.
    // Example: Pushing a new document
    // if (req.body.newDocument) {
    //   updateData.$push = { documents: req.body.newDocument };
    // } else if (documents) { // Or replace the whole array if provided
    //  updateData.documents = documents;
    // }


    let policy = await Policy.findById(req.params.id);
    if (!policy) {
      return res.status(404).json({ success: false, error: `Policy not found with id ${req.params.id}` });
    }

    // Manually apply updates to trigger middleware if any, or use findByIdAndUpdate
    if (status) policy.status = status;
    if (paymentSchedule) policy.paymentSchedule = paymentSchedule;
    if (notes !== undefined) policy.notes = notes; // Allow clearing notes

    // Example for adding a document (ensure req.body.newDocument is structured correctly)
    if (req.body.newDocument && req.body.newDocument.documentName && req.body.newDocument.documentType && req.body.newDocument.documentUrl) {
        policy.documents.push(req.body.newDocument);
    } else if (documents && Array.isArray(documents)) { // If entire documents array is being replaced
        policy.documents = documents;
    }


    const updatedPolicy = await policy.save({ runValidators: true });
    // Or:
    // const updatedPolicy = await Policy.findByIdAndUpdate(req.params.id, updateData, {
    //   new: true,
    //   runValidators: true,
    // });

    if (!updatedPolicy) { // Should be caught by findById above, but as a safeguard
        return res.status(404).json({ success: false, error: `Policy not found or update failed for id ${req.params.id}` });
    }

    res.status(200).json({ success: true, data: updatedPolicy });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
    }
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ success: false, error: messages });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Delete a policy (Use with extreme caution - typically soft delete or archive)
// @route   DELETE /api/v1/policies/:id
// @access  Private (Super Admin Only) - TODO: Add strict auth
exports.deletePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ success: false, error: `Policy not found with id ${req.params.id}` });
    }

    // Instead of hard delete, consider changing status to 'Archived' or 'Deleted'
    // For this example, a hard delete is shown:
    // await policy.deleteOne();
    // Soft delete example:
    policy.status = 'Cancelled'; // Or a specific 'Deleted' status
    policy.isActive = false; // If you have an isActive field
    await policy.save();


    res.status(200).json({ success: true, data: {}, message: 'Policy marked as Cancelled (soft delete). Hard delete not recommended.' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Policy not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};
