import express from 'express';
const router = express.Router();
import communicationController from '../controllers/communicationController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createCommunicationValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Communication routes
router.get('/', paginationValidation, communicationController.getAllCommunications);
router.post('/', createCommunicationValidation, communicationController.createCommunication);
router.get('/:id', communicationController.getCommunicationById);
router.put('/:id', communicationController.updateCommunication);
router.delete('/:id', communicationController.deleteCommunication);

export default router;
