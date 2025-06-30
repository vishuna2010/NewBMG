const express = require('express');
const {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuoteStatus,
  // updateQuoteDetails, // Optional, if implemented
  // deleteQuote,        // Optional, if implemented
} = require('../controllers/quoteController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  // Authenticated users (customers, agents) can create quotes. Admins/staff might also.
  .post(protect, createQuote)
  // Admins/staff/agents can see all quotes (controllers will filter for agents if needed). Customers only their own (controller logic).
  .get(protect, getAllQuotes);

router.route('/:id')
  // Owner, or admin/staff/agent can view a specific quote. Controller needs to implement ownership check if user is customer.
  .get(protect, getQuoteById);
  // .put(protect, updateQuoteDetails) // Optional: If draft quotes can be updated by creator
  // .delete(protect, authorize('admin'), deleteQuote); // Optional: Maybe only admin can delete certain drafts

router.route('/:id/status')
  // Owner can accept/reject. Admin/staff/agent might change other statuses.
  .put(protect, updateQuoteStatus);

module.exports = router;
