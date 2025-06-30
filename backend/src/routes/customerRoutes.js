const express = require('express');
const {
  registerCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

// const { protect, authorize } = require('../middleware/auth'); // Placeholder for auth middleware

const router = express.Router();

// Public routes
router.post('/register', registerCustomer);
// router.post('/login', loginCustomer); // TODO: Add login route when auth is fully built

// Customer-specific protected routes (once 'protect' middleware is ready)
// For now, using a temporary param for ID until auth is in place
router.route('/profile/:id_for_testing_profile') // Temporary for testing without auth
    .get(getCustomerProfile)    // protect, getCustomerProfile
    .put(updateCustomerProfile); // protect, updateCustomerProfile
// Correct routes once auth is in place:
// router.route('/profile')
//     .get(protect, getCustomerProfile)
//     .put(protect, updateCustomerProfile);


// Admin-specific protected routes (once 'protect' and 'authorize' are ready)
router.route('/')
    .get(getAllCustomers);      // protect, authorize('admin'), getAllCustomers

router.route('/:id')
    .get(getCustomerById)       // protect, authorize('admin'), getCustomerById
    .put(updateCustomer)        // protect, authorize('admin'), updateCustomer
    .delete(deleteCustomer);    // protect, authorize('admin'), deleteCustomer

module.exports = router;
