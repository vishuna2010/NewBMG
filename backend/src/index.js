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
const userRoutes = require('./routes/userRoutes'); // Updated from customerRoutes
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes); // Auth routes for register, login, me
app.use('/api/v1/users', userRoutes); // Now using userRoutes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/claims', claimRoutes);
app.use('/api/v1/payments', paymentRoutes);


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
