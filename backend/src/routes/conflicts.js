const express = require('express');
const router = express.Router();
const conflictController = require('../controllers/conflictController');
const { authenticate } = require('../middleware/auth');
const { 
  conflictCheckValidation,
  paginationValidation 
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Conflict check routes
router.post('/check', conflictCheckValidation, conflictController.checkConflicts);
router.get('/', paginationValidation, conflictController.getConflictHistory);
router.post('/', conflictController.logConflictCheck);

module.exports = router;
