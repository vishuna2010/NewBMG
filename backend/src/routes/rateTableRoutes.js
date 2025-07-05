const express = require('express');
const router = express.Router();
const {
  getAllRateTables,
  getRateTableById,
  createRateTable,
  updateRateTable,
  deleteRateTable,
  getRateTablesByProductType,
  getActiveRateTable,
  createNewVersion,
  toggleActiveStatus
} = require('../controllers/rateTableController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply authentication to all routes
router.use(protect);

// Apply authorization to all routes (admin only)
router.use(authorize('admin'));

// GET /api/rate-tables - Get all rate tables
router.get('/', getAllRateTables);

// GET /api/rate-tables/:id - Get rate table by ID
router.get('/:id', getRateTableById);

// POST /api/rate-tables - Create new rate table
router.post('/', createRateTable);

// PUT /api/rate-tables/:id - Update rate table
router.put('/:id', updateRateTable);

// DELETE /api/rate-tables/:id - Delete rate table
router.delete('/:id', deleteRateTable);

// GET /api/rate-tables/product/:productType - Get rate tables by product type
router.get('/product/:productType', getRateTablesByProductType);

// GET /api/rate-tables/active/:productType - Get active rate table for product type
router.get('/active/:productType', getActiveRateTable);

// POST /api/rate-tables/:id/version - Create new version of rate table
router.post('/:id/version', createNewVersion);

// PATCH /api/rate-tables/:id/toggle-active - Toggle rate table active status
router.patch('/:id/toggle-active', toggleActiveStatus);

module.exports = router; 