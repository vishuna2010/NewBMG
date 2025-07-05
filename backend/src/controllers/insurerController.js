const Insurer = require('../models/Insurer');

// Get all insurers
exports.getAllInsurers = async (req, res) => {
  try {
    const insurers = await Insurer.find();
    res.json(insurers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single insurer by ID
exports.getInsurerById = async (req, res) => {
  try {
    const insurer = await Insurer.findById(req.params.id);
    if (!insurer) return res.status(404).json({ error: 'Insurer not found' });
    res.json(insurer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create insurer
exports.createInsurer = async (req, res) => {
  try {
    const insurer = new Insurer(req.body);
    await insurer.save();
    res.status(201).json(insurer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update insurer
exports.updateInsurer = async (req, res) => {
  try {
    const insurer = await Insurer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!insurer) return res.status(404).json({ error: 'Insurer not found' });
    res.json(insurer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete insurer
exports.deleteInsurer = async (req, res) => {
  try {
    const insurer = await Insurer.findByIdAndDelete(req.params.id);
    if (!insurer) return res.status(404).json({ error: 'Insurer not found' });
    res.json({ message: 'Insurer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 