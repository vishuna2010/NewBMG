const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // For auto-incrementing quoteNumber

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String, // Will be set by mongoose-sequence to be like Q00001
      unique: true,
    },
    customer: { // For now, store as ObjectId, can be populated later
      type: mongoose.Schema.ObjectId,
      ref: 'Customer', // Assuming a 'Customer' model will exist
      // required: [true, 'Customer ID is required for a quote'], // Making it optional for now if quotes can be anonymous initially
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required for a quote'],
    },
    // Snapshot of key product details at the time of quoting
    // This is important because product details (like price) might change over time
    productDetailsSnapshot: {
      name: String,
      productType: String,
      basePrice: Number, // Price at the time of quote
      currency: String,
      // You might want to snapshot specific coverage items too if they are configurable per quote
    },
    // Stores the dynamic inputs collected from the user for this specific quote
    // Based on the selected product's requirements
    quoteInputs: {
      type: mongoose.Schema.Types.Mixed, // Allows for a flexible, dynamic structure
      required: true,
      default: {},
    },
    calculatedPremium: {
      type: Number,
      required: [true, 'Calculated premium is required'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Quoted', 'Accepted', 'Rejected', 'Expired', 'ConvertedToPolicy'],
      default: 'Draft',
    },
    validUntil: {
      type: Date,
      // Example: Set quote to be valid for 30 days from creation
      // default: () => new Date(new Date().setDate(new Date().getDate() + 30)),
    },
    notes: {
      type: String,
      trim: true,
    },
    // Could add fields for who generated the quote if an agent/admin does it
    // generatedBy: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'User' // Staff/Admin/Agent user
    // }
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Plugin for auto-incrementing quoteNumber like Q00001, Q00002
// Note: mongoose-sequence needs to be installed (npm install mongoose-sequence)
// This is a conceptual setup for quoteNumber.
// A more robust sequence might be needed or a different ID generation strategy.
// For simplicity in this step, I will make quoteNumber a String that we can manually format for now
// if mongoose-sequence is not installed or causes issues in this environment.
// Let's remove mongoose-sequence for now to avoid dependency issues unless you confirm to add it.
/*
QuoteSchema.plugin(AutoIncrement, {
  id: 'quote_number_seq',
  inc_field: 'quoteNumberInternal', // internal field for sequence
  reference_fields: [], // if you need sequence per some other field e.g. per year
  // start_seq: 1, // if you want to start from a specific number
});

// Virtual to create formatted quoteNumber
QuoteSchema.virtual('quoteNumber').get(function() {
  return `Q${String(this.quoteNumberInternal).padStart(5, '0')}`;
});
*/

// For now, let's make quoteNumber a simple required string.
// The controller can generate it or it can be added later.
// Re-evaluating: A unique, human-readable ID is good.
// Let's stick to the concept but make it a manual assignment in controller for now if sequence plugin is an issue.
// For this step, I'll define it as a string and assume it will be populated by the controller.
// Removing the mongoose-sequence plugin for now to keep it simple.

QuoteSchema.pre('save', function(next) {
  if (!this.quoteNumber) {
    // Generate a simple quote number if not provided (e.g., during testing or manual creation)
    // In a real app, this should be more robust or handled by a sequence.
    this.quoteNumber = `Q-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
  }
  if (!this.validUntil && this.status === 'Quoted') {
      this.validUntil = new Date(new Date().setDate(new Date().getDate() + 30)); // Default 30 days validity when quoted
  }
  next();
});


module.exports = mongoose.model('Quote', QuoteSchema);
