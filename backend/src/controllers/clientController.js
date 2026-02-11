const db = require('../config/database');

const getAllClients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const clientType = req.query.client_type;
    const status = req.query.status;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (clientType) {
      whereClause += ` AND client_type = $${paramIndex}`;
      params.push(clientType);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM clients ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get clients
    const result = await db.query(
      `SELECT id, first_name, last_name, email, phone, address, city, state, zip,
              company_name, client_type, status, notes, created_at, updated_at
       FROM clients ${whereClause}
       ORDER BY created_at DESC
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

const createClient = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      state,
      zip,
      company_name,
      client_type = 'individual',
      status = 'active',
      notes
    } = req.body;

    const result = await db.query(
      `INSERT INTO clients (first_name, last_name, email, phone, address, city, state, zip,
                           company_name, client_type, status, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [first_name, last_name, email, phone, address, city, state, zip,
       company_name, client_type, status, notes, req.user.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'client', result.rows[0].id, `Created client: ${first_name} ${last_name}`]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Client created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, first_name, last_name, email, phone, address, city, state, zip,
              company_name, client_type, status, notes, created_at, updated_at
       FROM clients WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const allowedFields = ['first_name', 'last_name', 'email', 'phone', 'address', 
                           'city', 'state', 'zip', 'company_name', 'client_type', 'status', 'notes'];
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
      `UPDATE clients SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'client', id, `Updated client: ${result.rows[0].first_name} ${result.rows[0].last_name}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Client updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if client has matters
    const mattersCheck = await db.query(
      'SELECT COUNT(*) FROM matters WHERE client_id = $1',
      [id]
    );

    if (parseInt(mattersCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete client with existing matters'
      });
    }

    const result = await db.query(
      'DELETE FROM clients WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'client', id, `Deleted client: ${result.rows[0].first_name} ${result.rows[0].last_name}`]
    );

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getClientMatters = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT m.*, u.first_name || ' ' || u.last_name as responsible_attorney_name
       FROM matters m
       LEFT JOIN users u ON m.responsible_attorney_id = u.id
       WHERE m.client_id = $1
       ORDER BY m.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM matters WHERE client_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        totalCount: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getClientBilling = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get total billed amount
    const billedResult = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_billed
       FROM invoices WHERE client_id = $1 AND status != 'draft'`,
      [id]
    );

    // Get total paid amount
    const paidResult = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_paid
       FROM invoices WHERE client_id = $1 AND status = 'paid'`,
      [id]
    );

    // Get outstanding amount
    const outstandingResult = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_outstanding
       FROM invoices WHERE client_id = $1 AND status IN ('sent', 'overdue')`,
      [id]
    );

    // Get recent invoices
    const invoicesResult = await db.query(
      `SELECT id, invoice_number, issue_date, due_date, total_amount, status
       FROM invoices WHERE client_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        total_billed: parseFloat(billedResult.rows[0].total_billed),
        total_paid: parseFloat(paidResult.rows[0].total_paid),
        total_outstanding: parseFloat(outstandingResult.rows[0].total_outstanding),
        recent_invoices: invoicesResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
  getClientMatters,
  getClientBilling
};
