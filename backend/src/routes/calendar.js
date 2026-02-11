import express from 'express';
const router = express.Router();
import calendarController from '../controllers/calendarController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createCalendarEventValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Calendar event routes
router.get('/', paginationValidation, calendarController.getAllEvents);
router.post('/', createCalendarEventValidation, calendarController.createEvent);
router.get('/today', calendarController.getTodayEvents);
router.get('/:id', calendarController.getEventById);
router.put('/:id', calendarController.updateEvent);
router.delete('/:id', calendarController.deleteEvent);

export default router;
