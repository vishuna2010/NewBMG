const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // useNewUrlParser, useUnifiedTopology, useCreateIndex, and useFindAndModify are no longer supported options in Mongoose 6+
    // They are handled internally and default to the recommended settings.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
