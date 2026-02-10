const PackingTask = require('../models/PackingTask');
const PackingHistory = require('../models/PackingHistory');

exports.getDashboardStats = async (req, res) => {
  try {
    const packerId = req.user.role === 'packer' ? req.user.id : null;
    
    const stats = await PackingTask.getDashboardStats(packerId);
    
    // Get recent tasks
    const recentTasks = await PackingTask.getAllTasks(packerId, null);
    const recentCompleted = await PackingHistory.getCompletedTasks(packerId, 4);

    res.json({
      success: true,
      dashboard: {
        stats,
        recent_tasks: recentTasks.slice(0, 5),
        recent_completed: recentCompleted,
        user: {
          name: req.user.name,
          role: req.user.role,
          employee_id: req.user.employee_id
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

exports.getTaskSummary = async (req, res) => {
  try {
    const { period } = req.query; // day, week, month
    const packerId = req.user.role === 'packer' ? req.user.id : null;

    let dateFilter = '';
    const currentDate = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = 'DATE(task_date) = CURDATE()';
        break;
      case 'week':
        dateFilter = 'task_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
        break;
      case 'month':
        dateFilter = 'task_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        break;
      default:
        dateFilter = '1=1';
    }

    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(progress) as avg_progress
      FROM packing_tasks 
      WHERE ${dateFilter} ${packerId ? 'AND packer_id = ?' : ''}
      GROUP BY status
    `;

    const { pool } = require('../config/database');
    const params = packerId ? [packerId] : [];
    const [summary] = await pool.execute(query, params);

    res.json({
      success: true,
      summary,
      period: period || 'all'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task summary',
      error: error.message
    });
  }
};