const RateTable = require('../models/RateTable');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all rate tables
// @route   GET /api/rate-tables
// @access  Private
const getAllRateTables = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, productType, isActive } = req.query;
  
  const query = {};
  
  // Search filter
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Product type filter
  if (productType) {
    query.productType = productType;
  }
  
  // Active status filter
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 }
  };
  
  const rateTables = await RateTable.find(query)
    .sort(options.sort)
    .limit(options.limit * 1)
    .skip((options.page - 1) * options.limit)
    .exec();
    
  const total = await RateTable.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: rateTables,
    pagination: {
      currentPage: options.page,
      totalPages: Math.ceil(total / options.limit),
      totalItems: total,
      itemsPerPage: options.limit
    }
  });
});

// @desc    Get rate table by ID
// @route   GET /api/rate-tables/:id
// @access  Private
const getRateTableById = asyncHandler(async (req, res) => {
  const rateTable = await RateTable.findById(req.params.id);
  
  if (!rateTable) {
    return res.status(404).json({
      success: false,
      message: 'Rate table not found'
    });
  }
  
  res.status(200).json({
    success: true,
    data: rateTable
  });
});

// @desc    Create new rate table
// @route   POST /api/rate-tables
// @access  Private
const createRateTable = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    description,
    productType,
    baseRates,
    adjustments,
    geographicFactors,
    effectiveDate,
    expiryDate,
    notes
  } = req.body;
  
  // Check if code already exists
  const existingRateTable = await RateTable.findOne({ code });
  if (existingRateTable) {
    return res.status(400).json({
      success: false,
      message: 'Rate table code already exists'
    });
  }
  
  // Get the latest version for this product type
  const latestRateTable = await RateTable.findOne({ productType })
    .sort({ version: -1 });
  
  const version = latestRateTable ? latestRateTable.version + 1 : 1;
  
  const rateTable = await RateTable.create({
    name,
    code,
    description,
    productType,
    baseRates: baseRates || [],
    adjustments: adjustments || [],
    geographicFactors: geographicFactors || [],
    version,
    effectiveDate: effectiveDate || new Date(),
    expiryDate,
    notes,
    createdBy: req.user.id
  });
  
  res.status(201).json({
    success: true,
    data: rateTable
  });
});

// @desc    Update rate table
// @route   PUT /api/rate-tables/:id
// @access  Private
const updateRateTable = asyncHandler(async (req, res) => {
  const rateTable = await RateTable.findById(req.params.id);
  
  if (!rateTable) {
    return res.status(404).json({
      success: false,
      message: 'Rate table not found'
    });
  }
  
  // Check if code is being changed and if it already exists
  if (req.body.code && req.body.code !== rateTable.code) {
    const existingRateTable = await RateTable.findOne({ code: req.body.code });
    if (existingRateTable) {
      return res.status(400).json({
        success: false,
        message: 'Rate table code already exists'
      });
    }
  }
  
  const updatedRateTable = await RateTable.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    data: updatedRateTable
  });
});

// @desc    Delete rate table
// @route   DELETE /api/rate-tables/:id
// @access  Private
const deleteRateTable = asyncHandler(async (req, res) => {
  const rateTable = await RateTable.findById(req.params.id);
  
  if (!rateTable) {
    return res.status(404).json({
      success: false,
      message: 'Rate table not found'
    });
  }
  
  await RateTable.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Rate table deleted successfully'
  });
});

// @desc    Get rate tables by product type
// @route   GET /api/rate-tables/product/:productType
// @access  Private
const getRateTablesByProductType = asyncHandler(async (req, res) => {
  const { productType } = req.params;
  const { isActive } = req.query;
  
  const query = { productType };
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  const rateTables = await RateTable.find(query)
    .sort({ version: -1, createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: rateTables
  });
});

// @desc    Get active rate table for product type
// @route   GET /api/rate-tables/active/:productType
// @access  Private
const getActiveRateTable = asyncHandler(async (req, res) => {
  const { productType } = req.params;
  
  const rateTable = await RateTable.getActiveRateTable(productType);
  
  if (!rateTable) {
    return res.status(404).json({
      success: false,
      message: 'No active rate table found for this product type'
    });
  }
  
  res.status(200).json({
    success: true,
    data: rateTable
  });
});

// @desc    Create new version of rate table
// @route   POST /api/rate-tables/:id/version
// @access  Private
const createNewVersion = asyncHandler(async (req, res) => {
  const originalRateTable = await RateTable.findById(req.params.id);
  
  if (!originalRateTable) {
    return res.status(404).json({
      success: false,
      message: 'Rate table not found'
    });
  }
  
  // Get the latest version for this product type
  const latestRateTable = await RateTable.findOne({ productType: originalRateTable.productType })
    .sort({ version: -1 });
  
  const newVersion = latestRateTable ? latestRateTable.version + 1 : 1;
  
  // Create new version with updated data
  const newRateTableData = {
    ...originalRateTable.toObject(),
    _id: undefined, // Remove the original ID
    version: newVersion,
    effectiveDate: req.body.effectiveDate || new Date(),
    expiryDate: req.body.expiryDate,
    notes: req.body.notes,
    createdBy: req.user.id,
    createdAt: undefined,
    updatedAt: undefined
  };
  
  // Update with new data if provided
  if (req.body.name) newRateTableData.name = req.body.name;
  if (req.body.description) newRateTableData.description = req.body.description;
  if (req.body.baseRates) newRateTableData.baseRates = req.body.baseRates;
  if (req.body.adjustments) newRateTableData.adjustments = req.body.adjustments;
  if (req.body.geographicFactors) newRateTableData.geographicFactors = req.body.geographicFactors;
  
  const newRateTable = await RateTable.create(newRateTableData);
  
  res.status(201).json({
    success: true,
    data: newRateTable
  });
});

// @desc    Toggle rate table active status
// @route   PATCH /api/rate-tables/:id/toggle-active
// @access  Private
const toggleActiveStatus = asyncHandler(async (req, res) => {
  const rateTable = await RateTable.findById(req.params.id);
  
  if (!rateTable) {
    return res.status(404).json({
      success: false,
      message: 'Rate table not found'
    });
  }
  
  rateTable.isActive = !rateTable.isActive;
  await rateTable.save();
  
  res.status(200).json({
    success: true,
    data: rateTable
  });
});

module.exports = {
  getAllRateTables,
  getRateTableById,
  createRateTable,
  updateRateTable,
  deleteRateTable,
  getRateTablesByProductType,
  getActiveRateTable,
  createNewVersion,
  toggleActiveStatus
}; 