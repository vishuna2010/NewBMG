// src/controllers/healthController.js

/**
 * @desc   Checks the health of the API
 * @route  GET /api/v1/health
 * @access Public
 */
const checkHealth = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'API is healthy and running!',
      uptime: process.uptime(), // Optional: send server uptime
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({
      success: false,
      message: 'API health check failed',
      error: error.message,
    });
  }
};

module.exports = {
  checkHealth,
};
