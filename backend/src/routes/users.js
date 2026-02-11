const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { paginationValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// User routes
router.get('/', paginationValidation, userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.changePassword);

module.exports = router;
