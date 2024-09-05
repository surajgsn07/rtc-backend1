const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Configure CORS to allow requests from localhost:5173
app.use(cors({
    origin: 'https://rtc-frontend1.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true,
}));


app.get("/",(req,res)=>{
    res.send("hello world");

    }
)
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'https://rtc-frontend1.vercel.app',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true,
    }
});

const users = {}; // Store socket IDs and user IDs

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        delete users[socket.id];
    });

    socket.on('register', (userId) => {
        users[userId] = socket.id; // Map the user ID to the socket ID
        console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    });

    socket.on('offer', ({ offer, targetId }) => {
        console.log("first")
        const targetSocket = users[targetId];
        console.log("target sojcer" , targetSocket)
        if (targetSocket) {
            io.to(targetSocket).emit('offer', { offer, from: socket.id });
            console.log(`Offer sent from ${socket.id} to ${targetSocket}`);
        }
    });

    socket.on('answer', ({ answer, targetId }) => {
        const targetSocket = users[targetId];
        if (targetSocket) {
            io.to(targetSocket).emit('answer', answer);
            console.log(`Answer sent from ${socket.id} to ${targetSocket}`);
        }
    });

    socket.on('ice-candidate', ({ candidate, targetId }) => {
        const targetSocket = users[targetId];
        if (targetSocket) {
            io.to(targetSocket).emit('ice-candidate', candidate);
            console.log(`ICE Candidate sent from ${socket.id} to ${targetSocket}`);
        }
    });
});

server.listen(process.env.PORT || 10000, () => {
    console.log('Server is listening on port 3000');
});
