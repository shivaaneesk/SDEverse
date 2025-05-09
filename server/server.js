const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const algorithmRoutes = require('./routes/algorithmRoutes');
const authRoutes = require('./routes/authRoutes');        // handles /register, /login, /me
const userRoutes = require('./routes/userRoutes');        // admin-only user management
const contributionRoutes = require('./routes/contributionRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json()); // To accept JSON

// Routes
app.use('/api/auth', authRoutes);               // Register/Login/Me
app.use('/api/users', userRoutes);              // Admin user management
app.use('/api/algorithms', algorithmRoutes);
app.use('/api/contributions', contributionRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
