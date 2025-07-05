const mongoose = require('mongoose');

const RatingFactorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rating factor name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Rating factor code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    factorType: {
      type: String,
      enum: ['multiplier', 'additive', 'percentage', 'fixed'],
      required: [true, 'Factor type is required'],
    },
    dataType: {
      type: String,
      enum: ['number', 'string', 'boolean', 'date', 'select'],
      required: [true, 'Data type is required'],
    },
    // For select type, define available options
    options: [{
      value: String,
      label: String,
      factor: Number, // The actual rating factor value
    }],
    // For numeric ranges
    ranges: [{
      min: Number,
      max: Number,
      factor: Number,
      label: String,
    }],
    // Default value if not provided
    defaultValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Whether this factor is required for calculation
    required: {
      type: Boolean,
      default: false,
    },
    // Product types this factor applies to
    applicableProducts: [{
      type: String, // Product type codes
    }],
    // Validation rules
    validation: {
      min: Number,
      max: Number,
      pattern: String, // Regex pattern for validation
      customValidation: String, // Custom validation function name
    },
    // Order for display/calculation
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient lookups
RatingFactorSchema.index({ code: 1, isActive: 1 });
RatingFactorSchema.index({ applicableProducts: 1, isActive: 1 });

module.exports = mongoose.model('RatingFactor', RatingFactorSchema); 