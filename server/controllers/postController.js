const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
    try {
        // Find all posts and sort by creation date (newest first)
        // .populate('author', 'username avatarUrl') replaces the author ID with the actual user document,
        // but only selecting the 'username' and 'avatarUrl' fields
        const posts = await Post.find()
            .populate('author', 'username avatarUrl')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username avatarUrl');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error(error);

        // If the ID is not a valid ObjectId format
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;

        // Check if an image was uploaded
        // req.file is added by the upload middleware
        let mediaUrl = '';
        if (req.file) {
            mediaUrl = req.file.path; // Cloudinary returns the URL in .path
        }

        const newPost = await Post.create({
            title,
            content,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Convert comma-separated string to array
            mediaUrl,
            author: req.user.id // req.user is set by auth middleware
        });

        // Populate author before sending response
        const post = await Post.findById(newPost._id).populate('author', 'username avatarUrl');

        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check user ownership
        // post.author is an ObjectId, so we convert it to string for comparison
        if (post.author.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await post.deleteOne(); // or post.remove() in older Mongoose versions

        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Like a post
// @route   PUT /api/posts/like/:id
// @access  Private
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the post has already been liked by this user
        if (post.likes.filter(like => like.toString() === req.user.id).length > 0) {
            // Already liked, so unlike it (toggle)
            // Remove user index
            const removeIndex = post.likes.map(like => like.toString()).indexOf(req.user.id);
            post.likes.splice(removeIndex, 1);
        } else {
            // Add user id to likes array
            post.likes.unshift(req.user.id);
        }

        await post.save();

        res.json(post.likes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
