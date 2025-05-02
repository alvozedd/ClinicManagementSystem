const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure uploads directory exists
const ensureUploadsDir = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    logger.info(`Created uploads directory at ${uploadDir}`);
  }
  return uploadDir;
};

// @desc    Upload a file
// @route   POST /api/uploads
// @access  Private/Doctor
const uploadFile = asyncHandler(async (req, res) => {
  // Ensure uploads directory exists
  ensureUploadsDir();

  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Get the appointment ID from the request body
  const { appointment_id, diagnosis_id } = req.body;

  if (!appointment_id) {
    res.status(400);
    throw new Error('Appointment ID is required');
  }

  // Create a record in the database if needed
  const fileInfo = {
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    appointment_id,
    diagnosis_id: diagnosis_id || null,
    uploaded_by: req.user._id,
    uploaded_at: new Date()
  };

  logger.info(`File uploaded: ${req.file.filename} for appointment ${appointment_id}`);

  // If diagnosis_id is provided, update the diagnosis with the file information
  if (diagnosis_id) {
    try {
      const Diagnosis = require('../models/diagnosisModel');
      const diagnosis = await Diagnosis.findById(diagnosis_id);

      if (diagnosis) {
        // Add the file to the diagnosis files array
        const fileData = {
          file_id: req.file.filename,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          uploaded_at: new Date()
        };

        // Initialize files array if it doesn't exist
        if (!diagnosis.files) {
          diagnosis.files = [];
        }

        diagnosis.files.push(fileData);
        await diagnosis.save();

        logger.info(`File linked to diagnosis ${diagnosis_id}`);
      }
    } catch (error) {
      logger.error(`Error linking file to diagnosis: ${error.message}`);
      // Continue even if linking fails - we still want to return the file info
    }
  }

  res.status(201).json(fileInfo);
});

// @desc    Get a file by filename
// @route   GET /api/uploads/:filename
// @access  Private
const getFile = asyncHandler(async (req, res) => {
  // Ensure uploads directory exists
  ensureUploadsDir();

  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('File not found');
  }

  // Send the file
  res.sendFile(filePath);
});

// @desc    Delete a file
// @route   DELETE /api/uploads/:filename
// @access  Private/Doctor
const deleteFile = asyncHandler(async (req, res) => {
  // Ensure uploads directory exists
  ensureUploadsDir();

  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    res.status(404);
    throw new Error('File not found');
  }

  // Delete the file
  fs.unlinkSync(filePath);

  logger.info(`File deleted: ${filename}`);

  res.status(200).json({ message: 'File deleted successfully' });
});

module.exports = {
  uploadFile,
  getFile,
  deleteFile
};
