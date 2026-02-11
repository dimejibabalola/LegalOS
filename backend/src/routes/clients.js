import express from 'express';
const router = express.Router();
import clientController from '../controllers/clientController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createClientValidation, 
  updateClientValidation,
  paginationValidation 
} from '../middleware/validation.js';

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

export default router;
