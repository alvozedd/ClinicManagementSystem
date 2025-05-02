const express = require('express');
const router = express.Router();
const {
  getTodayQueue,
  addToQueue,
  reorderQueue,
  completeQueueAppointment,
  removeFromQueue
} = require('../controllers/queueController');
const { protect, doctor, secretary, doctorOrSecretary } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Apply protection middleware to all routes
router.use(protect);
router.use(doctorOrSecretary);
router.use(apiLimiter);

// Queue routes
router.get('/today', getTodayQueue);
router.post('/add', addToQueue);
router.put('/reorder', reorderQueue);
router.put('/complete', completeQueueAppointment);
router.delete('/remove', removeFromQueue);

module.exports = router;
