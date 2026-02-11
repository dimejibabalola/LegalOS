import express from 'express';
const router = express.Router();
import activityController from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { paginationValidation } from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Activity routes
router.get('/', paginationValidation, activityController.getAllActivities);
router.post('/', activityController.logActivity);
router.get('/recent', activityController.getRecentActivities);

export default router;
