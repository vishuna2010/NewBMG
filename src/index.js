// Main application entry point
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
// This will look for a .env file in the root of the project.
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount routers
const healthRoutes = require('./routes/healthRoutes');
app.use('/api/v1/health', healthRoutes);

// Example for future routes (to be expanded)
// const policyRoutes = require('./routes/policies');
// app.use('/api/v1/policies', policyRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
