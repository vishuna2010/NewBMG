const express = require('express');
const {
  createPolicyFromQuote,
  getAllPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require('../controllers/policyController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// --- Policy Creation ---
// This route is specific for creating a policy from an existing quote
// Assuming an authenticated user (customer, agent, or admin acting on behalf) initiates this
router.post('/from-quote', protect, createPolicyFromQuote);

// --- Policy Management Routes ---
router.route('/')
  // Admins/staff/agents can see all policies (controllers will filter for agents if needed). Customers only their own (controller logic).
  .get(protect, getAllPolicies);
  // .post(protect, authorize('admin', 'staff'), createPolicy); // Optional: Direct policy creation by admin/staff

router.route('/:id')
  // Owner, or admin/staff/agent can view a specific policy. Controller needs to implement ownership check if user is customer.
  .get(protect, getPolicyById)
  .put(protect, authorize('admin', 'staff'), updatePolicy) // Admin/staff can update policies
  .delete(protect, authorize('admin'), deletePolicy);    // Only admin for delete (soft delete)

module.exports = router;
