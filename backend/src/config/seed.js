const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./db'); // Assuming db.js exports the connectDB function
const User = require('../models/User'); // Adjust path if User model is elsewhere
const Product = require('../models/Product'); // Add Product model

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

const productsToSeed = [
  {
    name: 'Auto Insurance',
    productType: 'Auto',
    description: 'Comprehensive auto insurance coverage for personal vehicles',
    features: [
      'Liability Coverage',
      'Collision Coverage',
      'Comprehensive Coverage',
      'Uninsured Motorist Protection',
      'Medical Payments',
      'Roadside Assistance'
    ],
    coverageOptions: {
      liability: { min: 25000, max: 500000, default: 100000 },
      collision: { min: 100, max: 1000, default: 500 },
      comprehensive: { min: 100, max: 1000, default: 500 },
      uninsuredMotorist: { min: 25000, max: 500000, default: 100000 }
    },
    basePrice: 800,
    isActive: true,
    createdBy: null // Will be set to admin user ID
  },
  {
    name: 'Home Insurance',
    productType: 'Home',
    description: 'Complete home insurance protection for homeowners',
    features: [
      'Dwelling Coverage',
      'Personal Property Coverage',
      'Liability Protection',
      'Additional Living Expenses',
      'Medical Payments to Others',
      'Loss of Use'
    ],
    coverageOptions: {
      dwelling: { min: 100000, max: 2000000, default: 300000 },
      personalProperty: { min: 25000, max: 500000, default: 150000 },
      liability: { min: 100000, max: 1000000, default: 300000 },
      medicalPayments: { min: 1000, max: 10000, default: 5000 }
    },
    basePrice: 1200,
    isActive: true,
    createdBy: null // Will be set to admin user ID
  },
  {
    name: 'Life Insurance',
    productType: 'Life',
    description: 'Term life insurance for financial protection',
    features: [
      'Death Benefit',
      'Term Coverage',
      'Convertible Options',
      'Accelerated Death Benefit',
      'Waiver of Premium'
    ],
    coverageOptions: {
      deathBenefit: { min: 50000, max: 5000000, default: 500000 },
      termLength: { min: 10, max: 30, default: 20 }
    },
    basePrice: 500,
    isActive: true,
    createdBy: null // Will be set to admin user ID
  }
];

const importData = async () => {
  try {
    await connectDB();

    // Clear existing users and products
    await User.deleteMany();
    await Product.deleteMany();
    console.log('Existing users and products deleted.');

    // Insert new users
    const createdUsers = await User.create(usersToSeed);
    console.log(`${createdUsers.length} users imported successfully!`);

    // Get admin user for product creation
    const adminUser = createdUsers.find(user => user.role === 'admin');
    
    // Set createdBy for products
    const productsWithCreator = productsToSeed.map(product => ({
      ...product,
      createdBy: adminUser._id
    }));

    // Insert new products
    const createdProducts = await Product.create(productsWithCreator);
    console.log(`${createdProducts.length} products imported successfully!`);

    // Log admin user details for easy access
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

    // Clear existing users and products
    await User.deleteMany();
    await Product.deleteMany();
    console.log('All users and products destroyed successfully!');
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
