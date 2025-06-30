const Customer = require('../models/Customer');
// const jwt = require('jsonwebtoken'); // Will be needed for generating tokens

// Helper function to generate JWT - Placeholder for now
// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE || '30d',
//   });
// };

// @desc    Register a new customer
// @route   POST /api/v1/customers/register
// @access  Public
exports.registerCustomer = async (req, res, next) => {
  const { firstName, lastName, email, password, phoneNumber, address, dateOfBirth, customerType } = req.body;

  try {
    // Check if customer already exists
    let customer = await Customer.findOne({ email });
    if (customer) {
      return res.status(400).json({ success: false, error: 'Customer already exists with this email' });
    }

    // Create customer
    customer = await Customer.create({
      firstName,
      lastName,
      email,
      password, // Hashing is handled by the pre-save hook in the model
      phoneNumber,
      address,
      dateOfBirth,
      customerType,
    });

    // For now, just return customer data. Token generation can be added with auth module.
    // const token = generateToken(customer._id);
    // res.status(201).json({ success: true, token, data: customer });

    // Exclude password from response even if 'select: false' is in schema, to be absolutely sure
    const customerData = customer.toObject();
    delete customerData.password;

    res.status(201).json({
      success: true,
      data: customerData,
      // message: "Registration successful. Please login." // Or include token directly
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, error: 'Server Error during registration' });
  }
};

// @desc    Get current logged-in customer's profile
// @route   GET /api/v1/customers/profile
// @access  Private (Customer) - TODO: Add auth middleware (protect)
exports.getCustomerProfile = async (req, res, next) => {
  try {
    // Assuming req.user.id is populated by auth middleware
    // const customer = await Customer.findById(req.user.id);
    // For now, let's simulate by fetching a customer by ID passed as param for testing
    // This should be replaced by actual authenticated user logic
    if (!req.params.id_for_testing_profile) { // Temporary way to test without auth
        return res.status(400).json({ success: false, error: "Auth not implemented. Provide id_for_testing_profile in params for now."})
    }
    const customer = await Customer.findById(req.params.id_for_testing_profile);


    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update current logged-in customer's profile
// @route   PUT /api/v1/customers/profile
// @access  Private (Customer) - TODO: Add auth middleware (protect)
exports.updateCustomerProfile = async (req, res, next) => {
  try {
    // Assuming req.user.id is populated by auth middleware
    // const customer = await Customer.findById(req.user.id);
    // For now, let's simulate by fetching a customer by ID passed as param for testing
    if (!req.params.id_for_testing_profile) { // Temporary way to test without auth
        return res.status(400).json({ success: false, error: "Auth not implemented. Provide id_for_testing_profile in params for now."})
    }
    let customer = await Customer.findById(req.params.id_for_testing_profile);


    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    // Fields that a customer can update for their own profile
    const { firstName, lastName, phoneNumber, address, dateOfBirth, customerType } = req.body;
    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (phoneNumber) customer.phoneNumber = phoneNumber;
    if (address) customer.address = { ...customer.address, ...address }; // Merge address fields
    if (dateOfBirth) customer.dateOfBirth = dateOfBirth;
    if (customerType) customer.customerType = customerType;

    // If password change is requested (example, would need currentPassword for verification)
    // if (req.body.newPassword) {
    //   customer.password = req.body.newPassword; // Hashing will be handled by pre-save hook
    // }

    const updatedCustomer = await customer.save();
    const customerData = updatedCustomer.toObject();
    delete customerData.password;


    res.status(200).json({ success: true, data: customerData });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};


// --- Admin CRUD Operations ---

// @desc    Get all customers
// @route   GET /api/v1/customers
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({}); // Add pagination later
    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    console.error('Get All Customers Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get a single customer by ID (by Admin)
// @route   GET /api/v1/customers/:id
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: `Customer not found with id ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Customer not found with id ${req.params.id}` });
    }
    console.error('Get Customer By ID Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update a customer (by Admin)
// @route   PUT /api/v1/customers/:id
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.updateCustomer = async (req, res, next) => {
  try {
    // Admin can update more fields, e.g., isActive or even email (with caution)
    // For password changes by admin, a separate flow might be better (e.g., password reset)
    const { password, ...updateData } = req.body; // Exclude password from direct mass update by admin

    if (password) {
        // Handle password reset by admin separately if needed, this is a simple update.
        // For now, we don't allow admin to directly set password via this generic update.
        return res.status(400).json({ success: false, error: "Admin password update should use a dedicated reset mechanism."})
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ success: false, error: `Customer not found with id ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Customer not found with id ${req.params.id}` });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }
    console.error('Update Customer Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Delete a customer (by Admin)
// @route   DELETE /api/v1/customers/:id
// @access  Private (Admin) - TODO: Add auth middleware (protect, authorize('admin'))
exports.deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: `Customer not found with id ${req.params.id}` });
    }

    // Consider soft delete (setting isActive = false) instead of hard delete
    // For now, performing a hard delete:
    await customer.deleteOne();

    res.status(200).json({ success: true, data: {}, message: 'Customer deleted successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, error: `Customer not found with id ${req.params.id}` });
    }
    console.error('Delete Customer Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
