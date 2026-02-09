const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
// This creates a verifiable string that contains the user's ID
// We sign it with our SECRET key
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    try {
        // Destructure name, email, password from request body
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user in the database
        // The password will be automatically hashed effectively by our pre-save hook in User.js
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            // If successful, send back user data and a token
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user & get toke
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email in database
        // We include .select('+password') because we set select: false in the model
        const user = await User.findOne({ email }).select('+password');

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    // req.user is set by our auth middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl
    });
};

// @desc    Get all users (for chat list)
// @route   GET /api/auth/users
// @access  Private
exports.getAllUsers = async (req, res) => {
    try {
        // Return all users except the current one
        const users = await User.find({ _id: { $ne: req.user.id } }).select('-password');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
