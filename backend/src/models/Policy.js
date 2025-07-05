const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema(
  {
    policyNumber: {
      type: String,
      unique: true,
      // required: [true, 'Policy number is required'], // Will be auto-generated
    },
    customer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Changed from Customer to User
      required: [true, 'Customer is required for a policy'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required for a policy'],
    },
    originalQuote: { // Reference to the quote from which this policy was generated
      type: mongoose.Schema.ObjectId,
      ref: 'Quote',
      required: [true, 'Original quote reference is required'],
      unique: true, // A quote should only be converted to one policy
    },
    // Snapshot of product details, selected coverages, and inputs from the quote at the time of issuance
    // This ensures policy terms are fixed even if product definitions or quote inputs change later.
    policyDetailsSnapshot: {
      productName: String,
      productType: String,
      // Snapshot of specific coverages chosen/customized from the quote
      coverages: mongoose.Schema.Types.Mixed, // Could be an array of objects like [{ feature: '...', limit: '...', premiumPortion: '...' }]
      // Snapshot of inputs from the original quote
      quoteInputs: mongoose.Schema.Types.Mixed,
    },
    premiumAmount: {
      type: Number,
      required: [true, 'Premium amount is required'],
    },
    premiumCurrency: {
      type: String,
      required: [true, 'Premium currency is required'],
      default: 'USD',
    },
    status: {
      type: String,
      enum: ['PendingActivation', 'Active', 'Expired', 'Cancelled', 'Lapsed', 'PendingRenewal'],
      default: 'PendingActivation', // Policy might need payment confirmation to become Active
    },
    effectiveDate: { // When the policy coverage starts
      type: Date,
      required: [true, 'Effective date is required'],
    },
    expiryDate: { // When the policy coverage ends
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    term: { // e.g., "12 Months", "6 Months", "1 Year"
      type: String,
      required: [true, 'Policy term is required'],
    },
    paymentSchedule: { // How premium is paid
      type: String,
      enum: ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly'],
      default: 'Annual',
    },
    // Array to store links/references to policy documents (e.g., schedule, certificate, endorsements)
    documents: [
      {
        documentName: { type: String, required: true },
        documentType: { type: String, enum: ['PolicySchedule', 'CertificateOfInsurance', 'Endorsement', 'Invoice', 'Other'], required: true },
        documentUrl: { type: String, required: true }, // Could be an S3 link or internal path
        uploadedAt: { type: Date, default: Date.now },
        version: { type: String, default: '1.0' }
      },
    ],
    // Optional: Track last payment date, next due date for installments
    // lastPaymentDate: Date,
    // nextDueDate: Date,
    // cancellationDetails: {
    //   reason: String,
    //   cancelledOn: Date,
    //   refundAmount: Number
    // }
    agentId: { // Link to the agent associated with this policy (e.g., who sold it or manages it)
      type: mongoose.Schema.ObjectId,
      ref: 'User', // References the User model
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Pre-save hook to generate a unique policy number
PolicySchema.pre('save', async function (next) {
  if (this.isNew && !this.policyNumber) {
    // Simple policy number generation logic (can be made more robust)
    // Example: POL-<timestamp_last_6_digits>-<random_3_chars>
    const timestampPart = Date.now().toString().slice(-6);
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.policyNumber = `POL-${timestampPart}-${randomPart}`;

    // Ensure uniqueness (simple retry mechanism, might need a more robust solution for high concurrency)
    let existingPolicy = await mongoose.model('Policy', PolicySchema).findOne({ policyNumber: this.policyNumber });
    while (existingPolicy) {
      const newRandomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
      this.policyNumber = `POL-${timestampPart}-${newRandomPart}`;
      existingPolicy = await mongoose.model('Policy', PolicySchema).findOne({ policyNumber: this.policyNumber });
    }
  }
  next();
});

// Indexing common query fields
PolicySchema.index({ customer: 1 });
PolicySchema.index({ status: 1 });
PolicySchema.index({ expiryDate: 1 });


module.exports = mongoose.model('Policy', PolicySchema);
