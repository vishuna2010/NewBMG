const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

// TODO: Protect routes that modify data (POST, PUT, DELETE) with authentication and authorization middleware (e.g., isAdmin)
// Example: router.post('/', protect, authorize('admin'), createProduct);

router.route('/')
  .post(createProduct)    // POST /api/v1/products
  .get(getAllProducts);   // GET /api/v1/products

router.route('/:id')
  .get(getProductById)    // GET /api/v1/products/:id
  .put(updateProduct)     // PUT /api/v1/products/:id
  .delete(deleteProduct); // DELETE /api/v1/products/:id

module.exports = router;
