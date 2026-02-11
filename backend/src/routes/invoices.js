import express from 'express';
const router = express.Router();
import invoiceController from '../controllers/invoiceController.js';
import { authenticate } from '../middleware/auth.js';
import { 
  createInvoiceValidation,
  paginationValidation 
} from '../middleware/validation.js';

// All routes require authentication
router.use(authenticate);

// Invoice routes
router.get('/', paginationValidation, invoiceController.getAllInvoices);
router.post('/', createInvoiceValidation, invoiceController.createInvoice);
router.get('/:id', invoiceController.getInvoiceById);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// Invoice actions
router.post('/:id/send', invoiceController.sendInvoice);
router.post('/:id/pay', invoiceController.payInvoice);

export default router;
