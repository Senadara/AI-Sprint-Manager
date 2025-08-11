require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./config/database');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
//   credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/project'));
app.use('/api/sprints', require('./routes/sprint'));
app.use('/api/tasks', require('./routes/task'));


app.get('/', (req, res) => {
  res.send('AI Sprint Manager Backend is running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  await connectDB();

  // Sinkronisasi model dengan DB
  await sequelize.sync({ alter: true });
  console.log('✅ Database synced');
});
