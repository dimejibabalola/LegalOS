const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginValidation, registerValidation } = require('../middleware/validation');

// Public routes
router.post('/login', loginValidation, authController.login);
router.post('/register', registerValidation, authController.register);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
