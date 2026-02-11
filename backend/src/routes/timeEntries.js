import express from 'express';
const router = express.Router();
import timeEntryController from '../controllers/timeEntryController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createTimeEntryValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Time entry routes
router.get('/', paginationValidation, timeEntryController.getAllTimeEntries);
router.post('/', createTimeEntryValidation, timeEntryController.createTimeEntry);
router.get('/summary', timeEntryController.getTimeEntrySummary);
router.get('/:id', timeEntryController.getTimeEntryById);
router.put('/:id', timeEntryController.updateTimeEntry);
router.delete('/:id', timeEntryController.deleteTimeEntry);

export default router;
