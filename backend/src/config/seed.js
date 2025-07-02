const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Assuming db.js exports the connectDB function
const User = require('../models/User'); // Adjust path if User model is elsewhere

const path = require('path'); // Import path module

// Load env vars
// Assuming your .env file is located in the 'backend' directory,
// and seed.js is in 'backend/src/config/'
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const usersToSeed = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'password123', // Plain text, will be hashed by User model's pre-save hook
    role: 'admin',
    phoneNumber: '0000000000', // Optional, but good to have
    address: { // Optional
      street: '123 Admin Lane',
      city: 'SystemCity',
      state: 'NA',
      postalCode: '00000',
      country: 'NA',
    },
    // You can add more fields here as defined in your User schema
  },
  {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
    phoneNumber: '1111111111',
    address: {
      street: '456 User Ave',
      city: 'ClientTown',
      state: 'NA',
      postalCode: '11111',
      country: 'NA',
    },
  },
  // Add more sample users if needed (e.g., an agent)
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany();
    console.log('Existing users deleted.');

    // Insert new users
    const createdUsers = await User.create(usersToSeed);
    console.log(`${createdUsers.length} users imported successfully!`);

    // Log admin user details for easy access
    const adminUser = createdUsers.find(user => user.role === 'admin');
    if (adminUser) {
      console.log('--- Admin User Created ---');
      console.log(`Email: ${adminUser.email}`);
      console.log('Password: password123 (as defined in seed script)'); // Remind user of the plain text password
      console.log('-------------------------');
    }

    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

const destroyData = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany();
    console.log('All users destroyed successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1); // Exit with failure code
  }
};

// Command line argument handling
if (process.argv[2] === '--delete' || process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
