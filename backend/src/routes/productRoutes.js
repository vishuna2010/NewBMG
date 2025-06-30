const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'staff'), createProduct) // Allow staff to create products too
  .get(getAllProducts);   // Publicly accessible for now, or use (protect, authorize('admin', 'staff', 'agent'))

router.route('/:id')
  .get(getProductById)    // Publicly accessible for now
  .put(protect, authorize('admin', 'staff'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct); // Only admin can delete

module.exports = router;
