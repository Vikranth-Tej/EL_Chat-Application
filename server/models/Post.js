const mongoose = require('mongoose');

// Define the Blog Post Schema
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title to the post'],
        trim: true,
        maxlength: 100 // Limit title length
    },
    content: {
        type: String,
        required: [true, 'Please add some content']
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    tags: {
        type: [String], // Array of strings for tags
        default: []
    },
    mediaUrl: {
        type: String, // URL for an image or video uploaded via Cloudinary
        default: ''
    },
    likes: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User' // Array of user IDs who liked the post
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', postSchema);
