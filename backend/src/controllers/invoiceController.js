const db = require('../config/database');

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const result = await db.query(
    "SELECT COUNT(*) FROM invoices WHERE invoice_number LIKE $1",
    [`INV-${year}-%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `INV-${year}-${String(count).padStart(5, '0')}`;
};

const getAllInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const clientId = req.query.client;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND i.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (clientId) {
      whereClause += ` AND i.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM invoices i ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT i.*, 
              c.first_name || ' ' || c.last_name as client_name,
              m.title as matter_title
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       LEFT JOIN matters m ON i.matter_id = m.id
       ${whereClause}
       ORDER BY i.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createInvoice = async (req, res, next) => {
  try {
    const {
      client_id,
      matter_id,
      issue_date = new Date(),
      due_date,
      line_items,
      notes,
      terms
    } = req.body;

    const invoiceNumber = await generateInvoiceNumber();

    // Calculate total amount from line items
    let totalAmount = 0;
    if (line_items && Array.isArray(line_items)) {
      totalAmount = line_items.reduce((sum, item) => {
        return sum + (parseFloat(item.quantity) * parseFloat(item.rate));
      }, 0);
    }

    const client = await db.query('BEGIN');

    try {
      // Create invoice
      const invoiceResult = await db.query(
        `INSERT INTO invoices (invoice_number, client_id, matter_id, issue_date, due_date,
                              total_amount, status, notes, terms, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [invoiceNumber, client_id, matter_id, issue_date, due_date,
         totalAmount, 'draft', notes, terms, req.user.id]
      );

      const invoice = invoiceResult.rows[0];

      // Create line items
      if (line_items && Array.isArray(line_items)) {
        for (const item of line_items) {
          await db.query(
            `INSERT INTO invoice_line_items (invoice_id, description, quantity, rate, amount)
             VALUES ($1, $2, $3, $4, $5)`,
            [invoice.id, item.description, item.quantity, item.rate, 
             item.quantity * item.rate]
          );
        }
      }

      await db.query('COMMIT');

      // Log activity
      await db.query(
        'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
        [req.user.id, 'create', 'invoice', invoice.id, `Created invoice: ${invoiceNumber}`]
      );

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      });
    } catch (err) {
      await db.query('ROLLBACK');
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoiceResult = await db.query(
      `SELECT i.*, 
              c.first_name || ' ' || c.last_name as client_name,
              c.email as client_email,
              c.address as client_address,
              m.title as matter_title
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       LEFT JOIN matters m ON i.matter_id = m.id
       WHERE i.id = $1`,
      [id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Get line items
    const lineItemsResult = await db.query(
      `SELECT * FROM invoice_line_items WHERE invoice_id = $1 ORDER BY id`,
      [id]
    );

    const invoice = invoiceResult.rows[0];
    invoice.line_items = lineItemsResult.rows;

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
};

const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Cannot update paid or cancelled invoices
    const existingInvoice = await db.query(
      'SELECT status FROM invoices WHERE id = $1',
      [id]
    );

    if (existingInvoice.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (['paid', 'cancelled'].includes(existingInvoice.rows[0].status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update paid or cancelled invoices'
      });
    }

    const allowedFields = ['due_date', 'notes', 'terms'];
    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    values.push(id);

    const result = await db.query(
      `UPDATE invoices SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'invoice', id, `Updated invoice: ${result.rows[0].invoice_number}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingInvoice = await db.query(
      'SELECT status, invoice_number FROM invoices WHERE id = $1',
      [id]
    );

    if (existingInvoice.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (existingInvoice.rows[0].status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid invoices'
      });
    }

    await db.query('DELETE FROM invoice_line_items WHERE invoice_id = $1', [id]);
    await db.query('DELETE FROM invoices WHERE id = $1', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'invoice', id, `Deleted invoice: ${existingInvoice.rows[0].invoice_number}`]
    );

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const sendInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `UPDATE invoices SET status = 'sent', sent_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND status = 'draft' RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice not found or not in draft status'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'send', 'invoice', id, `Sent invoice: ${result.rows[0].invoice_number}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Invoice marked as sent'
    });
  } catch (error) {
    next(error);
  }
};

const payInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_date = new Date() } = req.body;

    const result = await db.query(
      `UPDATE invoices SET status = 'paid', paid_date = $1, payment_method = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 AND status IN ('sent', 'overdue') RETURNING *`,
      [payment_date, payment_method, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invoice not found or not in sent/overdue status'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'pay', 'invoice', id, `Paid invoice: ${result.rows[0].invoice_number}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Invoice marked as paid'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  sendInvoice,
  payInvoice
};
