const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      unique: true,
    },
    // Versioning fields
    version: {
      type: Number,
      default: 1,
    },
    parentQuote: {
      type: mongoose.Schema.ObjectId,
      ref: 'Quote',
      // Reference to the original quote (null for version 1)
    },
    isLatestVersion: {
      type: Boolean,
      default: true,
    },
    versionHistory: [{
      version: Number,
      quoteId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Quote',
      },
      createdAt: Date,
      changes: String, // Description of what changed in this version
    }],
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
    // Detailed breakdown of premium calculation
    premiumBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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
    },
    quotePdfUrl: { // URL of the generated PDF stored in S3
      type: String,
      trim: true,
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

// Method to create a new version of this quote
QuoteSchema.methods.createNewVersion = async function(changes = '') {
  const newQuote = new this.constructor({
    ...this.toObject(),
    _id: undefined, // Remove the _id so a new one is generated
    version: this.version + 1,
    parentQuote: this.parentQuote || this._id,
    isLatestVersion: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Mark current quote as not latest
  this.isLatestVersion = false;
  await this.save();
  
  // Add to version history
  newQuote.versionHistory = [
    ...this.versionHistory,
    {
      version: this.version,
      quoteId: this._id,
      createdAt: this.createdAt,
      changes: changes || 'Quote updated',
    }
  ];
  
  return await newQuote.save();
};

// Static method to get all versions of a quote
QuoteSchema.statics.getAllVersions = async function(quoteId) {
  const quote = await this.findById(quoteId);
  if (!quote) return null;
  
  const parentId = quote.parentQuote || quote._id;
  return await this.find({
    $or: [
      { _id: parentId },
      { parentQuote: parentId }
    ]
  }).sort({ version: 1 });
};

module.exports = mongoose.model('Quote', QuoteSchema);
