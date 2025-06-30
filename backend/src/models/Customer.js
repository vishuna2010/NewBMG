const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CustomerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please add a first name'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please add a last name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password by default on queries
    },
    phoneNumber: {
      type: String,
      // Example validation, can be more specific
      // match: [/^[0-9]{10,15}$/, 'Please add a valid phone number'],
      trim: true,
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true }, // Or province
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true },
    },
    dateOfBirth: {
      type: Date,
    },
    customerType: {
      type: String,
      enum: ['Individual', 'Business'],
      default: 'Individual',
    },
    // 'role' helps if you merge this with a general User model later.
    // For a dedicated Customer model, it might be implicit.
    // For now, let's assume a customer is always 'customer' role implicitly
    // or handle roles in a more generic User model if staff/agents also need login.
    // role: {
    //   type: String,
    //   enum: ['customer', 'user'], // if distinguishing from other non-admin user types
    //   default: 'customer',
    // },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Add other fields as needed:
    // - communicationPreferences
    // - kycStatus, kycDocuments
    // - lastLogin
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
CustomerSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password in database
CustomerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// TODO: Add any virtuals or other methods if needed.
// Example: Virtual for full name
// CustomerSchema.virtual('fullName').get(function() {
//   return `${this.firstName} ${this.lastName}`;
// });

module.exports = mongoose.model('Customer', CustomerSchema);
