import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
import reminderRoutes from './routes/reminders.js';
import metricRoutes from './routes/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARES — allow Vercel frontend to call this API
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'https://medimind-ai-three.vercel.app',
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// REGISTER API ROUTERS
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/metrics', metricRoutes);

// CATCH-ALL ROUTE FOR HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    message: "MediMind AI REST API is fully operational.",
    timestamp: new Date()
  });
});

// START SERVER AND SYNCHRONIZE DATABASE DYNAMICALLY
async function startServer() {
  try {
    // Synchronize DB tables. If tables don't exist, Sequelize creates them.
    await sequelize.sync();
    console.log("⚡ [DB] Database tables synchronized successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 [Server] MediMind Core running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to initiate MediMind Core services:", err);
    process.exit(1);
  }
}

startServer();
