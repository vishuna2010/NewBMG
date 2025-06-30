const express = require('express');
const {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuoteStatus,
  // updateQuoteDetails, // Optional, if implemented
  // deleteQuote,        // Optional, if implemented
} = require('../controllers/quoteController');

const router = express.Router();

// TODO: Protect routes appropriately with authentication and authorization middleware.
// Example:
// const { protect, authorize } = require('../middleware/auth');
// router.post('/', protect, createQuote); // Only authenticated users can create quotes
// router.get('/', protect, authorize('admin', 'agent'), getAllQuotes); // Admin/Agent see all

router.route('/')
  .post(createQuote)     // POST /api/v1/quotes
  .get(getAllQuotes);    // GET /api/v1/quotes

router.route('/:id')
  .get(getQuoteById);     // GET /api/v1/quotes/:id
  // .put(updateQuoteDetails) // Optional: PUT /api/v1/quotes/:id (for updating draft quote details)
  // .delete(deleteQuote);    // Optional: DELETE /api/v1/quotes/:id

router.route('/:id/status')
  .put(updateQuoteStatus); // PUT /api/v1/quotes/:id/status (for updating quote status)

module.exports = router;
