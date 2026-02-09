const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// --- MOCK DATA ---
const USERS = [
    {
        _id: 'user_demo_123',
        username: 'Demo User',
        email: 'demo@example.com',
        password: 'password', // Plain text for mock
        avatarUrl: 'https://i.pravatar.cc/150?u=demo',
        role: 'user'
    },
    {
        _id: 'user_vikranth_456',
        username: 'Vikranth',
        email: 'vikranth@example.com',
        password: 'password',
        avatarUrl: 'https://i.pravatar.cc/150?u=vikranth',
        role: 'admin'
    }
];

let MESSAGES = [
    {
        _id: 'msg_1',
        sender: 'user_demo_123',
        recipient: 'user_vikranth_456',
        content: 'Hello Vikranth! This is a demo message.',
        createdAt: new Date(Date.now() - 10000000)
    },
    {
        _id: 'msg_2',
        sender: 'user_vikranth_456',
        recipient: 'user_demo_123',
        content: 'Hi Demo User! Glad to see the chat working.',
        createdAt: new Date(Date.now() - 5000000)
    }
];

// --- HELPER FUNCTIONS ---
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'development_secret_key_123', {
        expiresIn: '30d',
    });
};

// --- MOCK MIDDLEWARE ---
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'development_secret_key_123');
            req.user = USERS.find(u => u._id === decoded.id);
            if (!req.user) throw new Error('User not found');
            next();
        } catch (error) {
            console.error('Auth Error:', error.message);
            res.status(401).json({ message: 'Not authorized' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// --- API ROUTES ---

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = USERS.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password (Try: demo@example.com / password)' });
    }
});

// Register (Mock)
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;

    if (USERS.find(u => u.email === email)) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = {
        _id: 'user_' + Date.now(),
        username,
        email,
        password,
        avatarUrl: '',
        role: 'user'
    };
    USERS.push(newUser);

    res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        token: generateToken(newUser._id),
    });
});

// Get Current User
app.get('/api/auth/me', protect, (req, res) => {
    res.json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl
    });
});

// Get All Users
app.get('/api/auth/users', protect, (req, res) => {
    const others = USERS.filter(u => u._id !== req.user._id).map(u => ({
        _id: u._id,
        username: u.username,
        email: u.email,
        avatarUrl: u.avatarUrl
    }));
    res.json(others);
});

// Get Messages
app.get('/api/messages/:userId', protect, (req, res) => {
    const chatPartnerId = req.params.userId;
    const chatMessages = MESSAGES.filter(msg =>
        (msg.sender === req.user._id && msg.recipient === chatPartnerId) ||
        (msg.sender === chatPartnerId && msg.recipient === req.user._id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json(chatMessages);
});

// Send Message (HTTP)
app.post('/api/messages', protect, (req, res) => {
    const { recipient, content } = req.body;
    const newMessage = {
        _id: 'msg_' + Date.now(),
        sender: req.user._id,
        recipient,
        content,
        createdAt: new Date()
    };
    MESSAGES.push(newMessage);
    res.status(201).json(newMessage);
});

// --- SOCKET.IO ---
const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log(`Mock Server: New connection ${socket.id}`);

    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} is online (Mock)`);
        io.emit('userOnline', userId);
    });

    socket.on('sendMessage', (data) => {
        const { senderId, recipientId, content } = data;

        const newMessage = {
            _id: 'msg_' + Date.now(),
            sender: senderId,
            recipient: recipientId,
            content,
            createdAt: new Date()
        };
        MESSAGES.push(newMessage);

        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receiveMessage', newMessage);
        }
    });

    socket.on('typing', (data) => {
        const { recipientId, isTyping } = data;
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('userTyping', {
                senderId: socket.id,
                isTyping
            });
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                io.emit('userOffline', userId);
                break;
            }
        }
    });
});

// Catch-all for frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`\n--- MOCK SERVER RUNNING on port ${PORT} ---`);
    console.log(`Using In-Memory Data (No MongoDB required)`);
    console.log(`Demo Users Available:`);
    console.log(`1. Email: demo@example.com / Password: password`);
    console.log(`2. Email: vikranth@example.com / Password: password`);
});
