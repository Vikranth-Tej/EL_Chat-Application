const express = require('express');
const router = express.Router();
const {
    getPosts,
    getPostById,
    createPost,
    deletePost,
    likePost
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public Routes
// Anyone can view posts
router.get('/', getPosts);
router.get('/:id', getPostById);

// Protected Routes
// Middleware 'protect' ensures user is logged in
// Middleware 'upload.single("image")' handles file upload (field name 'image')
router.post('/', protect, upload.single('image'), createPost);

router.delete('/:id', protect, deletePost);

router.put('/like/:id', protect, likePost);

module.exports = router;
