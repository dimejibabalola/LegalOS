import db from '../config/database.js';

const getAllEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;
    const matterId = req.query.matter;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      whereClause += ` AND e.start_time >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND e.end_time <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (matterId) {
      whereClause += ` AND e.matter_id = $${paramIndex}`;
      params.push(matterId);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM calendar_events e ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT e.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM calendar_events e
       LEFT JOIN matters m ON e.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON e.created_by = u.id
       ${whereClause}
       ORDER BY e.start_time ASC
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

const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      location,
      matter_id,
      attendees,
      event_type = 'meeting',
      is_all_day = false,
      reminder_minutes = 15,
      recurrence_rule
    } = req.body;

    const result = await db.query(
      `INSERT INTO calendar_events (title, description, start_time, end_time, location,
                                  matter_id, attendees, event_type, is_all_day,
                                  reminder_minutes, recurrence_rule, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [title, description, start_time, end_time, location, matter_id, 
       attendees, event_type, is_all_day, reminder_minutes, recurrence_rule, req.user.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'create', 'calendar_event', result.rows[0].id, `Created event: ${title}`]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Event created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT e.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as created_by_name
       FROM calendar_events e
       LEFT JOIN matters m ON e.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
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

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const allowedFields = ['title', 'description', 'start_time', 'end_time', 'location',
                           'attendees', 'event_type', 'is_all_day', 'reminder_minutes', 'recurrence_rule'];
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
      `UPDATE calendar_events SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update', 'calendar_event', id, `Updated event: ${result.rows[0].title}`]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Event updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM calendar_events WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'calendar_event', id, `Deleted event: ${result.rows[0].title}`]
    );

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getTodayEvents = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const result = await db.query(
      `SELECT e.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name
       FROM calendar_events e
       LEFT JOIN matters m ON e.matter_id = m.id
       LEFT JOIN clients c ON m.client_id = c.id
       WHERE e.start_time >= $1 AND e.start_time < $2
       ORDER BY e.start_time ASC`,
      [startOfDay.toISOString(), endOfDay.toISOString()]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  getTodayEvents
};
