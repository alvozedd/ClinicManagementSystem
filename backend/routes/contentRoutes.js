const express = require('express');
const router = express.Router();
const {
  createContent,
  getContent,
  getContentById,
  updateContent,
  deleteContent,
} = require('../controllers/contentController');
const { protect, admin } = require('../middleware/authMiddleware');
const { apiLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes for getting content
router.get('/', apiLimiter, getContent);
router.get('/:id', apiLimiter, getContentById);

// Admin-only routes for managing content
router.post('/', protect, admin, apiLimiter, createContent);
router.put('/:id', protect, admin, apiLimiter, updateContent);
router.delete('/:id', protect, admin, apiLimiter, deleteContent);

module.exports = router;
