const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Define routes using the controller functions

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// GET /api/auth/users
router.get('/users', protect, require('../controllers/authController').getAllUsers);

// GET /api/auth/me
// This route is protected, meaning the user must send a valid token
router.get('/me', protect, getMe);

module.exports = router;
