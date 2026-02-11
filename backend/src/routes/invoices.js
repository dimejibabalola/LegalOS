const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');
const { 
  createInvoiceValidation,
  paginationValidation 
} = require('../middleware/validation');

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

module.exports = router;
