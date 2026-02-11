import express from 'express';
const router = express.Router();
import matterController from '../controllers/matterController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createMatterValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Matter routes
router.get('/', paginationValidation, matterController.getAllMatters);
router.post('/', createMatterValidation, matterController.createMatter);
router.get('/:id', matterController.getMatterById);
router.put('/:id', matterController.updateMatter);
router.delete('/:id', matterController.deleteMatter);

// Matter sub-resources
router.get('/:id/time-entries', paginationValidation, matterController.getMatterTimeEntries);
router.get('/:id/documents', paginationValidation, matterController.getMatterDocuments);
router.get('/:id/tasks', paginationValidation, matterController.getMatterTasks);
router.get('/:id/communications', paginationValidation, matterController.getMatterCommunications);

export default router;
