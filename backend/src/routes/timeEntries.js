const express = require('express');
const router = express.Router();
const timeEntryController = require('../controllers/timeEntryController');
const { authenticate } = require('../middleware/auth');
const { 
  createTimeEntryValidation,
  paginationValidation 
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Time entry routes
router.get('/', paginationValidation, timeEntryController.getAllTimeEntries);
router.post('/', createTimeEntryValidation, timeEntryController.createTimeEntry);
router.get('/summary', timeEntryController.getTimeEntrySummary);
router.get('/:id', timeEntryController.getTimeEntryById);
router.put('/:id', timeEntryController.updateTimeEntry);
router.delete('/:id', timeEntryController.deleteTimeEntry);

module.exports = router;
