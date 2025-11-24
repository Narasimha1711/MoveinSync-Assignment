import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import alertRoutes from './routes/alerts.js';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { runAutoCloseJob } from './services/backgroundWorker.js';
import cron from 'node-cron';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',  // Your frontend port
  credentials: true
}));
app.use(express.json());
// app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);

cron.schedule('*/3 * * * *', () => {
  console.log('Running auto-close job...');
  runAutoCloseJob();
});

app.use(errorHandler);

export default app;