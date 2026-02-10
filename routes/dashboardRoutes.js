const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/summary', dashboardController.getTaskSummary);

module.exports = router;