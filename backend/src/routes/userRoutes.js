const express = require('express');
const {
  // registerCustomer, // Moved to authController
  getUserProfile,      // Renamed from getCustomerProfile
  updateUserProfile,   // Renamed from updateCustomerProfile
  getAllUsers,         // Renamed from getAllCustomers
  getUserById,         // Renamed from getCustomerById
  updateUser,          // Renamed from updateCustomer
  deleteUser,          // Renamed from deleteCustomer
} = require('../controllers/userController'); // Updated path

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// User profile routes (for any logged-in user to manage their own profile)
// The '/profile' route is now conceptually handled by '/auth/me' for GET,
// and this for PUT. Or '/me' could also handle PUT.
// For consistency, let's assume /me is for GET and /profile for PUT on self.
// Better: GET /api/v1/auth/me (from authRoutes)
//         PUT /api/v1/users/profile (to update self)
router.route('/profile')
    .put(protect, updateUserProfile); // Any logged-in user can update their own profile

// Admin-specific routes for managing any user
router.route('/')
    .get(protect, authorize('admin', 'staff'), getAllUsers); // Admins and staff can get all users

router.route('/:id')
    .get(protect, authorize('admin', 'staff'), getUserById)    // Admins and staff can get any user by ID
    .put(protect, authorize('admin'), updateUser)         // Only Admins can update any user
    .delete(protect, authorize('admin'), deleteUser);      // Only Admins can delete any user

// Note: The controller has been renamed to userController.js.
// This file (userRoutes.js) now correctly reflects generic User routes.

module.exports = router;
