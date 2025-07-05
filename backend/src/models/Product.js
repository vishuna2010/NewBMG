const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Product name can not be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [1000, 'Description can not be more than 1000 characters'],
    },
    productType: {
      type: String,
      required: [true, 'Please specify a product type'],
      enum: [
        'Auto',
        'Home',
        'Life',
        'Health',
        'Travel',
        'Business',
        'Other',
      ],
      default: 'Other',
    },
    basePrice: {
      type: Number,
      required: [true, 'Please add a base price'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Please specify currency'],
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'], // Example currencies
      default: 'USD',
    },
    coverageDetails: [
      {
        feature: {
          type: String,
          required: true,
        },
        details: {
          type: String,
          required: false,
        },
        isIncluded: {
          type: Boolean,
          default: true,
        },
        limit: { // Example: coverage limit
            type: Number,
            required: false
        }
      },
    ],
    termsAndConditions: {
      type: String,
      required: false, // Might be a link to a document or detailed text
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // You might want to link products to specific insurers/carriers
    // insurer: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'Insurer', // Assuming an 'Insurer' model
    //   required: false, // Or true, depending on business logic
    // },
    // Additional fields like 'ratingFactors', 'underwritingRules' can be complex
    // and might be better as separate schemas or embedded documents later.
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// TODO: Add any pre-save hooks, virtuals, or methods if needed later.
// Example: Slugify name
// ProductSchema.pre('save', function(next) {
//   this.slug = slugify(this.name, { lower: true });
//   next();
// });

module.exports = mongoose.model('Product', ProductSchema);
