const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
// This allows us to use process.env.PORT, process.env.MONGO_URI, etc.
dotenv.config();

// Initialize MongoDB connection
connectDB();

// Initialize Express app
const app = express();

// Create an HTTP server using the Express app
// This is necessary to attach Socket.IO to the same server
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
// Configure CORS to allow connections from any origin (for development)
const io = new Server(server, {
    cors: {
        origin: "*", // In production, restrict this to your frontend domain
        methods: ["GET", "POST"]
    }
});

// Middleware

// specific middleware to parse JSON bodies
app.use(express.json());

// specific middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// specific middleware to handle Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Serve static files from the 'public' directory
// This will serve our frontend HTML, CSS, and JS files
app.use(express.static('public'));

// Routes
// We will define our API routes here later
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Serve the landing page
});

const Message = require('./models/Message');

// Store connected users: userId -> socketId
const onlineUsers = new Map();

// Socket.IO Connection Handler
// This function runs whenever a client connects to the socket server
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Event: User joins the chat
    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.userId = userId; // Store userId on the socket for easy access
        console.log(`User ${userId} is online`);
        io.emit('userOnline', userId);
    });

    // Event: Send Message
    socket.on('sendMessage', async (data) => {
        const { senderId, recipientId, content } = data;

        // 1. Save message to MongoDB
        try {
            const newMessage = await Message.create({
                sender: senderId,
                recipient: recipientId,
                content
            });

            // 2. Check if recipient is online
            const recipientSocketId = onlineUsers.get(recipientId);

            if (recipientSocketId) {
                // If online, emit the message directly to their socket
                io.to(recipientSocketId).emit('receiveMessage', newMessage);
            }
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    // Event: Typing Indicator
    socket.on('typing', (data) => {
        const { recipientId, isTyping } = data;
        const recipientSocketId = onlineUsers.get(recipientId);

        if (recipientSocketId) {
            io.to(recipientSocketId).emit('userTyping', {
                senderId: socket.userId, // Use the stored userId
                isTyping
            });
        }
    });

    // Listen for 'disconnect' event
    socket.on('disconnect', () => {
        console.log('User disconnected');
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('userOffline', socket.userId);
        }
    });
});

// Define the port to run the server on
// Use the PORT environment variable if available, otherwise default to 5000
const PORT = process.env.PORT || 5000;

// Start the server and listen on the specified port
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
