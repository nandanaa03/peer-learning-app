require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Models
const Message = require('./models/Message');

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const sessionRoutes = require('./routes/session');
const chatRoutes = require('./routes/chat');
const historyRoutes = require('./routes/history');
const forumRoutes = require('./routes/forum');
const expertRoutes = require('./routes/expert');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/expert', expertRoutes);

// Socket.io logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined room: ${sessionId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { sessionId, senderId, message } = data;
    try {
      const newMessage = new Message({
        session: sessionId,
        sender: senderId,
        message: message
      });
      await newMessage.save();
      
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name email');
      io.to(sessionId).emit('receiveMessage', populatedMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/peer-learning';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
