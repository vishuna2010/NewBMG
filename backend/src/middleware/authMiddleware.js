const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming your User model is here

// Protect routes - checks for valid JWT and attaches user to request
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding password)
      // The decoded payload should have 'id' and 'role' as per jwtUtils.js
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authorized, user not found for this token' });
      }

      // Add role to req.user directly if not already part of the selected fields or if needed separately
      // req.user.role = decoded.role; // User model already has role, so findById should retrieve it.

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      // Handle different JWT errors specifically if needed (e.g., TokenExpiredError)
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Not authorized, token expired' });
      }
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

// Authorize routes based on user role
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user should be set by the 'protect' middleware before this runs
    if (!req.user || !req.user.role) {
      // This should ideally not happen if 'protect' runs first and sets req.user correctly
      return res.status(401).json({ success: false, error: 'User role not available for authorization' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route. Allowed roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
