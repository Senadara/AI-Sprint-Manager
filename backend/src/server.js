require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { connectDB, sequelize } = require('./config/database');
require('./models');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');

// Ambil origin dari ENV atau default ke localhost (supaya fleksibel)
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/sprints', require('./routes/sprint'));
app.use('/api/tasks', require('./routes/task'));
app.use('/api/ai', require('./routes/ai'));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('taskUpdated', (data) => {
    socket.broadcast.emit('taskUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('AI Sprint Manager Backend is running 🚀');
});

// PORT harus dari env (cPanel yang tentukan)
const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await connectDB();
  await sequelize.sync(); // di production sebaiknya migrasi manual, bukan alter
  console.log('✅ Database synced');
});
