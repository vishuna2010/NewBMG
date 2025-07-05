const mongoose = require('mongoose');

const insurerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  contactEmail: { type: String },
  contactPhone: { type: String },
  website: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Insurer', insurerSchema); 