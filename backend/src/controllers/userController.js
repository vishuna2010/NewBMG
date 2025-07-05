const User = require('../models/User'); // Changed from Customer to User

// @desc    Get current logged-in user's profile (could be customer, agent, etc.)
// @route   GET /api/v1/users/profile  (Note: This might move to authController as getMe)
// @access  Private (User) - TODO: Add auth middleware (protect)
// This function is now more generic and might be better in authController as 'getMe'
// For now, keeping it here to show User model usage.
// The actual /profile route will be defined in authRoutes.js or userRoutes.js.
exports.getUserProfile = async (req, res, next) => {
  try {
    // req.user will be populated by the 'protect' middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      // This case should ideally not happen if protect middleware works correctly
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    // Password is not selected by default due to `select: false` in User model
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update current logged-in user's profile
// @route   PUT /api/v1/users/profile (Note: This might move to authController or stay in a dedicated user controller)
// @access  Private (User) - TODO: Add auth middleware (protect)
exports.updateUserProfile = async (req, res, next) => {
  try {
    // req.user will be populated by the 'protect' middleware
    let user = await User.findById(req.user.id);

    if (!user) {
      // This case should ideally not happen if protect middleware works correctly
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Fields that a user can update for their own profile
    // Email and role changes should typically be handled by admins or specific verification processes.
    const { firstName, lastName, phoneNumber, address, dateOfBirth, customerType } = req.body;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address) user.address = { ...user.address, ...address }; // Merge address fields
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;

    // customerType is specific to 'customer' role, ensure it's only set if applicable
    if (user.role === 'customer' && customerType !== undefined) {
        user.customerType = customerType;
    } else if (customerType !== undefined && user.role !== 'customer') {
        // Potentially ignore or return an error if customerType is sent for non-customer roles
        console.warn(`customerType provided for user with role: ${user.role}. Field ignored.`);
    }


    // If password change is requested
    // This would typically involve providing currentPassword for verification
    // For simplicity, if 'newPassword' is provided, we assume it's a direct update here.
    // A more secure flow would be a separate /change-password endpoint.
    if (req.body.password) { // Assuming password field name is 'password' for new password
      user.password = req.body.password; // Hashing will be handled by pre-save hook
    }

    const updatedUser = await user.save();

    // Exclude password from response
    const userData = updatedUser.toObject();
    delete userData.password;

    res.status(200).json({ success: true, data: userData });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};


// --- Admin CRUD Operations for Users ---
// These functions would typically be in a userController.js if managing all users,
// or remain here if customerController is specifically for admin actions on customer-role users.
// For now, let's assume these are general user management by an admin.

// @desc    Get all users (customers, agents, staff, etc.)
// @route   GET /api/v1/users (or /api/v1/admin/users)
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.getAllUsers = async (req, res, next) => {
  try {
    // Add filtering by role, isActive, etc. from req.query if needed
    const users = await User.find(req.query); // Example: /api/v1/users?role=customer
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get a single user by ID (by Admin)
// @route   GET /api/v1/users/:id (or /api/v1/admin/users/:id)
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: `User not found with id ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `User not found with id ${req.params.id}` });
    }
    console.error('Get User By ID Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a user (by Admin) - e.g., change role, isActive
// @route   PUT /api/v1/users/:id (or /api/v1/admin/users/:id)
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.updateUser = async (req, res, next) => {
  try {
    // Admin can update fields like role, isActive.
    // Password changes by admin should ideally be a 'reset password' flow, not direct update.
    const { password, email, ...updateData } = req.body; // Exclude password and email from direct mass update by admin here
                                                       // Email change should have verification.

    if (password) {
        return res.status(400).json({ success: false, error: "Admin password update for users should use a dedicated reset mechanism."})
    }
    if (email) {
        return res.status(400).json({ success: false, error: "Email change requires a verification process, not allowed via generic update."})
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, error: `User not found with id ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `User not found with id ${req.params.id}` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    console.error('Update User Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a user (by Admin)
// @route   DELETE /api/v1/users/:id (or /api/v1/admin/users/:id)
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: `User not found with id ${req.params.id}` });
    }

    // Consider soft delete (setting isActive = false) instead of hard delete
    // For now, performing a hard delete:
    await user.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'User deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `User not found with id ${req.params.id}` });
    }
    console.error('Delete User Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
