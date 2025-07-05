const mongoose = require('mongoose');

const RateTableSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rate table name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Rate table code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    productType: {
      type: String,
      required: [true, 'Product type is required'],
    },
    // Base rates for different coverage levels
    baseRates: [{
      coverageLevel: {
        type: String,
        required: true,
      },
      baseAmount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      effectiveDate: {
        type: Date,
        required: true,
      },
      expiryDate: {
        type: Date,
      },
    }],
    // Rate factors for different risk categories
    rateFactors: [{
      factorCode: {
        type: String,
        required: true,
      },
      factorName: {
        type: String,
        required: true,
      },
      values: [{
        key: String, // The input value (e.g., age range, location)
        factor: Number, // The multiplier/addition factor
        label: String, // Human readable label
      }],
    }],
    // Discounts and surcharges
    adjustments: [{
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['discount', 'surcharge'],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      valueType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true,
      },
      conditions: {
        type: mongoose.Schema.Types.Mixed, // Conditions for applying this adjustment
      },
      maxAmount: Number, // Maximum amount for percentage adjustments
      minAmount: Number, // Minimum amount for percentage adjustments
    }],
    // Geographic factors
    geographicFactors: [{
      region: {
        type: String,
        required: true,
      },
      factor: {
        type: Number,
        required: true,
      },
      description: String,
    }],
    // Version control
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient lookups
RateTableSchema.index({ code: 1, isActive: 1 });
RateTableSchema.index({ productType: 1, isActive: 1 });
RateTableSchema.index({ effectiveDate: 1, expiryDate: 1 });

// Method to get the current active rate table for a product type
RateTableSchema.statics.getActiveRateTable = async function(productType) {
  const now = new Date();
  return await this.findOne({
    productType,
    isActive: true,
    effectiveDate: { $lte: now },
    $or: [
      { expiryDate: { $gt: now } },
      { expiryDate: null }
    ]
  }).sort({ version: -1 });
};

module.exports = mongoose.model('RateTable', RateTableSchema); 