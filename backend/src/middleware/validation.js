const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validations
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  handleValidationErrors
];

// Client validations
const createClientValidation = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .trim(),
  body('client_type')
    .optional()
    .isIn(['individual', 'corporate'])
    .withMessage('Client type must be individual or corporate'),
  handleValidationErrors
];

const updateClientValidation = [
  param('id')
    .isInt()
    .withMessage('Valid client ID is required'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  handleValidationErrors
];

// Matter validations
const createMatterValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Matter title is required'),
  body('client_id')
    .isInt()
    .withMessage('Valid client ID is required'),
  body('practice_area')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['open', 'closed', 'pending', 'on_hold'])
    .withMessage('Invalid status value'),
  handleValidationErrors
];

// Invoice validations
const createInvoiceValidation = [
  body('client_id')
    .isInt()
    .withMessage('Valid client ID is required'),
  body('matter_id')
    .optional()
    .isInt()
    .withMessage('Valid matter ID is required'),
  body('issue_date')
    .optional()
    .isISO8601()
    .withMessage('Valid issue date is required'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required'),
  handleValidationErrors
];

// Time entry validations
const createTimeEntryValidation = [
  body('matter_id')
    .isInt()
    .withMessage('Valid matter ID is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('duration_minutes')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Valid date is required'),
  body('hourly_rate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  handleValidationErrors
];

// Task validations
const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required'),
  body('matter_id')
    .optional()
    .isInt()
    .withMessage('Valid matter ID is required'),
  body('assigned_to')
    .optional()
    .isInt()
    .withMessage('Valid user ID is required'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority value'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid status value'),
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required'),
  handleValidationErrors
];

// Document validations
const createDocumentValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Document title is required'),
  body('matter_id')
    .optional()
    .isInt()
    .withMessage('Valid matter ID is required'),
  body('client_id')
    .optional()
    .isInt()
    .withMessage('Valid client ID is required'),
  body('file_path')
    .trim()
    .notEmpty()
    .withMessage('File path is required'),
  handleValidationErrors
];

// Communication validations
const createCommunicationValidation = [
  body('type')
    .isIn(['email', 'phone', 'meeting', 'letter', 'other'])
    .withMessage('Invalid communication type'),
  body('client_id')
    .optional()
    .isInt()
    .withMessage('Valid client ID is required'),
  body('matter_id')
    .optional()
    .isInt()
    .withMessage('Valid matter ID is required'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  handleValidationErrors
];

// Calendar event validations
const createCalendarEventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required'),
  body('start_time')
    .isISO8601()
    .withMessage('Valid start time is required'),
  body('end_time')
    .isISO8601()
    .withMessage('Valid end time is required'),
  body('matter_id')
    .optional()
    .isInt()
    .withMessage('Valid matter ID is required'),
  handleValidationErrors
];

// Conflict check validation
const conflictCheckValidation = [
  body('search_name')
    .trim()
    .notEmpty()
    .withMessage('Search name is required'),
  handleValidationErrors
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  loginValidation,
  registerValidation,
  createClientValidation,
  updateClientValidation,
  createMatterValidation,
  createInvoiceValidation,
  createTimeEntryValidation,
  createTaskValidation,
  createDocumentValidation,
  createCommunicationValidation,
  createCalendarEventValidation,
  conflictCheckValidation,
  paginationValidation
};
