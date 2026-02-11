import db from '../config/database.js';

const getAllMatters = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const practiceArea = req.query.practice_area;
    const status = req.query.status;
    const clientId = req.query.client;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (practiceArea) {
      whereClause += ` AND m.practice_area = $${paramIndex}`;
      params.push(practiceArea);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND m.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (clientId) {
      whereClause += ` AND m.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }

    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM matters m ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get matters with client info
    const result = await db.query(
      `SELECT m.*, 
              c.first_name || ' ' || c.last_name as client_name,
              c.company_name as client_company,
              u.first_name || ' ' || u.last_name as responsible_attorney_name
       FROM matters m
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON m.responsible_attorney_id = u.id
       ${whereClause}
       ORDER BY m.created_at DESC
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

const createMatter = async (req, res, next) => {
  try {
    const {
      title,
      description,
      client_id,
      practice_area,
      status = 'open',
      responsible_attorney_id,
      open_date,
      close_date,
      contingency_fee,
      flat_fee,
      referral_source,
      notes
    } = req.body;

    const result = await db.query(
      `INSERT INTO matters (title, description, client_id, practice_area, status,
                           responsible_attorney_id, open_date, close_date, contingency_fee,
                           flat_fee, referral_source, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [title, description, client_id, practice_area, status, responsible_attorney_id,
       open_date, close_date, contingency_fee, flat_fee, referral_source, notes, req.user.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'matter', result.rows[0].id, `Created matter: ${title}`]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Matter created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMatterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT m.*, 
              c.first_name || ' ' || c.last_name as client_name,
              c.email as client_email,
              c.phone as client_phone,
              u.first_name || ' ' || u.last_name as responsible_attorney_name
       FROM matters m
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON m.responsible_attorney_id = u.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Matter not found'
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

const updateMatter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'description', 'practice_area', 'status',
                           'responsible_attorney_id', 'open_date', 'close_date',
                           'contingency_fee', 'flat_fee', 'referral_source', 'notes'];
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
      `UPDATE matters SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Matter not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'matter', id, `Updated matter: ${result.rows[0].title}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Matter updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteMatter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM matters WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Matter not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'matter', id, `Deleted matter: ${result.rows[0].title}`]
    );

    res.json({
      success: true,
      message: 'Matter deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getMatterTimeEntries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name as user_name
       FROM time_entries t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.matter_id = $1
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM time_entries WHERE matter_id = $1',
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

const getMatterDocuments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT d.*, u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.matter_id = $1
       ORDER BY d.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM documents WHERE matter_id = $1',
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

const getMatterTasks = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.matter_id = $1
       ORDER BY t.due_date ASC, t.priority DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM tasks WHERE matter_id = $1',
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

const getMatterCommunications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await db.query(
      `SELECT c.*, u.first_name || ' ' || u.last_name as created_by_name
       FROM communications c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.matter_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await db.query(
      'SELECT COUNT(*) FROM communications WHERE matter_id = $1',
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

export default {
  getAllMatters,
  createMatter,
  getMatterById,
  updateMatter,
  deleteMatter,
  getMatterTimeEntries,
  getMatterDocuments,
  getMatterTasks,
  getMatterCommunications
};
