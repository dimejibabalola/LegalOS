const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Report routes
router.get('/revenue', reportController.getRevenueReport);
router.get('/utilization', reportController.getUtilizationReport);
router.get('/aging', reportController.getAgingReport);

module.exports = router;
