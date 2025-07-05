const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/v1/products
// @access  Private (Admin) - (TODO: Add auth middleware)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
    // next(error); // More advanced error handling
  }
};

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public (or Private depending on use case)
exports.getAllProducts = async (req, res, next) => {
  try {
    // Basic query, can be expanded with filtering, sorting, pagination
    const products = await Product.find(req.query); // req.query can be used for filtering like /products?isActive=true

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    // next(error);
  }
};

// @desc    Get a single product by ID
// @route   GET /api/v1/products/:id
// @access  Public (or Private)
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found with id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    // Handle CastError for invalid ObjectId
    if (error.name === 'CastError') {
        return res.status(404).json({
            success: false,
            error: `Product not found with id of ${req.params.id}`,
        });
    }
    res.status(500).json({ success: false, error: error.message });
    // next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/v1/products/:id
// @access  Private (Admin) - (TODO: Add auth middleware)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found with id of ${req.params.id}`,
      });
    }

    // TODO: Add authorization check - only admin can update

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return the modified document
      runValidators: true, // Run schema validators
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error.name === 'CastError') {
        return res.status(404).json({
            success: false,
            error: `Product not found with id of ${req.params.id}`,
        });
    }
    res.status(400).json({ success: false, error: error.message }); // Likely validation error
    // next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/v1/products/:id
// @access  Private (Admin) - (TODO: Add auth middleware)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `Product not found with id of ${req.params.id}`,
      });
    }

    // TODO: Add authorization check - only admin can delete

    await product.deleteOne(); // or product.remove() for older Mongoose versions

    res.status(200).json({
      success: true,
      data: {}, // Or a message like { message: "Product deleted successfully" }
    });
  } catch (error) {
     if (error.name === 'CastError') {
        return res.status(404).json({
            success: false,
            error: `Product not found with id of ${req.params.id}`,
        });
    }
    res.status(500).json({ success: false, error: error.message });
    // next(error);
  }
};
