const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
console.log('Attempting to connect with URI:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection Failed!');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Full Error:', JSON.stringify(err, null, 2));
        if (err.cause) {
            console.error('Cause:', err.cause);
        }
        process.exit(1);
    });
