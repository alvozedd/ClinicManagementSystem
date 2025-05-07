const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  createNotificationsByRole,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect, admin, doctor, secretary, doctorOrSecretary } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Protected routes - require authentication
router.route('/')
  .get(protect, apiLimiter, getNotifications)
  .post(protect, doctorOrSecretary, apiLimiter, createNotification);

router.route('/unread-count')
  .get(protect, apiLimiter, getUnreadCount);

router.route('/mark-all-read')
  .put(protect, apiLimiter, markAllAsRead);

router.route('/role')
  .post(protect, doctorOrSecretary, apiLimiter, createNotificationsByRole);

router.route('/:id/read')
  .put(protect, apiLimiter, markAsRead);

router.route('/:id')
  .delete(protect, apiLimiter, deleteNotification);

module.exports = router;
