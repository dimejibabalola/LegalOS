import express from 'express';
const router = express.Router();
import reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/auth.js';

// All routes require authentication
router.use(authenticate);

// Report routes
router.get('/revenue', reportController.getRevenueReport);
router.get('/utilization', reportController.getUtilizationReport);
router.get('/aging', reportController.getAgingReport);

export default router;
