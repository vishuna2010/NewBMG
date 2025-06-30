const jwt = require('jsonwebtoken');

// Generates a JWT token
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    // In a real app, you might throw an error or exit,
    // but for now, to prevent crashes during early dev if .env is missed:
    return 'JWT_SECRET_NOT_CONFIGURED';
  }
  if (!process.env.JWT_EXPIRE) {
    console.warn('Warning: JWT_EXPIRE is not defined. Using default of 30d.');
  }

  return jwt.sign(
    { id: userId, role: role }, // Payload: include user ID and role
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' } // Default to 30 days if not specified
  );
};

// Verifies a JWT token
// This function might be more useful directly within the auth middleware,
// but can be here for utility or testing.
const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined for verification.');
    throw new Error('JWT secret not configured for verification.');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // Contains { id, role, iat, exp }
  } catch (error) {
    // Handles expired tokens, invalid signatures, etc.
    console.error('JWT Verification Error:', error.message);
    return null; // Or throw the error
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
