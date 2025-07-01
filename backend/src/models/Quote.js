const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      unique: true,
    },
    customer: { // For now, store as ObjectId, can be populated later
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Changed from Customer to User
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
    agentId: { // Link to the agent who created/manages this quote
      type: mongoose.Schema.ObjectId,
      ref: 'User', // References the User model, assuming agent has a 'agent' role
      index: true, // Good for querying quotes by agent
    }
    // Could also add a generic 'createdBy' if admins/staff can also create quotes directly
    // createdBy: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'User'
    // }
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

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
