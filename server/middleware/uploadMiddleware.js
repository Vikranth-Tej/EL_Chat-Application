const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage Engine to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'nexus_uploads', // The folder in Cloudinary where files will be stored
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'], // Allowed file formats
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Resize images to max 500x500
    }
});

// Initialize Multer with the Cloudinary storage engine
const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };
