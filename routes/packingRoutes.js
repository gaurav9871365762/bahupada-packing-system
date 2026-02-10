const express = require('express');
const router = express.Router();
const packingController = require('../controllers/packingController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Task management
router.post('/tasks', packingController.createTask);
router.get('/tasks', packingController.getAllTasks);
router.get('/tasks/:taskId', packingController.getTaskById);
router.put('/tasks/:taskId/progress', packingController.updateProgress);
router.put('/tasks/:taskId/status', packingController.updateStatus);

// History
router.get('/history', packingController.getPackingHistory);

module.exports = router;