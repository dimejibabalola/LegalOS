const db = require('../config/database');

const getAllActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const userId = req.query.user;
    const entityType = req.query.entity_type;
    const action = req.query.action;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (userId) {
      whereClause += ` AND a.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (entityType) {
      whereClause += ` AND a.entity_type = $${paramIndex}`;
      params.push(entityType);
      paramIndex++;
    }

    if (action) {
      whereClause += ` AND a.action = $${paramIndex}`;
      params.push(action);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM activities a ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT a.*, 
              u.first_name || ' ' || u.last_name as user_name
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.created_at DESC
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

const logActivity = async (req, res, next) => {
  try {
    const {
      action,
      entity_type,
      entity_id,
      description,
      metadata
    } = req.body;

    const result = await db.query(
      `INSERT INTO activities (user_id, action, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, action, entity_type, entity_id, description, metadata ? JSON.stringify(metadata) : null]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Activity logged successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const result = await db.query(
      `SELECT a.*, 
              u.first_name || ' ' || u.last_name as user_name
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllActivities,
  logActivity,
  getRecentActivities
};
