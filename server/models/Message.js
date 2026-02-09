const mongoose = require('mongoose');

// Define the Chat Message Schema
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // The user sending the message
        required: true
    },
    recipient: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // The user receiving the message
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content cannot be empty']
    },
    read: {
        type: Boolean,
        default: false // Track if the message has been read
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);
