const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All routes here should be protected
router.use(protect);

// GET /api/messages/:userId - Get chat history with a specific user
router.get('/:userId', getMessages);

// POST /api/messages - Send a message (HTTP fallback)
router.post('/', sendMessage);

module.exports = router;
