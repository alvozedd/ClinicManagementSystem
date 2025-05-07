const asyncHandler = require('express-async-handler');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel');

// @desc    Get notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient_id: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(notifications);
});

// @desc    Get unread notification count for the logged-in user
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient_id: req.user._id,
    is_read: false,
  });

  res.json({ count });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check if the notification belongs to the logged-in user
  if (notification.recipient_id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this notification');
  }

  notification.is_read = true;
  await notification.save();

  res.json(notification);
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient_id: req.user._id, is_read: false },
    { is_read: true }
  );

  res.json({ message: 'All notifications marked as read' });
});

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = asyncHandler(async (req, res) => {
  const { recipient_id, type, title, message, related_id, related_model } = req.body;

  // Validate recipient exists
  const recipient = await User.findById(recipient_id);
  if (!recipient) {
    res.status(400);
    throw new Error('Recipient user not found');
  }

  const notification = await Notification.create({
    recipient_id,
    type,
    title,
    message,
    related_id,
    related_model,
    created_by_user_id: req.user ? req.user._id : null,
    created_by: req.user ? req.user.role : 'system',
  });

  res.status(201).json(notification);
});

// @desc    Create notifications for all staff of a specific role
// @route   POST /api/notifications/role
// @access  Private/Admin
const createNotificationsByRole = asyncHandler(async (req, res) => {
  const { role, type, title, message, related_id, related_model } = req.body;

  // Validate role
  if (!['doctor', 'secretary', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role specified');
  }

  // Find all users with the specified role
  const users = await User.find({ role });

  if (users.length === 0) {
    res.status(404);
    throw new Error(`No users found with role: ${role}`);
  }

  // Create notifications for each user
  const notifications = [];
  for (const user of users) {
    const notification = await Notification.create({
      recipient_id: user._id,
      type,
      title,
      message,
      related_id,
      related_model,
      created_by_user_id: req.user ? req.user._id : null,
      created_by: req.user ? req.user.role : 'system',
    });
    notifications.push(notification);
  }

  res.status(201).json({
    message: `Created ${notifications.length} notifications for users with role: ${role}`,
    count: notifications.length,
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  // Check if the notification belongs to the logged-in user
  if (notification.recipient_id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await notification.remove();

  res.json({ message: 'Notification removed' });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  createNotificationsByRole,
  deleteNotification,
};
