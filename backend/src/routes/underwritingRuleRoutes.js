const express = require('express');
const {
  createUnderwritingRule,
  getUnderwritingRulesForProduct,
  getUnderwritingRuleById,
  updateUnderwritingRule,
  deleteUnderwritingRule,
} = require('../controllers/underwritingRuleController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Option 1: Merge with product routes (if rules are always nested under products)
// This router would be mounted under /api/v1/products/:productId/underwritingrules
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(protect, authorize('admin', 'staff'), createUnderwritingRule)
  .get(protect, authorize('admin', 'staff'), getUnderwritingRulesForProduct);

// Option 2: Separate routes for individual rule management (if needed directly)
// These routes would be mounted under /api/v1/underwritingrules
// This requires a separate router instance if you want both.
// For now, let's assume direct access to a rule by its ID is useful.
const directRuleRouter = express.Router();

directRuleRouter
  .route('/:id')
  .get(protect, authorize('admin', 'staff'), getUnderwritingRuleById)
  .put(protect, authorize('admin', 'staff'), updateUnderwritingRule)
  .delete(protect, authorize('admin', 'staff'), deleteUnderwritingRule);

// If using only nested routes (Option 1), export 'router'
// If using separate routes for specific rule access (Option 2), you'll need to export both
// or decide on one pattern.
// For simplicity and typical REST patterns for sub-resources, we'll primarily use the nested router.
// Direct access to /underwritingrules/:id is also a common pattern.

// Let's make it so this file exports a single router that will be mounted at /api/v1/underwritingrules
// and the product-specific routes will be handled by productRoutes.js mounting this.
// This is a common pattern but requires careful route definition.

// Revised approach:
// Main router for /api/v1/underwritingrules for individual rule operations by ID
const mainRouter = express.Router();

mainRouter
    .route('/:id')
    .get(protect, authorize('admin', 'staff'), getUnderwritingRuleById)
    .put(protect, authorize('admin', 'staff'), updateUnderwritingRule)
    .delete(protect, authorize('admin', 'staff'), deleteUnderwritingRule);

// We also need a way to create and list rules for a product.
// This is best handled by extending the productRoutes.js to use the controller methods.
// So, this file (underwritingRuleRoutes.js) will only contain routes for accessing specific rules by their own ID.

// The createUnderwritingRule and getUnderwritingRulesForProduct will be initiated from productRoutes.js.

module.exports = mainRouter; // For routes like /api/v1/underwritingrules/:id
