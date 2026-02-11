const db = require('../config/database');

const getRevenueReport = async (req, res, next) => {
  try {
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      dateFilter += ` AND i.issue_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      dateFilter += ` AND i.issue_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Revenue by practice area
    const byPracticeAreaResult = await db.query(
      `SELECT m.practice_area, 
              COUNT(DISTINCT i.id) as invoice_count,
              COALESCE(SUM(i.total_amount), 0) as total_revenue,
              COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as collected_revenue
       FROM invoices i
       JOIN matters m ON i.matter_id = m.id
       WHERE i.status != 'draft' AND i.status != 'cancelled'${dateFilter}
       GROUP BY m.practice_area
       ORDER BY total_revenue DESC`,
      params
    );

    // Revenue by client
    const byClientResult = await db.query(
      `SELECT c.id, 
              c.first_name || ' ' || c.last_name as client_name,
              c.company_name,
              COUNT(DISTINCT i.id) as invoice_count,
              COALESCE(SUM(i.total_amount), 0) as total_revenue,
              COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as collected_revenue
       FROM invoices i
       JOIN clients c ON i.client_id = c.id
       WHERE i.status != 'draft' AND i.status != 'cancelled'${dateFilter}
       GROUP BY c.id, c.first_name, c.last_name, c.company_name
       ORDER BY total_revenue DESC
       LIMIT 20`,
      params
    );

    // Total summary
    const summaryResult = await db.query(
      `SELECT 
        COUNT(DISTINCT i.id) as total_invoices,
        COALESCE(SUM(i.total_amount), 0) as total_billed,
        COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as total_collected,
        COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') THEN i.total_amount ELSE 0 END), 0) as total_outstanding
       FROM invoices i
       WHERE i.status != 'draft' AND i.status != 'cancelled'${dateFilter}`,
      params
    );

    res.json({
      success: true,
      data: {
        summary: summaryResult.rows[0],
        by_practice_area: byPracticeAreaResult.rows,
        by_client: byClientResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUtilizationReport = async (req, res, next) => {
  try {
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    let dateFilter = '';
    const params = [];
    let paramIndex = 1;

    if (startDate) {
      dateFilter += ` AND t.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      dateFilter += ` AND t.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    // Billable hours by user
    const byUserResult = await db.query(
      `SELECT u.id, 
              u.first_name || ' ' || u.last_name as user_name,
              u.title,
              COALESCE(SUM(t.duration_minutes), 0) as total_minutes,
              COALESCE(SUM(CASE WHEN t.is_billable THEN t.duration_minutes ELSE 0 END), 0) as billable_minutes,
              COALESCE(SUM(CASE WHEN t.is_billable THEN t.total_value ELSE 0 END), 0) as billable_value,
              COUNT(DISTINCT t.matter_id) as matters_worked
       FROM users u
       LEFT JOIN time_entries t ON u.id = t.user_id${dateFilter.replace(/t\./g, 't.')}
       WHERE u.is_active = true AND u.role IN ('attorney', 'paralegal', 'partner')
       GROUP BY u.id, u.first_name, u.last_name, u.title
       ORDER BY billable_minutes DESC`,
      params
    );

    // Format the results
    const formattedResults = byUserResult.rows.map(row => ({
      ...row,
      total_hours: Math.round(row.total_minutes / 60 * 100) / 100,
      billable_hours: Math.round(row.billable_minutes / 60 * 100) / 100,
      utilization_rate: row.total_minutes > 0 
        ? Math.round((row.billable_minutes / row.total_minutes) * 100 * 100) / 100 
        : 0
    }));

    // Summary
    const summaryResult = await db.query(
      `SELECT 
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0) as billable_minutes,
        COALESCE(SUM(CASE WHEN is_billable THEN total_value ELSE 0 END), 0) as billable_value
       FROM time_entries
       WHERE 1=1${dateFilter.replace(/t\./g, '')}`,
      params
    );

    const summary = summaryResult.rows[0];

    res.json({
      success: true,
      data: {
        summary: {
          total_hours: Math.round(summary.total_minutes / 60 * 100) / 100,
          billable_hours: Math.round(summary.billable_minutes / 60 * 100) / 100,
          billable_value: parseFloat(summary.billable_value),
          overall_utilization: summary.total_minutes > 0 
            ? Math.round((summary.billable_minutes / summary.total_minutes) * 100 * 100) / 100 
            : 0
        },
        by_user: formattedResults
      }
    });
  } catch (error) {
    next(error);
  }
};

const getAgingReport = async (req, res, next) => {
  try {
    const asOfDate = req.query.as_of_date || new Date().toISOString().split('T')[0];

    // Aging buckets
    const agingResult = await db.query(
      `SELECT 
        c.id,
        c.first_name || ' ' || c.last_name as client_name,
        c.company_name,
        c.email,
        COUNT(i.id) as invoice_count,
        COALESCE(SUM(i.total_amount), 0) as total_outstanding,
        COALESCE(SUM(CASE 
          WHEN i.due_date >= $1 - INTERVAL '30 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as current_0_30,
        COALESCE(SUM(CASE 
          WHEN i.due_date < $1 - INTERVAL '30 days' AND i.due_date >= $1 - INTERVAL '60 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as overdue_31_60,
        COALESCE(SUM(CASE 
          WHEN i.due_date < $1 - INTERVAL '60 days' AND i.due_date >= $1 - INTERVAL '90 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as overdue_61_90,
        COALESCE(SUM(CASE 
          WHEN i.due_date < $1 - INTERVAL '90 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as overdue_90_plus
       FROM clients c
       JOIN invoices i ON c.id = i.client_id
       WHERE i.status IN ('sent', 'overdue')
       GROUP BY c.id, c.first_name, c.last_name, c.company_name, c.email
       HAVING SUM(i.total_amount) > 0
       ORDER BY total_outstanding DESC`,
      [asOfDate]
    );

    // Summary
    const summaryResult = await db.query(
      `SELECT 
        COUNT(DISTINCT i.id) as total_invoices,
        COALESCE(SUM(i.total_amount), 0) as total_outstanding,
        COALESCE(SUM(CASE 
          WHEN i.due_date >= $1 - INTERVAL '30 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as current_0_30,
        COALESCE(SUM(CASE 
          WHEN i.due_date < $1 - INTERVAL '30 days' AND i.due_date >= $1 - INTERVAL '60 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as overdue_31_60,
        COALESCE(SUM(CASE 
          WHEN i.due_date < $1 - INTERVAL '60 days' AND i.due_date >= $1 - INTERVAL '90 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as overdue_61_90,
        COALESCE(SUM(CASE 
          WHEN i.due_date < $1 - INTERVAL '90 days' THEN i.total_amount 
          ELSE 0 
        END), 0) as overdue_90_plus
       FROM invoices i
       WHERE i.status IN ('sent', 'overdue')`,
      [asOfDate]
    );

    res.json({
      success: true,
      data: {
        as_of_date: asOfDate,
        summary: summaryResult.rows[0],
        client_breakdown: agingResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRevenueReport,
  getUtilizationReport,
  getAgingReport
};
