import express from 'express';
const router = express.Router();

// Import route modules
import authRoutes from './auth.js';
import clientRoutes from './clients.js';
import matterRoutes from './matters.js';
import invoiceRoutes from './invoices.js';
import timeEntryRoutes from './timeEntries.js';
import taskRoutes from './tasks.js';
import documentRoutes from './documents.js';
import communicationRoutes from './communications.js';
import calendarRoutes from './calendar.js';
import conflictRoutes from './conflicts.js';
import reportRoutes from './reports.js';
import activityRoutes from './activities.js';
import userRoutes from './users.js';

// Mount routes
router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/matters', matterRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/time-entries', timeEntryRoutes);
router.use('/tasks', taskRoutes);
router.use('/documents', documentRoutes);
router.use('/communications', communicationRoutes);
router.use('/calendar-events', calendarRoutes);
router.use('/conflicts', conflictRoutes);
router.use('/reports', reportRoutes);
router.use('/activities', activityRoutes);
router.use('/users', userRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Babalola Legal OS API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
