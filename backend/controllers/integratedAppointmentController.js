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

  // If it's a walk-in, set check-in time and get queue number
  if (is_walk_in) {
    appointmentData.check_in_time = new Date();
    
    // Get the next queue number for today
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const lastQueueEntry = await IntegratedAppointment.findOne({
      check_in_time: { $gte: startOfDay, $lte: endOfDay },
      queue_number: { $exists: true }
    }).sort({ queue_number: -1 });
    
    appointmentData.queue_number = lastQueueEntry ? lastQueueEntry.queue_number + 1 : 1;
    
    // Get the highest queue position
    const lastPositionEntry = await IntegratedAppointment.findOne({
      status: 'Checked-in',
      queue_position: { $exists: true }
    }).sort({ queue_position: -1 });
    
    appointmentData.queue_position = lastPositionEntry ? lastPositionEntry.queue_position + 1 : 1;
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
    queue_only,
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

  // Filter for queue only if requested
  if (queue_only === 'true') {
    query.status = { $in: ['Checked-in', 'In-progress'] };
  }

  // Create the base query
  let appointmentsQuery = IntegratedAppointment.find(query)
    .populate('patient_id', 'name gender phone year_of_birth');

  // Sort based on status and queue position
  appointmentsQuery = appointmentsQuery.sort({ 
    scheduled_date: 1,
    queue_position: 1
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

/**
 * @desc    Get today's queue
 * @route   GET /api/integrated-appointments/queue
 * @access  Private
 */
const getTodaysQueue = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Get all appointments that are in the queue (checked-in or in-progress)
  const queueEntries = await IntegratedAppointment.find({
    $or: [
      { check_in_time: { $gte: startOfDay, $lte: endOfDay } },
      { scheduled_date: { $gte: startOfDay, $lte: endOfDay }, status: { $in: ['Checked-in', 'In-progress'] } }
    ]
  })
    .populate('patient_id', 'name gender phone year_of_birth')
    .sort({ status: 1, queue_position: 1 });

  res.json(queueEntries);
});

/**
 * @desc    Get queue statistics
 * @route   GET /api/integrated-appointments/queue/stats
 * @access  Private
 */
const getQueueStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Get all appointments for today
  const allAppointments = await IntegratedAppointment.find({
    scheduled_date: { $gte: startOfDay, $lte: endOfDay }
  });

  // Calculate statistics
  const totalAppointments = allAppointments.length;
  const checkedInCount = allAppointments.filter(a => a.status === 'Checked-in').length;
  const inProgressCount = allAppointments.filter(a => a.status === 'In-progress').length;
  const completedCount = allAppointments.filter(a => a.status === 'Completed').length;
  const cancelledCount = allAppointments.filter(a => a.status === 'Cancelled').length;
  const noShowCount = allAppointments.filter(a => a.status === 'No-show').length;
  const walkInCount = allAppointments.filter(a => a.is_walk_in).length;
  const scheduledCount = allAppointments.filter(a => a.status === 'Scheduled').length;

  // Get the next queue number
  const lastQueueEntry = await IntegratedAppointment.findOne({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    queue_number: { $exists: true }
  }).sort({ queue_number: -1 });
  
  const nextQueueNumber = lastQueueEntry ? lastQueueEntry.queue_number + 1 : 1;

  // Calculate average service time for completed appointments
  let avgServiceTime = 0;
  const completedAppointments = allAppointments.filter(a => 
    a.status === 'Completed' && a.start_time && a.end_time
  );
  
  if (completedAppointments.length > 0) {
    const totalServiceTime = completedAppointments.reduce((total, appointment) => {
      const serviceTime = appointment.end_time - appointment.start_time;
      return total + serviceTime;
    }, 0);
    
    avgServiceTime = Math.round(totalServiceTime / completedAppointments.length / 60000); // in minutes
  }

  res.json({
    totalAppointments,
    checkedInCount,
    inProgressCount,
    completedCount,
    cancelledCount,
    noShowCount,
    walkInCount,
    scheduledCount,
    nextQueueNumber,
    avgServiceTime
  });
});

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

/**
 * @desc    Reorder queue
 * @route   PUT /api/integrated-appointments/queue/reorder
 * @access  Private
 */
const reorderQueue = asyncHandler(async (req, res) => {
  const { queueOrder } = req.body;

  if (!queueOrder || !Array.isArray(queueOrder)) {
    res.status(400);
    throw new Error('Invalid queue order data');
  }

  // Update each appointment with its new position
  const updatePromises = queueOrder.map((item, index) => {
    return IntegratedAppointment.findByIdAndUpdate(
      item.id,
      { queue_position: index },
      { new: true }
    );
  });

  await Promise.all(updatePromises);

  // Get the updated queue
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const queueEntries = await IntegratedAppointment.find({
    $or: [
      { check_in_time: { $gte: startOfDay, $lte: endOfDay } },
      { scheduled_date: { $gte: startOfDay, $lte: endOfDay }, status: { $in: ['Checked-in', 'In-progress'] } }
    ]
  })
    .populate('patient_id', 'name gender phone year_of_birth')
    .sort({ status: 1, queue_position: 1 });

  res.json(queueEntries);
});

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

/**
 * @desc    Reset queue (admin only)
 * @route   DELETE /api/integrated-appointments/queue/reset
 * @access  Private/Admin
 */
const resetQueue = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Find all appointments in the queue and reset them
  const queueEntries = await IntegratedAppointment.find({
    $or: [
      { check_in_time: { $gte: startOfDay, $lte: endOfDay } },
      { scheduled_date: { $gte: startOfDay, $lte: endOfDay }, status: { $in: ['Checked-in', 'In-progress'] } }
    ]
  });

  // Update each appointment to remove queue information
  const updatePromises = queueEntries.map(entry => {
    entry.status = 'Scheduled';
    entry.queue_number = undefined;
    entry.queue_position = undefined;
    entry.check_in_time = undefined;
    entry.start_time = undefined;
    entry.end_time = undefined;
    
    return entry.save();
  });

  await Promise.all(updatePromises);

  res.json({ 
    message: `Queue has been reset. ${queueEntries.length} entries removed from queue.`,
    resetCount: queueEntries.length
  });
});

/**
 * @desc    Get next patient in queue
 * @route   GET /api/integrated-appointments/queue/next
 * @access  Private
 */
const getNextPatient = asyncHandler(async (req, res) => {
  const nextPatient = await IntegratedAppointment.findOne({ status: 'Checked-in' })
    .sort({ queue_position: 1 })
    .populate('patient_id', 'name gender phone year_of_birth');

  if (nextPatient) {
    res.json(nextPatient);
  } else {
    res.status(404);
    throw new Error('No patients waiting in queue');
  }
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  getTodaysQueue,
  getQueueStats,
  updateAppointment,
  checkInPatient,
  startAppointment,
  completeAppointment,
  cancelAppointment,
  markNoShow,
  rescheduleAppointment,
  reorderQueue,
  deleteAppointment,
  resetQueue,
  getNextPatient
};
