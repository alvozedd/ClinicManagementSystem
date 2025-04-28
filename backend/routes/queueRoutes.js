const express = require('express');
const router = express.Router();
const {
  addToQueue,
  getQueueEntries,
  updateQueueEntry,
  removeFromQueue,
  getQueueStats,
  getNextPatient,
  reorderQueue,
} = require('../controllers/queueController');
const { protect, doctor, secretary, doctorOrSecretary } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Apply protection middleware to all routes
router.use(protect);
router.use(apiLimiter);

// Routes that both doctors and secretaries can access
router.route('/')
  .post(doctorOrSecretary, addToQueue)
  .get(doctorOrSecretary, getQueueEntries);

router.route('/stats').get(doctorOrSecretary, getQueueStats);
router.route('/next').get(doctor, getNextPatient);
router.route('/reorder').put(secretary, reorderQueue);

router.route('/:id')
  .put(doctorOrSecretary, updateQueueEntry)
  .delete(secretary, removeFromQueue);

module.exports = router;
