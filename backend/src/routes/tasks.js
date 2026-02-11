import express from 'express';
const router = express.Router();
import taskController from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createTaskValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Task routes
router.get('/', paginationValidation, taskController.getAllTasks);
router.post('/', createTaskValidation, taskController.createTask);
router.get('/today', taskController.getTodayTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

export default router;
