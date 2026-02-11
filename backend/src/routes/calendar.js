const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticate } = require('../middleware/auth');
const { 
  createCalendarEventValidation,
  paginationValidation 
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Calendar event routes
router.get('/', paginationValidation, calendarController.getAllEvents);
router.post('/', createCalendarEventValidation, calendarController.createEvent);
router.get('/today', calendarController.getTodayEvents);
router.get('/:id', calendarController.getEventById);
router.put('/:id', calendarController.updateEvent);
router.delete('/:id', calendarController.deleteEvent);

module.exports = router;
