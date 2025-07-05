// Main application entry point
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS package
const connectDB = require('./config/db');

// Load env vars
// This will look for a .env file in the root of the project.
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
// Define allowed origins
const allowedOrigins = [
  'http://localhost:3002', // Admin Portal
  'http://localhost:3003', // Customer Portal
  // Add any other origins you need to allow, like deployed frontend URLs
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // If you need to handle cookies or authorization headers
}));

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
const emailTemplateRoutes = require('./routes/emailTemplateRoutes');
const insurerRoutes = require('./routes/insurerRoutes');
const ratingFactorRoutes = require('./routes/ratingFactorRoutes');
const rateTableRoutes = require('./routes/rateTableRoutes');
const premiumRoutes = require('./routes/premiumRoutes');

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes); // Auth routes for register, login, me
app.use('/api/v1/users', userRoutes); // Now using userRoutes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/quotes', quoteRoutes);
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/claims', claimRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/email-templates', emailTemplateRoutes);
app.use('/api/v1/insurers', insurerRoutes);
app.use('/api/v1/rating-factors', ratingFactorRoutes);
app.use('/api/v1/rate-tables', rateTableRoutes);
app.use('/api/v1/premium', premiumRoutes);

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
