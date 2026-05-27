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

// MIDDLEWARES
app.use(cors()); // Allow cross-origin requests from React dashboard
app.use(express.json()); // Parse JSON payloads

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
    // 'alter: true' safely updates schemas without wiping user diagnostic history.
    await sequelize.sync({ alter: true });
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
