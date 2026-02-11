const db = require('../config/database');

const getAllDocuments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const matterId = req.query.matter;
    const clientId = req.query.client;
    const category = req.query.category;

    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (matterId) {
      whereClause += ` AND d.matter_id = $${paramIndex}`;
      params.push(matterId);
      paramIndex++;
    }

    if (clientId) {
      whereClause += ` AND d.client_id = $${paramIndex}`;
      params.push(clientId);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND d.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    const countResult = await db.query(
      `SELECT COUNT(*) FROM documents d ${whereClause}`,
      params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT d.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM documents d
       LEFT JOIN matters m ON d.matter_id = m.id
       LEFT JOIN clients c ON d.client_id = c.id
       LEFT JOIN users u ON d.uploaded_by = u.id
       ${whereClause}
       ORDER BY d.created_at DESC
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

const createDocument = async (req, res, next) => {
  try {
    const {
      title,
      description,
      file_path,
      file_size,
      file_type,
      matter_id,
      client_id,
      category,
      tags,
      is_confidential = false
    } = req.body;

    const result = await db.query(
      `INSERT INTO documents (title, description, file_path, file_size, file_type,
                            matter_id, client_id, category, tags, is_confidential, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, file_path, file_size, file_type, matter_id, client_id, 
       category, tags, is_confidential, req.user.id]
    );

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'upload', 'document', result.rows[0].id, `Uploaded document: ${title}`]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT d.*, 
              m.title as matter_title,
              c.first_name || ' ' || c.last_name as client_name,
              u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM documents d
       LEFT JOIN matters m ON d.matter_id = m.id
       LEFT JOIN clients c ON d.client_id = c.id
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
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

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM documents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Log activity
    await db.query(
      'INSERT INTO activities (user_id, action, entity_type, entity_id, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete', 'document', id, `Deleted document: ${result.rows[0].title}`]
    );

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDocuments,
  createDocument,
  getDocumentById,
  deleteDocument
};
