// This file is intended to be used with dotenv to load environment variables.
// For development, you can create a .env file in the root of your project (or here)
// and populate it with your variables.
// For production, these variables should be set in your deployment environment.

// Example .env file content (DO NOT COMMIT ACTUAL SECRETS TO GIT)
// MONGO_URI=your_mongodb_connection_string
// PORT=5000
// NODE_ENV=development
// JWT_SECRET=your_jwt_secret
// JWT_EXPIRE=30d

// To use this with dotenv, you typically load it like:
// require('dotenv').config({ path: './src/config/env.js' });
// Or if you create a .env file in the project root:
// require('dotenv').config();

// This file itself doesn't directly export anything if it's just a list of key=value pairs for dotenv.
// However, if you want to provide default values or structure them in JS, you could do:
/*
module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/insurance_broker_dev',
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'replace_this_secret_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
};
*/

// For now, we'll keep it simple and assume a separate .env file in the root
// or that environment variables are set directly in the environment.
// The src/index.js will load dotenv and expect these variables to be available via process.env.

// Placeholder content to make it a valid JS file if not using the .env approach directly with this path
// For the dotenv setup `dotenv.config({ path: './src/config/env.js' });`
// this file should contain the actual environment variables like:
// MONGO_URI=your_mongodb_connection_string_here
// PORT=5000
// NODE_ENV=development

// Let's add some placeholder values here.
// **IMPORTANT**: For a real application, create a separate `.env` file in the project root
// and add `src/config/env.js` and `.env` to your `.gitignore` file.
// DO NOT commit actual secrets.
MONGO_URI=mongodb://localhost:27017/insurance_broker_dev_placeholder
PORT=5001
NODE_ENV=development
JWT_SECRET=default_jwt_secret_replace_me
JWT_EXPIRE=30d

