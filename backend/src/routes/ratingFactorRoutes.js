const express = require('express');
const {
  getAllRatingFactors,
  getRatingFactorById,
  createRatingFactor,
  updateRatingFactor,
  deleteRatingFactor,
  getRatingFactorsByProduct,
} = require('../controllers/ratingFactorController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Admin only routes
router.route('/')
  .get(authorize('admin', 'staff'), getAllRatingFactors)
  .post(authorize('admin'), createRatingFactor);

router.route('/:id')
  .get(authorize('admin', 'staff'), getRatingFactorById)
  .put(authorize('admin'), updateRatingFactor)
  .delete(authorize('admin'), deleteRatingFactor);

// Get rating factors by product type
router.route('/product/:productType')
  .get(getRatingFactorsByProduct);

module.exports = router; 