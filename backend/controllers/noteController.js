const asyncHandler = require('../middleware/asyncHandler');
const Note = require('../models/noteModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');
const logger = require('../utils/logger');

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private/Doctor
const createNote = asyncHandler(async (req, res) => {
  const { patient_id, appointment_id, title, content, category, tags, is_private } = req.body;

  // Validate required fields
  if (!patient_id) {
    res.status(400);
    throw new Error('Patient ID is required');
  }

  if (!title) {
    res.status(400);
    throw new Error('Title is required');
  }

  if (!content) {
    res.status(400);
    throw new Error('Content is required');
  }

  // Verify that the patient exists
  const patientExists = await Patient.findById(patient_id);
  if (!patientExists) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // If appointment_id is provided, verify that it exists
  if (appointment_id) {
    const appointmentExists = await Appointment.findById(appointment_id);
    if (!appointmentExists) {
      res.status(404);
      throw new Error('Appointment not found');
    }
  }

  try {
    const note = await Note.create({
      patient_id,
      appointment_id: appointment_id || null,
      title,
      content,
      category: category || 'General',
      tags: tags || [],
      is_private: is_private || false,
      created_by_user_id: req.user._id,
    });

    if (note) {
      logger.info(`Note created: ${note._id} for patient ${patient_id} by user ${req.user._id}`);
      res.status(201).json(note);
    } else {
      res.status(400);
      throw new Error('Invalid note data');
    }
  } catch (error) {
    logger.error(`Error creating note: ${error.message}`);
    res.status(400);
    throw new Error(`Failed to create note: ${error.message}`);
  }
});

// @desc    Get all notes
// @route   GET /api/notes
// @access  Private/Doctor
const getNotes = asyncHandler(async (req, res) => {
  // Get query parameters for filtering
  const { patient_id, appointment_id, category, search } = req.query;
  
  // Build the filter object
  const filter = {};
  
  // Add patient_id filter if provided
  if (patient_id) {
    filter.patient_id = patient_id;
  }
  
  // Add appointment_id filter if provided
  if (appointment_id) {
    filter.appointment_id = appointment_id;
  }
  
  // Add category filter if provided
  if (category) {
    filter.category = category;
  }
  
  // Add text search if provided
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } }
    ];
  }
  
  // If user is not a doctor or admin, only show non-private notes
  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    filter.is_private = false;
  }

  try {
    const notes = await Note.find(filter)
      .populate('patient_id', 'name gender year_of_birth phone')
      .populate('appointment_id', 'appointment_date status reason')
      .populate('created_by_user_id', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    logger.error(`Error fetching notes: ${error.message}`);
    res.status(500);
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }
});

// @desc    Get notes by patient ID
// @route   GET /api/notes/patient/:id
// @access  Private
const getNotesByPatientId = asyncHandler(async (req, res) => {
  try {
    const filter = { patient_id: req.params.id };
    
    // If user is not a doctor or admin, only show non-private notes
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      filter.is_private = false;
    }
    
    const notes = await Note.find(filter)
      .populate('appointment_id', 'appointment_date status reason')
      .populate('created_by_user_id', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    logger.error(`Error fetching notes for patient ${req.params.id}: ${error.message}`);
    res.status(500);
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }
});

// @desc    Get notes by appointment ID
// @route   GET /api/notes/appointment/:id
// @access  Private
const getNotesByAppointmentId = asyncHandler(async (req, res) => {
  try {
    const filter = { appointment_id: req.params.id };
    
    // If user is not a doctor or admin, only show non-private notes
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      filter.is_private = false;
    }
    
    const notes = await Note.find(filter)
      .populate('patient_id', 'name gender year_of_birth phone')
      .populate('created_by_user_id', 'name email role')
      .sort({ createdAt: -1 });
    
    res.json(notes);
  } catch (error) {
    logger.error(`Error fetching notes for appointment ${req.params.id}: ${error.message}`);
    res.status(500);
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }
});

// @desc    Get a note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('patient_id', 'name gender year_of_birth phone')
      .populate('appointment_id', 'appointment_date status reason')
      .populate('created_by_user_id', 'name email role');
    
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    
    // Check if user has permission to view this note
    if (note.is_private && req.user.role !== 'doctor' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to access this note');
    }
    
    res.json(note);
  } catch (error) {
    logger.error(`Error fetching note ${req.params.id}: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Failed to fetch note');
  }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private/Doctor
const updateNote = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    
    // Check if user is authorized to update this note
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this note');
    }
    
    // Update fields
    const { title, content, category, tags, is_private } = req.body;
    
    note.title = title || note.title;
    note.content = content || note.content;
    note.category = category || note.category;
    note.tags = tags || note.tags;
    note.is_private = is_private !== undefined ? is_private : note.is_private;
    
    const updatedNote = await note.save();
    logger.info(`Note updated: ${updatedNote._id} by user ${req.user._id}`);
    
    res.json(updatedNote);
  } catch (error) {
    logger.error(`Error updating note ${req.params.id}: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Failed to update note');
  }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private/Doctor
const deleteNote = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    
    // Check if user is authorized to delete this note
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to delete this note');
    }
    
    await note.deleteOne();
    logger.info(`Note deleted: ${req.params.id} by user ${req.user._id}`);
    
    res.json({ message: 'Note removed' });
  } catch (error) {
    logger.error(`Error deleting note ${req.params.id}: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Failed to delete note');
  }
});

// @desc    Add attachment to a note
// @route   POST /api/notes/:id/attachments
// @access  Private/Doctor
const addAttachment = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    
    // Check if user is authorized to update this note
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this note');
    }
    
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }
    
    const attachment = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype
    };
    
    note.attachments.push(attachment);
    const updatedNote = await note.save();
    
    logger.info(`Attachment added to note ${note._id}: ${attachment.filename}`);
    res.status(201).json(updatedNote);
  } catch (error) {
    logger.error(`Error adding attachment to note ${req.params.id}: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Failed to add attachment');
  }
});

// @desc    Remove attachment from a note
// @route   DELETE /api/notes/:id/attachments/:filename
// @access  Private/Doctor
const removeAttachment = asyncHandler(async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      res.status(404);
      throw new Error('Note not found');
    }
    
    // Check if user is authorized to update this note
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to update this note');
    }
    
    const attachmentIndex = note.attachments.findIndex(
      attachment => attachment.filename === req.params.filename
    );
    
    if (attachmentIndex === -1) {
      res.status(404);
      throw new Error('Attachment not found');
    }
    
    // Remove the file from the filesystem
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove the attachment from the note
    note.attachments.splice(attachmentIndex, 1);
    const updatedNote = await note.save();
    
    logger.info(`Attachment removed from note ${note._id}: ${req.params.filename}`);
    res.json(updatedNote);
  } catch (error) {
    logger.error(`Error removing attachment from note ${req.params.id}: ${error.message}`);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Failed to remove attachment');
  }
});

module.exports = {
  createNote,
  getNotes,
  getNotesByPatientId,
  getNotesByAppointmentId,
  getNoteById,
  updateNote,
  deleteNote,
  addAttachment,
  removeAttachment
};
