import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginValidation, registerValidation } from '../middleware/validation.js';

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
