const { pool } = require('../config/database');

class PackingTask {
  static async create(taskData) {
    const {
      task_id,
      challan_id,
      packer_id,
      total_items,
      task_date,
      due_date,
      priority,
      notes
    } = taskData;

    const [result] = await pool.execute(
      `INSERT INTO packing_tasks 
       (task_id, challan_id, packer_id, total_items, task_date, due_date, priority, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [task_id, challan_id, packer_id, total_items, task_date, due_date, priority || 'medium', notes]
    );
    return result.insertId;
  }

  static async findById(taskId) {
    const [rows] = await pool.execute(
      `SELECT pt.*, u.name as packer_name 
       FROM packing_tasks pt 
       JOIN users u ON pt.packer_id = u.id 
       WHERE pt.task_id = ?`,
      [taskId]
    );
    return rows[0];
  }

  static async getAllTasks(packerId = null, status = null) {
    let query = `
      SELECT pt.*, u.name as packer_name, 
             s.name as supervisor_name,
             CASE 
               WHEN pt.status = 'approved' THEN 'Approved'
               WHEN pt.status = 'rejected' THEN 'Rejected'
               WHEN pt.status = 'awaiting_supervisor' THEN 'Awaiting Supervisor'
               WHEN pt.status = 'pending' THEN 'Pending'
               ELSE 'In Progress'
             END as status_label
      FROM packing_tasks pt
      JOIN users u ON pt.packer_id = u.id
      LEFT JOIN users s ON pt.supervisor_id = s.id
    `;
    
    const params = [];
    
    if (packerId) {
      query += ' WHERE pt.packer_id = ?';
      params.push(packerId);
      
      if (status) {
        query += ' AND pt.status = ?';
        params.push(status);
      }
    } else if (status) {
      query += ' WHERE pt.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY pt.task_date DESC, pt.priority DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async updateProgress(taskId, completedItems) {
    const [task] = await pool.execute(
      'SELECT total_items FROM packing_tasks WHERE task_id = ?',
      [taskId]
    );
    
    if (!task[0]) throw new Error('Task not found');
    
    const progress = Math.round((completedItems / task[0].total_items) * 100);
    
    const [result] = await pool.execute(
      `UPDATE packing_tasks 
       SET completed_items = ?, progress = ?,
           status = CASE 
             WHEN ? >= total_items THEN 'awaiting_supervisor'
             ELSE 'in_progress'
           END
       WHERE task_id = ?`,
      [completedItems, progress, completedItems, taskId]
    );
    
    return result.affectedRows;
  }

  static async updateStatus(taskId, status, supervisorId = null, notes = null) {
    const [result] = await pool.execute(
      `UPDATE packing_tasks 
       SET status = ?, supervisor_id = ?, notes = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE task_id = ?`,
      [status, supervisorId, notes, taskId]
    );
    
    return result.affectedRows;
  }

  static async getDashboardStats(packerId) {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN status = 'awaiting_supervisor' THEN 1 ELSE 0 END) as awaiting_supervisor,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        AVG(progress) as average_progress
       FROM packing_tasks 
       WHERE packer_id = ?`,
      [packerId]
    );
    
    return stats[0];
  }

  static async searchTasks(searchTerm, packerId = null) {
    let query = `
      SELECT pt.*, u.name as packer_name 
      FROM packing_tasks pt 
      JOIN users u ON pt.packer_id = u.id 
      WHERE (pt.task_id LIKE ? OR pt.challan_id LIKE ?)
    `;
    
    const params = [`%${searchTerm}%`, `%${searchTerm}%`];
    
    if (packerId) {
      query += ' AND pt.packer_id = ?';
      params.push(packerId);
    }
    
    query += ' ORDER BY pt.task_date DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = PackingTask;