const db = require('../config/database');

const getAllTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const priority = req.query.priority;
    const assignedTo = req.query.assigned_to;
    const matterId = req.query.matter;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      whereClause += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (assignedTo) {
      whereClause += ` AND t.assigned_to = $${paramIndex}`;
      params.push(assignedTo);
      paramIndex++;
    }

    if (matterId) {
      whereClause += ` AND t.matter_id = $${paramIndex}`;
      params.push(matterId);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM tasks t ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT t.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as assigned_to_name,
              creator.first_name || ' ' || creator.last_name as created_by_name
       FROM tasks t
       LEFT JOIN matters m ON t.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN users creator ON t.created_by = creator.id
       ${whereClause}
       ORDER BY 
         CASE t.priority 
           WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'medium' THEN 3 
           WHEN 'low' THEN 4 
         END,
         t.due_date ASC NULLS LAST,
         t.created_at DESC
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

const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      matter_id,
      assigned_to,
      priority = 'medium',
      status = 'pending',
      due_date,
      reminder_date
    } = req.body;

    const result = await db.query(
      `INSERT INTO tasks (title, description, matter_id, assigned_to, priority, status,
                         due_date, reminder_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, matter_id, assigned_to, priority, status, due_date, reminder_date, req.user.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'task', result.rows[0].id, `Created task: ${title}`]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Task created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT t.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tasks t
       LEFT JOIN matters m ON t.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
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

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'description', 'assigned_to', 'priority', 'status', 'due_date', 'reminder_date'];
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
      `UPDATE tasks SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'task', id, `Updated task: ${result.rows[0].title}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Task updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'task', id, `Deleted task: ${result.rows[0].title}`]
    );

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getTodayTasks = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const result = await db.query(
      `SELECT t.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as assigned_to_name
       FROM tasks t
       LEFT JOIN matters m ON t.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE (t.assigned_to = $1 OR t.created_by = $1)
         AND t.status != 'completed'
         AND (t.due_date <= $2 OR t.due_date IS NULL)
       ORDER BY 
         CASE t.priority 
           WHEN 'urgent' THEN 1 
           WHEN 'high' THEN 2 
           WHEN 'medium' THEN 3 
           WHEN 'low' THEN 4 
         END,
         t.due_date ASC`,
      [req.user.id, today]
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
  getAllTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  getTodayTasks
};
