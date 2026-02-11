import db from '../config/database.js';

const checkConflicts = async (req, res, next) => {
  try {
    const { search_name } = req.body;
    const searchTerm = `%${search_name}%`;

    // Search in clients
    const clientsResult = await db.query(
      `SELECT id, first_name, last_name, email, company_name, 'client' as entity_type
       FROM clients 
       WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1 OR company_name ILIKE $1`,
      [searchTerm]
    );

    // Search in adverse parties (if table exists)
    let adversePartiesResult = { rows: [] };
    try {
      adversePartiesResult = await db.query(
        `SELECT id, name, email, 'adverse_party' as entity_type
         FROM adverse_parties 
         WHERE name ILIKE $1 OR email ILIKE $1`,
        [searchTerm]
      );
    } catch (e) {
      // Table may not exist
    }

    // Search in related parties/contacts
    let contactsResult = { rows: [] };
    try {
      contactsResult = await db.query(
        `SELECT id, name, email, relationship_type, 'contact' as entity_type
         FROM contacts 
         WHERE name ILIKE $1 OR email ILIKE $1`,
        [searchTerm]
      );
    } catch (e) {
      // Table may not exist
    }

    // Combine all results
    const allMatches = [
      ...clientsResult.rows,
      ...adversePartiesResult.rows,
      ...contactsResult.rows
    ];

    const hasConflict = allMatches.length > 0;

    // Log the conflict check
    await db.query(
      `INSERT INTO conflict_checks (search_name, checked_by, has_conflict, results, checked_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [search_name, req.user.id, hasConflict, JSON.stringify(allMatches)]
    );

    res.json({
      success: true,
      data: {
        search_name,
        has_conflict: hasConflict,
        matches: allMatches,
        match_count: allMatches.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const getConflictHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const countResult = await db.query('SELECT COUNT(*) FROM conflict_checks');
    const totalCount = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT cc.*, 
              u.first_name || ' ' || u.last_name as checked_by_name
       FROM conflict_checks cc
       LEFT JOIN users u ON cc.checked_by = u.id
       ORDER BY cc.checked_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
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

const logConflictCheck = async (req, res, next) => {
  try {
    const { search_name, has_conflict, results, notes } = req.body;

    const result = await db.query(
      `INSERT INTO conflict_checks (search_name, checked_by, has_conflict, results, notes, checked_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [search_name, req.user.id, has_conflict, JSON.stringify(results), notes]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Conflict check logged successfully'
    });
  } catch (error) {
    next(error);
  }
};

export default {
  checkConflicts,
  getConflictHistory,
  logConflictCheck
};
