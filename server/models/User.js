const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Define the User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true, // Usernames must be unique
        trim: true,   // Remove whitespace from both ends
        minlength: 3  // Minimum length of 3 characters
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email' // Regex validation for email
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6, // Passwords should be at least 6 characters long
        select: false, // Don't return password by default in queries
        validate: {
            validator: function (v) {
                // Regex: At least one uppercase letter, at least one special character (non-alphanumeric)
                return /(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/.test(v);
            },
            message: 'Password must contain at least one uppercase letter and one special character'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Only allow 'user' or 'admin' roles
        default: 'user'
    },
    avatarUrl: {
        type: String,
        default: '' // URL to the user's profile picture
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set creation date
    }
});

// Mongoose Pre-save Middleware
// This runs before saving a user to the database
// We use this to hash the password
userSchema.pre('save', async function (next) {
    // If the password field is not modified, skip hashing
    if (!this.isModified('password')) {
        next();
    }

    // Generate a salt with 10 rounds
    // A salt is random data added to the password to ensure unique hashes
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
    // bcrypt.compare returns a boolean
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to generate a JSON Web Token (JWT)
userSchema.methods.getSignedJwtToken = function () {
    // Sign the token with the user's ID
    // valid for 30 days
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = mongoose.model('User', userSchema);
