const UnderwritingRule = require('../models/UnderwritingRule');
const Product = require('../models/Product'); // To check if product exists
const { asyncHandler } = require('../utils/asyncHandler'); // Corrected import
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new underwriting rule for a product
// @route   POST /api/v1/products/:productId/underwritingrules
// @access  Private (Admin, Staff)
exports.createUnderwritingRule = asyncHandler(async (req, res, next) => {
  req.body.productId = req.params.productId;
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.productId}`, 404)
    );
  }

  const underwritingRule = await UnderwritingRule.create(req.body);
  res.status(201).json({
    success: true,
    data: underwritingRule,
  });
});

// @desc    Get all underwriting rules for a specific product
// @route   GET /api/v1/products/:productId/underwritingrules
// @access  Private (Admin, Staff)
exports.getUnderwritingRulesForProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.productId}`, 404)
    );
  }

  const rules = await UnderwritingRule.find({ productId: req.params.productId }).populate('createdBy', 'name email').populate('updatedBy', 'name email');

  res.status(200).json({
    success: true,
    count: rules.length,
    data: rules,
  });
});

// @desc    Get a single underwriting rule by ID
// @route   GET /api/v1/underwritingrules/:id
// @access  Private (Admin, Staff)
exports.getUnderwritingRuleById = asyncHandler(async (req, res, next) => {
  const rule = await UnderwritingRule.findById(req.params.id).populate('createdBy', 'name email').populate('updatedBy', 'name email');

  if (!rule) {
    return next(
      new ErrorResponse(`Underwriting rule not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: rule,
  });
});

// @desc    Update an underwriting rule
// @route   PUT /api/v1/underwritingrules/:id
// @access  Private (Admin, Staff)
exports.updateUnderwritingRule = asyncHandler(async (req, res, next) => {
  let rule = await UnderwritingRule.findById(req.params.id);

  if (!rule) {
    return next(
      new ErrorResponse(`Underwriting rule not found with id of ${req.params.id}`, 404)
    );
  }

  // Ensure productId is not changed via this update route directly
  if (req.body.productId && req.body.productId.toString() !== rule.productId.toString()) {
      return next(new ErrorResponse('Cannot change the product association. Create a new rule instead.', 400));
  }

  delete req.body.productId; // Remove from body if present to avoid accidental update

  if (req.user) {
    req.body.updatedBy = req.user.id;
  }

  rule = await UnderwritingRule.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: rule,
  });
});

// @desc    Delete an underwriting rule
// @route   DELETE /api/v1/underwritingrules/:id
// @access  Private (Admin, Staff)
exports.deleteUnderwritingRule = asyncHandler(async (req, res, next) => {
  const rule = await UnderwritingRule.findById(req.params.id);

  if (!rule) {
    return next(
      new ErrorResponse(`Underwriting rule not found with id of ${req.params.id}`, 404)
    );
  }

  await rule.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
