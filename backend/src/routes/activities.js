const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');
const { paginationValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Activity routes
router.get('/', paginationValidation, activityController.getAllActivities);
router.post('/', activityController.logActivity);
router.get('/recent', activityController.getRecentActivities);

module.exports = router;
