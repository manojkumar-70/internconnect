const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📨 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', { 'content-type': req.headers['content-type'], 'authorization': req.headers['authorization'] ? 'Bearer ***' : 'None' });
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', { ...req.body, password: req.body.password ? '***' : undefined });
  }
  next();
});

// Connect to MongoDB
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/students', require('./routes/studentRoutes'));
    app.use('/api/companies', require('./routes/companyRoutes'));
    app.use('/api/internships', require('./routes/internshipRoutes'));
    app.use('/api/applications', require('./routes/applicationRoutes'));
    app.use('/api/tasks', require('./routes/taskRoutes'));
    app.use('/api/teams', require('./routes/teamRoutes'));
    app.use('/api/ratings', require('./routes/ratingRoutes'));
    app.use('/api/admin', require('./routes/adminRoutes'));

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'Backend is running' });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ message: 'Route not found' });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Internal server error', error: err.message });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

startServer();

