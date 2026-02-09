const mongoose = require('mongoose');

// Function to connect to MongoDB
// This function is asynchronous because database connection takes time
const connectDB = async () => {
    try {
        // Attempt to connect to MongoDB using the URI from environment variables
        // mongoose.connect returns a promise, so we await it
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If connection fails, log the error and exit the process
        console.error(`Error: ${error.message}`);
        // Exit process with failure (1)
        process.exit(1);
    }
};

module.exports = connectDB;
