const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      unique: true,
      // required: [true, 'Claim number is required'], // Will be auto-generated
    },
    policy: {
      type: mongoose.Schema.ObjectId,
      ref: 'Policy',
      required: [true, 'Policy reference is required for a claim'],
    },
    customer: { // Denormalized from Policy for easier querying/access, or populated
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Changed from Customer to User
      required: [true, 'Customer reference is required for a claim'],
    },
    product: { // Denormalized from Policy for context
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required for a claim'],
    },
    dateOfLoss: {
      type: Date,
      required: [true, 'Date of loss is required'],
    },
    reportedDate: {
      type: Date,
      default: Date.now,
    },
    descriptionOfLoss: {
      type: String,
      required: [true, 'Description of loss is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'UnderReview', 'InformationRequested', 'Approved', 'PartiallyApproved', 'Rejected', 'Closed', 'Paid', 'Withdrawn'],
      default: 'Open',
    },
    estimatedLossAmount: { // Initial estimate by claimant or staff
      type: Number,
      min: 0,
    },
    approvedAmount: { // Amount approved by insurer/broker
        type: Number,
        min: 0,
    },
    paidAmount: { // Amount actually paid out
        type: Number,
        min: 0
    },
    currency: { // Should match policy currency ideally
        type: String,
        default: 'USD'
    },
    adjuster: { // Staff member assigned to this claim
      type: mongoose.Schema.ObjectId,
      ref: 'User', // Assuming a generic User model for staff/agents/admins
    },
    attachments: [ // For documents, photos, reports related to the claim
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true }, // URL from S3 or other storage
        fileType: { type: String }, // e.g., 'image/jpeg', 'application/pdf'
        uploadedAt: { type: Date, default: Date.now },
        description: { type: String }
      },
    ],
    notes: [ // Chronological log of notes/updates on the claim
      {
        note: { type: String, required: true },
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User' // Staff/Admin/Agent or even Customer if they can add notes
        },
        authorName: String, // Denormalized name for quick display
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Additional specific fields based on claim type (e.g., for Auto: vehicle details, accident location)
    // This could be a Mixed type field or sub-documents if structure is known
    // claimTypeSpecificDetails: {
    //   type: mongoose.Schema.Types.Mixed,
    // },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Pre-save hook to generate a unique claim number
ClaimSchema.pre('save', async function (next) {
  if (this.isNew && !this.claimNumber) {
    const timestampPart = Date.now().toString().slice(-7); // Slightly longer for more uniqueness
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.claimNumber = `CLM-${timestampPart}-${randomPart}`;

    // Ensure uniqueness (simple retry mechanism)
    let existingClaim = await mongoose.model('Claim', ClaimSchema).findOne({ claimNumber: this.claimNumber });
    while (existingClaim) {
      const newRandomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.claimNumber = `CLM-${timestampPart}-${newRandomPart}`;
      existingClaim = await mongoose.model('Claim', ClaimSchema).findOne({ claimNumber: this.claimNumber });
    }
  }
  next();
});

// Indexing common query fields
ClaimSchema.index({ policy: 1 });
ClaimSchema.index({ customer: 1 });
ClaimSchema.index({ status: 1 });
ClaimSchema.index({ adjuster: 1 });


module.exports = mongoose.model('Claim', ClaimSchema);
