const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
// This verifies the JWT sent in the Authorization header
const protect = async (req, res, next) => {
    let token;

    // Check if the authorization header starts with 'Bearer'
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token payload (it contains the user id)
            // exclude the password from the result
            req.user = await User.findById(decoded.id).select('-password');

            // Proceed to the next middleware/route handler
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
