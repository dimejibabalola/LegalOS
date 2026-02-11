import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { paginationValidation } from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', paginationValidation, userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.changePassword);

export default router;
