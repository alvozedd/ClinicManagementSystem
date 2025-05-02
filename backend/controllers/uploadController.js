const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
    logger.info(`Created uploads directory: ${uploadsDir}`);
  } catch (error) {
    logger.error(`Failed to create uploads directory: ${error.message}`);
  }
}

// @desc    Upload a file
// @route   POST /api/uploads
// @access  Private/Doctor
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // Get the appointment ID from the request body
  const { appointment_id } = req.body;

  if (!appointment_id) {
    res.status(400);
    throw new Error('Appointment ID is required');
  }

  // Create a record in the database if needed
  // For now, we'll just return the file information
  const fileInfo = {
    originalname: req.file.originalname,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    appointment_id,
    uploaded_by: req.user._id,
    uploaded_at: new Date()
  };

  logger.info(`File uploaded: ${req.file.filename} for appointment ${appointment_id}`);

  res.status(201).json(fileInfo);
});

// @desc    Get a file by filename
// @route   GET /api/uploads/:filename
// @access  Private
const getFile = asyncHandler(async (req, res) => {
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
