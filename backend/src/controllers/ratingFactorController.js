const RatingFactor = require('../models/RatingFactor');

// @desc    Get all rating factors
// @route   GET /api/v1/rating-factors
// @access  Private (Admin/Staff)
exports.getAllRatingFactors = async (req, res, next) => {
  try {
    const { productType, isActive } = req.query;
    let query = {};

    if (productType) {
      query.applicableProducts = productType;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const ratingFactors = await RatingFactor.find(query).sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: ratingFactors.length,
      data: ratingFactors,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Get single rating factor
// @route   GET /api/v1/rating-factors/:id
// @access  Private (Admin/Staff)
exports.getRatingFactorById = async (req, res, next) => {
  try {
    const ratingFactor = await RatingFactor.findById(req.params.id);

    if (!ratingFactor) {
      return res.status(404).json({
        success: false,
        error: `Rating factor not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: ratingFactor,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Rating factor not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Create new rating factor
// @route   POST /api/v1/rating-factors
// @access  Private (Admin)
exports.createRatingFactor = async (req, res, next) => {
  try {
    const ratingFactor = await RatingFactor.create(req.body);

    res.status(201).json({
      success: true,
      data: ratingFactor,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Rating factor code already exists' });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Update rating factor
// @route   PUT /api/v1/rating-factors/:id
// @access  Private (Admin)
exports.updateRatingFactor = async (req, res, next) => {
  try {
    let ratingFactor = await RatingFactor.findById(req.params.id);

    if (!ratingFactor) {
      return res.status(404).json({
        success: false,
        error: `Rating factor not found with id of ${req.params.id}`,
      });
    }

    ratingFactor = await RatingFactor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: ratingFactor,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Rating factor not found with id of ${req.params.id}` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Rating factor code already exists' });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Delete rating factor
// @route   DELETE /api/v1/rating-factors/:id
// @access  Private (Admin)
exports.deleteRatingFactor = async (req, res, next) => {
  try {
    const ratingFactor = await RatingFactor.findById(req.params.id);

    if (!ratingFactor) {
      return res.status(404).json({
        success: false,
        error: `Rating factor not found with id of ${req.params.id}`,
      });
    }

    await ratingFactor.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Rating factor not found with id of ${req.params.id}` });
    }
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
};

// @desc    Get rating factors by product type
// @route   GET /api/v1/rating-factors/product/:productType
// @access  Private
exports.getRatingFactorsByProduct = async (req, res, next) => {
  try {
    const ratingFactors = await RatingFactor.find({
      applicableProducts: req.params.productType,
      isActive: true
    }).sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: ratingFactors.length,
      data: ratingFactors,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message || 'Server Error' });
  }
}; 