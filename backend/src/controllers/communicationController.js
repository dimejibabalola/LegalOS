const db = require('../config/database');

const getAllCommunications = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const clientId = req.query.client;
    const matterId = req.query.matter;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (type) {
      whereClause += ` AND c.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (clientId) {
      whereClause += ` AND c.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }

    if (matterId) {
      whereClause += ` AND c.matter_id = $${paramIndex}`;
      params.push(matterId);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM communications c ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT c.*, 
              m.title as matter_title,
              cl.first_name || ' ' || cl.last_name as client_name,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM communications c
       LEFT JOIN matters m ON c.matter_id = m.id
       LEFT JOIN clients cl ON c.client_id = cl.id
       LEFT JOIN users u ON c.created_by = u.id
       ${whereClause}
       ORDER BY c.created_at DESC
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

const createCommunication = async (req, res, next) => {
  try {
    const {
      type,
      client_id,
      matter_id,
      contact_name,
      contact_email,
      contact_phone,
      subject,
      content,
      communication_date = new Date(),
      direction = 'outgoing',
      follow_up_date,
      is_confidential = false
    } = req.body;

    const result = await db.query(
      `INSERT INTO communications (type, client_id, matter_id, contact_name, contact_email,
                                 contact_phone, subject, content, communication_date, direction,
                                 follow_up_date, is_confidential, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [type, client_id, matter_id, contact_name, contact_email, contact_phone,
       subject, content, communication_date, direction, follow_up_date, is_confidential, req.user.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'communication', result.rows[0].id, `Logged ${type} communication: ${subject}`]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Communication logged successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getCommunicationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT c.*, 
              m.title as matter_title,
              cl.first_name || ' ' || cl.last_name as client_name,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM communications c
       LEFT JOIN matters m ON c.matter_id = m.id
       LEFT JOIN clients cl ON c.client_id = cl.id
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
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

const updateCommunication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['type', 'contact_name', 'contact_email', 'contact_phone', 
                           'subject', 'content', 'communication_date', 'direction', 
                           'follow_up_date', 'is_confidential'];
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
      `UPDATE communications SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'communication', id, `Updated communication: ${result.rows[0].subject}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Communication updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteCommunication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM communications WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Communication not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'communication', id, `Deleted communication: ${result.rows[0].subject}`]
    );

    res.json({
      success: true,
      message: 'Communication deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCommunications,
  createCommunication,
  getCommunicationById,
  updateCommunication,
  deleteCommunication
};
