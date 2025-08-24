import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDatabase } from './database/init.js';
import moodsRouter from './routes/moods.js';
import usersRouter from './routes/users.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, 'config.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database initialization
initDatabase();

// Routes
app.use('/api/moods', moodsRouter);
app.use('/api/users', usersRouter);

// Basic route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running successfully! 🚀' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 API available at: http://localhost:${PORT}/api`);
  console.log(`🌐 Test endpoint: http://localhost:${PORT}/api/test`);
});

export default app;
