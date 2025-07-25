const express = require('express');
const {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuoteStatus,
  generateQuotePdf, // <-- Add this
  createNewVersion,
  getAllVersions,
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

router.route('/:id/generate-pdf')
  // Owner, or admin/staff/agent can generate PDF. Controller implements authorization.
  .post(protect, generateQuotePdf);

router.route('/:id/versions')
  // Get all versions of a quote
  .get(protect, getAllVersions)
  // Create a new version of a quote
  .post(protect, createNewVersion);

module.exports = router;
