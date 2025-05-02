const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { protect, doctor } = require('../middleware/authMiddleware');
const { validateNoteCreation } = require('../middleware/validationMiddleware');
const {
  createNote,
  getNotes,
  getNotesByPatientId,
  getNotesByAppointmentId,
  getNoteById,
  updateNote,
  deleteNote,
  addAttachment,
  removeAttachment
} = require('../controllers/noteController');

// Configure multer storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  // Accept images, PDFs, and common document formats
  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and common document formats are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Base routes
router.route('/')
  .post(protect, doctor, validateNoteCreation, createNote)
  .get(protect, getNotes);

// Get notes by patient ID
router.route('/patient/:id')
  .get(protect, getNotesByPatientId);

// Get notes by appointment ID
router.route('/appointment/:id')
  .get(protect, getNotesByAppointmentId);

// Individual note routes
router.route('/:id')
  .get(protect, getNoteById)
  .put(protect, doctor, validateNoteCreation, updateNote)
  .delete(protect, doctor, deleteNote);

// Attachment routes
router.route('/:id/attachments')
  .post(protect, doctor, upload.single('file'), addAttachment);

router.route('/:id/attachments/:filename')
  .delete(protect, doctor, removeAttachment);

module.exports = router;
