const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate } = require('../middleware/auth');
const { 
  createClientValidation, 
  updateClientValidation,
  paginationValidation 
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Client routes
router.get('/', paginationValidation, clientController.getAllClients);
router.post('/', createClientValidation, clientController.createClient);
router.get('/:id', clientController.getClientById);
router.put('/:id', updateClientValidation, clientController.updateClient);
router.delete('/:id', clientController.deleteClient);

// Client sub-resources
router.get('/:id/matters', paginationValidation, clientController.getClientMatters);
router.get('/:id/billing', clientController.getClientBilling);

module.exports = router;
