const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: [true, 'Please provide a template name (e.g., welcomeUser, quoteAccepted)'],
      unique: true,
      trim: true,
      match: [/^[a-zA-Z0-9_-]+$/, 'Template name can only contain alphanumeric characters, underscores, and hyphens.'],
    },
    subject: {
      type: String,
      required: [true, 'Please provide an email subject'],
      trim: true,
    },
    htmlBody: {
      type: String,
      required: [true, 'Please provide the HTML body for the email'],
    },
    textBody: { // Optional plain text version for email clients that don't support HTML
      type: String,
    },
    // A list of placeholder variables that can be used in this template, for admin reference.
    // e.g., ["firstName", "lastName", "email", "quoteNumber", "policyNumber", "link"]
    placeholders: {
      type: [String],
      default: [],
    },
    description: { // Optional description for admin to understand the purpose of the template
        type: String,
        trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Ensure templateName is indexed for quick lookups
EmailTemplateSchema.index({ templateName: 1 });

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);
