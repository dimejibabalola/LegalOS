const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticate } = require('../middleware/auth');
const { 
  createCommunicationValidation,
  paginationValidation 
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Communication routes
router.get('/', paginationValidation, communicationController.getAllCommunications);
router.post('/', createCommunicationValidation, communicationController.createCommunication);
router.get('/:id', communicationController.getCommunicationById);
router.put('/:id', communicationController.updateCommunication);
router.delete('/:id', communicationController.deleteCommunication);

module.exports = router;
