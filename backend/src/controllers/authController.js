const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');
const { sendTemplatedEmail } = require('../utils/emailUtils'); // Updated import

// @desc    Register a new user (customer, agent, etc.)
// @route   POST /api/v1/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber, address, dateOfBirth, customerType, role } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Create user
    // Role will default to 'customer' as per schema if not provided,
    // or can be set by admin during user creation for other roles.
    user = await User.create({
      firstName,
      lastName,
      email,
      password, // Hashing is handled by the pre-save hook in the User model
      phoneNumber,
      address,
      dateOfBirth,
      customerType, // This field might be more relevant if role is 'customer'
      role: role || 'customer', // Explicitly set role, defaulting to customer
    });

    const token = generateToken(user._id, user.role);

    // Exclude password from response
    const userData = user.toObject();
    delete userData.password;

    // Send welcome email using a template
    try {
      await sendTemplatedEmail({
        to: user.email,
        templateName: 'welcomeUser', // This template needs to be created in the DB by an admin
        dataContext: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          // Add any other relevant data for the welcome email
        },
      });
    } catch (emailError) {
      console.error(`Failed to send welcome email to ${user.email}:`, emailError.message);
      // Do not fail registration if email sending fails, just log it.
    }

    res.status(201).json({
      success: true,
      token, // Send token upon successful registration
      data: userData,
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, error: 'Server Error during registration' });
  }
};


// @desc    Authenticate user & get token (Login)
// @route   POST /api/v1/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide an email and password' });
  }

  try {
    // Check for user
    // Explicitly select password as it's not returned by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' }); // Generic error
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' }); // Generic error
    }

    const token = generateToken(user._id, user.role);

    // Exclude password from user data sent in response
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      token,
      data: userData,
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Server Error during login' });
  }
};


// @desc    Get current logged in user details
// @route   GET /api/v1/auth/me
// @access  Private (requires protect middleware)
exports.getMe = async (req, res, next) => {
  // req.user is set by the protect middleware
  // The User model by default does not select the password, so it's safe.
  // If it did, you'd want to fetch it again without the password or transform req.user.
  const user = await User.findById(req.user.id); // req.user should have id and role

  if (!user) {
    // This case should ideally not happen if protect middleware works correctly
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
};
