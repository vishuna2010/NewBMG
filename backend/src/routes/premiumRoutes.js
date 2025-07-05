const express = require('express');
const router = express.Router();
const premiumService = require('../services/premiumCalculationService');
const { protect } = require('../middleware/authMiddleware');

// Calculate premium for a quote
router.post('/calculate', protect, async (req, res) => {
  try {
    const result = await premiumService.calculatePremium(req.body);
    
    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error
      });
    }
  } catch (error) {
    console.error('Premium calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate premium',
      error: error.message
    });
  }
});

module.exports = router; 