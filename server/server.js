import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import dataStore from './services/dataStore.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

export const createServerApp = async () => {
  // Connect to DB or init memory fallback
  await connectDB();
  await dataStore.init();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/departments', departmentRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/reports', reportRoutes);

  // Health / Status endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'active',
      app: 'Employee Payroll Management System',
      time: new Date().toISOString(),
      database: dataStore.isMongoActive() ? 'MongoDB Connected' : 'In-Memory Store (Active with Sample Data)',
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

// Standalone runner if executed directly
if (process.env.STANDALONE === 'true') {
  const PORT = process.env.PORT || 5000;
  createServerApp().then((app) => {
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  });
}
