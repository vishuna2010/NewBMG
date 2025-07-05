const express = require('express');
const router = express.Router();
const insurerController = require('../controllers/insurerController');

// CRUD routes
router.get('/', insurerController.getAllInsurers);
router.get('/:id', insurerController.getInsurerById);
router.post('/', insurerController.createInsurer);
router.put('/:id', insurerController.updateInsurer);
router.delete('/:id', insurerController.deleteInsurer);

module.exports = router; 