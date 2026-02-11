import express from 'express';
const router = express.Router();
import documentController from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createDocumentValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Document routes
router.get('/', paginationValidation, documentController.getAllDocuments);
router.post('/', createDocumentValidation, documentController.createDocument);
router.get('/:id', documentController.getDocumentById);
router.delete('/:id', documentController.deleteDocument);

export default router;
