import express from 'express';
const router = express.Router();
import conflictController from '../controllers/conflictController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  conflictCheckValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Conflict check routes
router.post('/check', conflictCheckValidation, conflictController.checkConflicts);
router.get('/', paginationValidation, conflictController.getConflictHistory);
router.post('/', conflictController.logConflictCheck);

export default router;
