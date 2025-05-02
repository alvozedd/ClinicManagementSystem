const asyncHandler = require('express-async-handler');
const Queue = require('../models/queueModel');
const Appointment = require('../models/appointmentModel');

// @desc    Get today's queue
// @route   GET /api/queue/today
// @access  Private (Doctor/Secretary)
const getTodayQueue = asyncHandler(async (req, res) => {
  // Get today's date (normalized to start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get or create today's queue
  const queue = await Queue.getOrCreateForDate(today)
    .populate({
      path: 'appointments.appointment_id',
      model: 'Appointment',
      populate: {
        path: 'patient_id',
        model: 'Patient',
        select: 'name gender phone year_of_birth'
      }
    });
  
  // Get all of today's appointments that aren't in the queue yet
  const todaysAppointments = await Appointment.find({
    appointment_date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    },
    status: { $ne: 'Cancelled' }
  }).populate('patient_id', 'name gender phone year_of_birth');
  
  // Filter out appointments that are already in the queue
  const queueAppointmentIds = queue.appointments.map(a => a.appointment_id._id.toString());
  const availableAppointments = todaysAppointments.filter(
    appointment => !queueAppointmentIds.includes(appointment._id.toString())
  );
  
  res.status(200).json({
    queue,
    availableAppointments
  });
});

// @desc    Add appointment to queue
// @route   POST /api/queue/add
// @access  Private (Doctor/Secretary)
const addToQueue = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  
  if (!appointmentId) {
    res.status(400);
    throw new Error('Appointment ID is required');
  }
  
  // Verify the appointment exists
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get or create today's queue
  const queue = await Queue.getOrCreateForDate(today);
  
  // Add the appointment to the queue
  await queue.addAppointment(appointmentId);
  
  // Return the updated queue
  const updatedQueue = await Queue.findById(queue._id)
    .populate({
      path: 'appointments.appointment_id',
      model: 'Appointment',
      populate: {
        path: 'patient_id',
        model: 'Patient',
        select: 'name gender phone year_of_birth'
      }
    });
  
  res.status(200).json(updatedQueue);
});

// @desc    Reorder queue
// @route   PUT /api/queue/reorder
// @access  Private (Doctor/Secretary)
const reorderQueue = asyncHandler(async (req, res) => {
  const { appointmentIds } = req.body;
  
  if (!appointmentIds || !Array.isArray(appointmentIds)) {
    res.status(400);
    throw new Error('Array of appointment IDs is required');
  }
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get today's queue
  const queue = await Queue.getOrCreateForDate(today);
  
  // Reorder the queue
  await queue.reorderQueue(appointmentIds);
  
  // Return the updated queue
  const updatedQueue = await Queue.findById(queue._id)
    .populate({
      path: 'appointments.appointment_id',
      model: 'Appointment',
      populate: {
        path: 'patient_id',
        model: 'Patient',
        select: 'name gender phone year_of_birth'
      }
    });
  
  res.status(200).json(updatedQueue);
});

// @desc    Mark appointment as completed in queue
// @route   PUT /api/queue/complete
// @access  Private (Doctor/Secretary)
const completeQueueAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  
  if (!appointmentId) {
    res.status(400);
    throw new Error('Appointment ID is required');
  }
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get today's queue
  const queue = await Queue.getOrCreateForDate(today);
  
  // Mark the appointment as completed
  await queue.completeAppointment(appointmentId);
  
  // Also update the appointment status in the appointments collection
  await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });
  
  // Return the updated queue
  const updatedQueue = await Queue.findById(queue._id)
    .populate({
      path: 'appointments.appointment_id',
      model: 'Appointment',
      populate: {
        path: 'patient_id',
        model: 'Patient',
        select: 'name gender phone year_of_birth'
      }
    });
  
  res.status(200).json(updatedQueue);
});

// @desc    Remove appointment from queue
// @route   DELETE /api/queue/remove
// @access  Private (Doctor/Secretary)
const removeFromQueue = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;
  
  if (!appointmentId) {
    res.status(400);
    throw new Error('Appointment ID is required');
  }
  
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get today's queue
  const queue = await Queue.getOrCreateForDate(today);
  
  // Find the appointment in the queue
  const appointmentIndex = queue.appointments.findIndex(
    a => a.appointment_id.toString() === appointmentId
  );
  
  if (appointmentIndex === -1) {
    res.status(404);
    throw new Error('Appointment not found in queue');
  }
  
  // Remove the appointment from the queue
  queue.appointments.splice(appointmentIndex, 1);
  
  // Update positions for remaining appointments
  queue.appointments.forEach((appointment, index) => {
    appointment.position = index + 1;
  });
  
  queue.last_updated = new Date();
  await queue.save();
  
  // Return the updated queue
  const updatedQueue = await Queue.findById(queue._id)
    .populate({
      path: 'appointments.appointment_id',
      model: 'Appointment',
      populate: {
        path: 'patient_id',
        model: 'Patient',
        select: 'name gender phone year_of_birth'
      }
    });
  
  res.status(200).json(updatedQueue);
});

module.exports = {
  getTodayQueue,
  addToQueue,
  reorderQueue,
  completeQueueAppointment,
  removeFromQueue
};
