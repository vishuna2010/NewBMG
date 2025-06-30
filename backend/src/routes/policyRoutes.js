const express = require('express');
const {
  createPolicyFromQuote,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require('../controllers/policyController');

// const { protect, authorize } = require('../middleware/auth'); // Placeholder for auth

const router = express.Router();

// --- Policy Creation ---
// This route is specific for creating a policy from an existing quote
router.post('/from-quote', createPolicyFromQuote); // TODO: protect (e.g., customer or admin/agent)

// --- Admin/General Policy Management Routes ---
// These routes are more for viewing and managing existing policies, typically by admin/staff.
// Customer access to their own policies might be a separate, more restricted set of endpoints or handled by filtering.

router.route('/')
  .get(getAllPolicies);      // TODO: protect, authorize(['admin', 'agent']) - Get all policies (filtered for agents if needed)
  // .post(createPolicy);    // Optional: If direct policy creation (not from quote) is needed by admin

router.route('/:id')
  .get(getPolicyById)       // TODO: protect, authorize(['admin', 'agent'], or check ownership for customer)
  .put(updatePolicy)        // TODO: protect, authorize(['admin'])
  .delete(deletePolicy);    // TODO: protect, authorize(['admin', 'superadmin']) - Use with caution

module.exports = router;
