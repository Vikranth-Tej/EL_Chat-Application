const Message = require('../models/Message');

// @desc    Get messages between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        // Find messages where the current user is sender OR recipient
        // AND the other user (params.userId) is sender OR recipient
        const messages = await Message.find({
            $or: [
                { sender: req.user.id, recipient: req.params.userId },
                { sender: req.params.userId, recipient: req.user.id }
            ]
        }).sort({ createdAt: 1 }); // Sort by creation time (ascending)

        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Send a message (This is mainly for the HTTP fallback, most messages will go through Socket.IO)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { recipient, content } = req.body;

        const message = await Message.create({
            sender: req.user.id,
            recipient,
            content
        });

        res.status(201).json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
