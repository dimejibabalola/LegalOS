/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
};

/**
 * Format duration in minutes to hours and minutes
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Convert minutes to decimal hours
 * @param {number} minutes - Duration in minutes
 * @returns {number} Decimal hours
 */
const minutesToDecimalHours = (minutes) => {
  return Math.round((minutes / 60) * 100) / 100;
};

/**
 * Generate a unique reference number
 * @param {string} prefix - Prefix for the reference number
 * @param {number} length - Length of the random part
 * @returns {string} Generated reference number
 */
const generateReference = (prefix = 'REF', length = 8) => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 2 + length).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

/**
 * Sanitize string for SQL queries (basic sanitization)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return str
    .replace(/[\0\x08\x09\x1a\n\r"'\\]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char;
        default: return char;
      }
    });
};

/**
 * Paginate array
 * @param {Array} items - Array to paginate
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Paginated result
 */
const paginateArray = (items, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      totalCount: items.length,
      totalPages: Math.ceil(items.length / limit)
    }
  };
};

/**
 * Calculate date difference in days
 * @param {Date|string} date1 - First date
 * @param {Date|string} date2 - Second date
 * @returns {number} Difference in days
 */
const daysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is overdue
 * @param {Date|string} dueDate - Due date
 * @returns {boolean} True if overdue
 */
const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date();
};

/**
 * Get start and end of day
 * @param {Date|string} date - Date
 * @returns {object} Object with start and end of day
 */
const getDayBounds = (date = new Date()) => {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0);
  return { start, end };
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Generate slug from string
 * @param {string} text - Text to convert
 * @returns {string} Slug
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Parse CSV line
 * @param {string} line - CSV line
 * @returns {Array} Parsed values
 */
const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

module.exports = {
  formatCurrency,
  formatDate,
  formatDuration,
  minutesToDecimalHours,
  generateReference,
  sanitizeString,
  paginateArray,
  daysDifference,
  isOverdue,
  getDayBounds,
  truncateText,
  generateSlug,
  parseCSVLine
};
