const express = require('express');
const router = express.Router();
const {
  getTodayQueue,
  addToQueue,
  removeFromQueue,
  reorderQueue,
  resetQueue
} = require('../controllers/queueController');
const { protect, doctorOrSecretary } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// All queue routes are protected and require doctor or secretary role
router.use(protect);
router.use(doctorOrSecretary);
router.use(apiLimiter);

// Get today's queue
router.get('/today', getTodayQueue);

// Add appointment to queue
router.post('/add/:id', addToQueue);

// Remove appointment from queue
router.delete('/remove/:id', removeFromQueue);

// Reorder queue
router.put('/reorder', reorderQueue);

// Reset queue (clear all queue positions)
router.post('/reset', resetQueue);

module.exports = router;
