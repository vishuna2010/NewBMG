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
const productRoutes = require('./routes/productRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const customerRoutes = require('./routes/customerRoutes');
const policyRoutes = require('./routes/policyRoutes');

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/policies', policyRoutes);

// Example for future routes (to be expanded)

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
