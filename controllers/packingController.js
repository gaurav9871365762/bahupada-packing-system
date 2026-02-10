const PackingTask = require('../models/PackingTask');
const PackingHistory = require('../models/PackingHistory');

exports.createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      packer_id: req.user.id
    };

    const taskId = await PackingTask.create(taskData);
    
    // Get the created task
    const task = await PackingTask.findById(req.body.task_id);

    res.status(201).json({
      success: true,
      message: 'Packing task created successfully',
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating packing task',
      error: error.message
    });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { status, search } = req.query;
    const packerId = req.user.role === 'packer' ? req.user.id : null;

    let tasks;
    
    if (search) {
      tasks = await PackingTask.searchTasks(search, packerId);
    } else {
      tasks = await PackingTask.getAllTasks(packerId, status);
    }

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await PackingTask.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { completed_items } = req.body;

    const affectedRows = await PackingTask.updateProgress(taskId, completed_items);
    
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const updatedTask = await PackingTask.findById(taskId);

    res.json({
      success: true,
      message: 'Progress updated successfully',
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body;
    
    // For supervisors/admins approving/rejecting
    const supervisorId = req.user.role === 'supervisor' || req.user.role === 'admin' ? req.user.id : null;

    const affectedRows = await PackingTask.updateStatus(taskId, status, supervisorId, notes);
    
    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // If task is approved or rejected, move to history
    if (status === 'approved' || status === 'rejected') {
      const task = await PackingTask.findById(taskId);
      
      await PackingHistory.create({
        task_id: task.task_id,
        challan_id: task.challan_id,
        packer_id: task.packer_id,
        supervisor_id: supervisorId,
        status: status,
        total_items: task.total_items,
        completed_items: task.completed_items,
        completion_date: new Date(),
        approved_by: status === 'approved' ? supervisorId : null,
        rejection_reason: status === 'rejected' ? notes : null
      });
    }

    const updatedTask = await PackingTask.findById(taskId);

    res.json({
      success: true,
      message: `Task ${status} successfully`,
      task: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task status',
      error: error.message
    });
  }
};

exports.getPackingHistory = async (req, res) => {
  try {
    const { startDate, endDate, limit } = req.query;
    const packerId = req.user.role === 'packer' ? req.user.id : null;

    const history = await PackingHistory.getAllHistory(packerId, startDate, endDate);
    
    const stats = await PackingHistory.getStats(packerId);

    res.json({
      success: true,
      count: history.length,
      stats,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching packing history',
      error: error.message
    });
  }
};