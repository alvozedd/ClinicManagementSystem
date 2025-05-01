const asyncHandler = require('express-async-handler');
const IntegratedAppointment = require('../models/integratedAppointmentModel');
const Patient = require('../models/patientModel');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * @desc    Create a new appointment
 * @route   POST /api/integrated-appointments
 * @access  Public/Private (depends on who's creating it)
 */
const createAppointment = asyncHandler(async (req, res) => {
  const {
    patient_id,
    scheduled_date,
    type,
    reason,
    notes,
    is_walk_in,
    createdBy
  } = req.body;

  // Log the incoming request data for debugging
  logger.info('Creating integrated appointment with data:', {
    patient_id,
    scheduled_date,
    type,
    reason,
    is_walk_in,
    createdBy: createdBy || (req.user ? req.user.role : 'visitor')
  });

  // Validate patient exists
  const patient = await Patient.findById(patient_id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Create appointment data object
  const appointmentData = {
    patient_id,
    scheduled_date,
    type: type || 'Consultation',
    reason,
    notes,
    is_walk_in: is_walk_in || false,
    status: is_walk_in ? 'Checked-in' : 'Scheduled',
  };

  // Add created_by_user_id only if user is authenticated
  if (req.user) {
    appointmentData.created_by_user_id = req.user._id;
  }

  // Add createdBy field to track who created the appointment
  appointmentData.createdBy = createdBy || (req.user ? req.user.role : 'visitor');

  // If it's a walk-in, set check-in time
  if (is_walk_in) {
    appointmentData.check_in_time = new Date();
    appointmentData.appointment_time = new Date().toTimeString().slice(0, 5); // Set current time as appointment time
  }

  logger.info('Final appointment data:', appointmentData);

  // Create the appointment
  const appointment = await IntegratedAppointment.create(appointmentData);

  if (appointment) {
    // Populate patient information
    const populatedAppointment = await IntegratedAppointment.findById(appointment._id)
      .populate('patient_id', 'name gender phone year_of_birth');

    res.status(201).json(populatedAppointment);
  } else {
    res.status(400);
    throw new Error('Invalid appointment data');
  }
});

/**
 * @desc    Get all appointments
 * @route   GET /api/integrated-appointments
 * @access  Private
 */
const getAppointments = asyncHandler(async (req, res) => {
  // Get query parameters
  const {
    status,
    date_from,
    date_to,
    patient_id,
    today_only,
    include_diagnosis
  } = req.query;

  // Build the query
  const query = {};

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  // Filter by date range if provided
  if (date_from || date_to || today_only) {
    query.scheduled_date = {};

    if (today_only === 'true') {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      query.scheduled_date.$gte = startOfDay;
      query.scheduled_date.$lte = endOfDay;
    } else {
      if (date_from) {
        query.scheduled_date.$gte = new Date(date_from);
      }

      if (date_to) {
        query.scheduled_date.$lte = new Date(date_to);
      }
    }
  }

  // Filter by patient if provided
  if (patient_id) {
    query.patient_id = patient_id;
  }

  // No queue filtering needed

  // Create the base query
  let appointmentsQuery = IntegratedAppointment.find(query)
    .populate('patient_id', 'name gender phone year_of_birth');

  // Sort based on date and time
  appointmentsQuery = appointmentsQuery.sort({
    scheduled_date: 1,
    appointment_time: 1
  });

  // Execute the query
  const appointments = await appointmentsQuery;

  // Return the appointments
  res.json(appointments);
});

/**
 * @desc    Get appointment by ID
 * @route   GET /api/integrated-appointments/:id
 * @access  Private
 */
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id)
    .populate('patient_id', 'name gender phone year_of_birth');

  if (appointment) {
    res.json(appointment);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

// Queue-related functions have been removed

/**
 * @desc    Update appointment
 * @route   PUT /api/integrated-appointments/:id
 * @access  Private
 */
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  const {
    scheduled_date,
    type,
    reason,
    notes,
    status,
    diagnosis
  } = req.body;

  // Update basic fields if provided
  if (scheduled_date) appointment.scheduled_date = scheduled_date;
  if (type) appointment.type = type;
  if (reason) appointment.reason = reason;
  if (notes) appointment.notes = notes;
  if (diagnosis) appointment.diagnosis = diagnosis;

  // Handle status changes
  if (status && status !== appointment.status) {
    switch (status) {
      case 'Checked-in':
        await appointment.checkIn();
        break;
      case 'In-progress':
        await appointment.startAppointment();
        break;
      case 'Completed':
        await appointment.completeAppointment(diagnosis);
        break;
      case 'Cancelled':
        await appointment.cancelAppointment(notes);
        break;
      case 'No-show':
        await appointment.markNoShow();
        break;
      default:
        appointment.status = status;
        await appointment.save();
    }
  } else {
    // Save the appointment if only basic fields were updated
    await appointment.save();
  }

  // Get the updated appointment with populated fields
  const updatedAppointment = await IntegratedAppointment.findById(req.params.id)
    .populate('patient_id', 'name gender phone year_of_birth');

  res.json(updatedAppointment);
});

/**
 * @desc    Check in a patient
 * @route   PUT /api/integrated-appointments/:id/check-in
 * @access  Private
 */
const checkInPatient = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  try {
    await appointment.checkIn();

    // Get the updated appointment with populated fields
    const updatedAppointment = await IntegratedAppointment.findById(req.params.id)
      .populate('patient_id', 'name gender phone year_of_birth');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Start an appointment
 * @route   PUT /api/integrated-appointments/:id/start
 * @access  Private
 */
const startAppointment = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  try {
    await appointment.startAppointment();

    // Get the updated appointment with populated fields
    const updatedAppointment = await IntegratedAppointment.findById(req.params.id)
      .populate('patient_id', 'name gender phone year_of_birth');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Complete an appointment
 * @route   PUT /api/integrated-appointments/:id/complete
 * @access  Private
 */
const completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  try {
    await appointment.completeAppointment(req.body.diagnosis);

    // Get the updated appointment with populated fields
    const updatedAppointment = await IntegratedAppointment.findById(req.params.id)
      .populate('patient_id', 'name gender phone year_of_birth');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Cancel an appointment
 * @route   PUT /api/integrated-appointments/:id/cancel
 * @access  Private
 */
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  try {
    await appointment.cancelAppointment(req.body.reason);

    // Get the updated appointment with populated fields
    const updatedAppointment = await IntegratedAppointment.findById(req.params.id)
      .populate('patient_id', 'name gender phone year_of_birth');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Mark appointment as no-show
 * @route   PUT /api/integrated-appointments/:id/no-show
 * @access  Private
 */
const markNoShow = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  try {
    await appointment.markNoShow();

    // Get the updated appointment with populated fields
    const updatedAppointment = await IntegratedAppointment.findById(req.params.id)
      .populate('patient_id', 'name gender phone year_of_birth');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

/**
 * @desc    Reschedule an appointment
 * @route   PUT /api/integrated-appointments/:id/reschedule
 * @access  Private
 */
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  try {
    const newAppointment = await appointment.rescheduleAppointment(
      req.body.new_date,
      req.body.reason
    );

    // Get the updated appointment with populated fields
    const updatedNewAppointment = await IntegratedAppointment.findById(newAppointment._id)
      .populate('patient_id', 'name gender phone year_of_birth');

    res.json(updatedNewAppointment);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Reorder queue function has been removed

/**
 * @desc    Delete appointment
 * @route   DELETE /api/integrated-appointments/:id
 * @access  Private
 */
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await IntegratedAppointment.findById(req.params.id);

  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  await appointment.deleteOne();
  res.json({ message: 'Appointment removed' });
});

// Reset queue function has been removed

// Get next patient function has been removed

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  checkInPatient,
  startAppointment,
  completeAppointment,
  cancelAppointment,
  markNoShow,
  rescheduleAppointment,
  deleteAppointment
};
