const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { 
  createDocumentValidation,
  paginationValidation 
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Document routes
router.get('/', paginationValidation, documentController.getAllDocuments);
router.post('/', createDocumentValidation, documentController.createDocument);
router.get('/:id', documentController.getDocumentById);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
