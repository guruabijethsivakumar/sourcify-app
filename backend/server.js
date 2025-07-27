const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// This MUST be at the top
dotenv.config();

// Make sure the path to your scheduler is correct
const auctionScheduler = require('./services/auctionScheduler.js'); 

// Basic Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
    } 
});

// Core Middleware
app.use(cors());
app.use(express.json());

// Middleware to attach 'io' to each request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// === API ROUTES GO HERE ===
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auctions', require('./routes/auctionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // This line loads your fixed adminRoutes.js
app.use('/api/communities', require('./routes/communityRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// === FRONTEND SERVING GOES HERE ===
// --- Frontend Serving ---
// Correctly define the path to the public directory, one level up.
const publicDirectoryPath = path.join(__dirname, '..', 'public');

// This middleware correctly serves static files like login.html, style.css, etc.
app.use(express.static(publicDirectoryPath));

// The catch-all route must also use the correct path.
app.get('*', (req, res) => {
    // Reuse the publicDirectoryPath variable to send the main application file.
    res.sendFile(path.join(publicDirectoryPath, 'dashboard.html'));
});

// === DATABASE AND SERVER STARTUP GOES HERE ===
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected...');
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        auctionScheduler.start(io);
    })
    .catch(err => {
        console.error('FATAL: Database Connection Error:', err);
        process.exit(1);
    });

// === SOCKET.IO LOGIC GOES HERE ===
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('join_user_room', (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} joined personal room ${userId}`);
    });

    socket.on('join_auction_room', (auctionId) => {
        socket.join(auctionId);
        console.log(`User ${socket.id} joined auction room ${auctionId}`);
    });
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});