const db = require('../config/database');

const getAllTimeEntries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const matterId = req.query.matter;
    const userId = req.query.user;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    const billable = req.query.billable;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (matterId) {
      whereClause += ` AND t.matter_id = $${paramIndex}`;
      params.push(matterId);
      paramIndex++;
    }

    if (userId) {
      whereClause += ` AND t.user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (startDate) {
      whereClause += ` AND t.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND t.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (billable !== undefined) {
      whereClause += ` AND t.is_billable = $${paramIndex}`;
      params.push(billable === 'true');
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM time_entries t ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT t.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as user_name
       FROM time_entries t
       LEFT JOIN matters m ON t.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON t.user_id = u.id
       ${whereClause}
       ORDER BY t.date DESC, t.created_at DESC
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

const createTimeEntry = async (req, res, next) => {
  try {
    const {
      matter_id,
      description,
      duration_minutes,
      date = new Date(),
      hourly_rate,
      is_billable = true
    } = req.body;

    // Get user's default hourly rate if not provided
    let rate = hourly_rate;
    if (!rate) {
      const userResult = await db.query(
        'SELECT hourly_rate FROM users WHERE id = $1',
        [req.user.id]
      );
      rate = userResult.rows[0]?.hourly_rate || 0;
    }

    const totalValue = (duration_minutes / 60) * rate;

    const result = await db.query(
      `INSERT INTO time_entries (matter_id, user_id, description, duration_minutes, date,
                                hourly_rate, total_value, is_billable, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [matter_id, req.user.id, description, duration_minutes, date, rate, totalValue, is_billable, req.user.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'time_entry', result.rows[0].id, `Created time entry: ${duration_minutes} minutes`]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Time entry created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getTimeEntryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT t.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as user_name
       FROM time_entries t
       LEFT JOIN matters m ON t.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
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

const updateTimeEntry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if time entry exists and belongs to user (or user is admin)
    const existingEntry = await db.query(
      'SELECT user_id FROM time_entries WHERE id = $1',
      [id]
    );

    if (existingEntry.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }

    // Only allow updating own entries unless admin
    if (existingEntry.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Can only update your own time entries'
      });
    }

    const allowedFields = ['description', 'duration_minutes', 'date', 'hourly_rate', 'is_billable'];
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

    // Recalculate total_value if duration or rate changed
    if (updates.duration_minutes || updates.hourly_rate) {
      const currentEntry = await db.query(
        'SELECT duration_minutes, hourly_rate FROM time_entries WHERE id = $1',
        [id]
      );
      const duration = updates.duration_minutes || currentEntry.rows[0].duration_minutes;
      const rate = updates.hourly_rate || currentEntry.rows[0].hourly_rate;
      const totalValue = (duration / 60) * rate;
      setClauses.push(`total_value = $${paramIndex}`);
      values.push(totalValue);
      paramIndex++;
    }

    values.push(id);

    const result = await db.query(
      `UPDATE time_entries SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'time_entry', id, 'Updated time entry']
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Time entry updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteTimeEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if time entry exists and belongs to user (or user is admin)
    const existingEntry = await db.query(
      'SELECT user_id FROM time_entries WHERE id = $1',
      [id]
    );

    if (existingEntry.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Time entry not found'
      });
    }

    if (existingEntry.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Can only delete your own time entries'
      });
    }

    await db.query('DELETE FROM time_entries WHERE id = $1', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'time_entry', id, 'Deleted time entry']
    );

    res.json({
      success: true,
      message: 'Time entry deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getTimeEntrySummary = async (req, res, next) => {
  try {
    const userId = req.query.user || req.user.id;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    let dateFilter = '';
    const params = [userId];
    let paramIndex = 2;

    if (startDate) {
      dateFilter += ` AND date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      dateFilter += ` AND date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Total hours
    const totalResult = await db.query(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes
       FROM time_entries WHERE user_id = $1${dateFilter}`,
      params
    );

    // Billable hours
    const billableResult = await db.query(
      `SELECT COALESCE(SUM(duration_minutes), 0) as billable_minutes,
              COALESCE(SUM(total_value), 0) as billable_value
       FROM time_entries WHERE user_id = $1 AND is_billable = true${dateFilter}`,
      params
    );

    // Non-billable hours
    const nonBillableResult = await db.query(
      `SELECT COALESCE(SUM(duration_minutes), 0) as non_billable_minutes
       FROM time_entries WHERE user_id = $1 AND is_billable = false${dateFilter}`,
      params
    );

    // By matter
    const byMatterResult = await db.query(
      `SELECT m.title as matter_title, 
              COALESCE(SUM(t.duration_minutes), 0) as total_minutes,
              COALESCE(SUM(t.total_value), 0) as total_value
       FROM time_entries t
       LEFT JOIN matters m ON t.matter_id = m.id
       WHERE t.user_id = $1${dateFilter}
       GROUP BY m.title
       ORDER BY total_minutes DESC`,
      params
    );

    res.json({
      success: true,
      data: {
        total_hours: Math.round(totalResult.rows[0].total_minutes / 60 * 100) / 100,
        billable_hours: Math.round(billableResult.rows[0].billable_minutes / 60 * 100) / 100,
        billable_value: parseFloat(billableResult.rows[0].billable_value),
        non_billable_hours: Math.round(nonBillableResult.rows[0].non_billable_minutes / 60 * 100) / 100,
        utilization_rate: totalResult.rows[0].total_minutes > 0 
          ? Math.round((billableResult.rows[0].billable_minutes / totalResult.rows[0].total_minutes) * 100 * 100) / 100
          : 0,
        by_matter: byMatterResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTimeEntries,
  createTimeEntry,
  getTimeEntryById,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeEntrySummary
};
