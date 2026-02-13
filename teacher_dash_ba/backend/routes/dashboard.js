const express = require('express');
const {
  getDashboardStats,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getRecentActivity,
  getSchedule,
  getNotifications
} = require('../controllers/dashboard');
const { validateTask, validate } = require('../middleware/validation');

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/activity', getRecentActivity);
router.get('/schedule', getSchedule);
router.get('/notifications', getNotifications);

router.route('/tasks')
  .get(getTasks)
  .post(validateTask, validate, createTask);

router.route('/tasks/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;