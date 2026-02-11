const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const clientRoutes = require('./clients');
const matterRoutes = require('./matters');
const invoiceRoutes = require('./invoices');
const timeEntryRoutes = require('./timeEntries');
const taskRoutes = require('./tasks');
const documentRoutes = require('./documents');
const communicationRoutes = require('./communications');
const calendarRoutes = require('./calendar');
const conflictRoutes = require('./conflicts');
const reportRoutes = require('./reports');
const activityRoutes = require('./activities');
const userRoutes = require('./users');

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

module.exports = router;
