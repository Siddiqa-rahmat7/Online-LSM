require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// 1) MIDDLEWARE (sabse upar)
app.use(cors());           // frontend (5173) ko allow karo
app.use(express.json());   // request body (JSON) padhne ke liye

// 2) ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/auth'));   // naya (Step 9)
app.use('/api/courses', require('./routes/courses'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/admin', require('./routes/admin'));

// 3) ERROR HANDLER (routes ke baad)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Server error' });
});

// 4) DATABASE CONNECT, phir SERVER START (sabse neeche)
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });