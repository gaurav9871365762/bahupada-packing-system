const { pool } = require('../config/database');

class PackingHistory {
  static async create(historyData) {
    const {
      task_id,
      challan_id,
      packer_id,
      supervisor_id,
      status,
      total_items,
      completed_items,
      completion_date,
      approved_by,
      rejection_reason
    } = historyData;

    const [result] = await pool.execute(
      `INSERT INTO packing_history 
       (task_id, challan_id, packer_id, supervisor_id, status, 
        total_items, completed_items, completion_date, approved_by, rejection_reason) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task_id, challan_id, packer_id, supervisor_id, status,
        total_items, completed_items, completion_date, approved_by, rejection_reason
      ]
    );
    return result.insertId;
  }

  static async getCompletedTasks(packerId = null, limit = 10) {
    let query = `
      SELECT ph.*, 
             p.name as packer_name, 
             s.name as supervisor_name,
             a.name as approved_by_name,
             DATE_FORMAT(ph.approval_date, '%Y-%m-%d, %h:%i:%s %p') as formatted_approval_date
      FROM packing_history ph
      JOIN users p ON ph.packer_id = p.id
      LEFT JOIN users s ON ph.supervisor_id = s.id
      LEFT JOIN users a ON ph.approved_by = a.id
      WHERE ph.status = 'approved'
    `;
    
    const params = [];
    
    if (packerId) {
      query += ' AND ph.packer_id = ?';
      params.push(packerId);
    }
    
    query += ' ORDER BY ph.completion_date DESC LIMIT ?';
    params.push(limit);
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getAllHistory(packerId = null, startDate = null, endDate = null) {
    let query = `
      SELECT ph.*, 
             p.name as packer_name, 
             s.name as supervisor_name,
             a.name as approved_by_name
      FROM packing_history ph
      JOIN users p ON ph.packer_id = p.id
      LEFT JOIN users s ON ph.supervisor_id = s.id
      LEFT JOIN users a ON ph.approved_by = a.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (packerId) {
      query += ' AND ph.packer_id = ?';
      params.push(packerId);
    }
    
    if (startDate) {
      query += ' AND ph.completion_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND ph.completion_date <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY ph.completion_date DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getStats(packerId = null) {
    let query = `
      SELECT 
        COUNT(*) as total_completed,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
        AVG(completed_items) as avg_items_per_task
      FROM packing_history
      WHERE 1=1
    `;
    
    const params = [];
    
    if (packerId) {
      query += ' AND packer_id = ?';
      params.push(packerId);
    }
    
    const [stats] = await pool.execute(query, params);
    return stats[0];
  }
}

module.exports = PackingHistory;