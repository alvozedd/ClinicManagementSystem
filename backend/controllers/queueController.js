const asyncHandler = require('express-async-handler');
const Queue = require('../models/queueModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');

// @desc    Add a patient to the queue
// @route   POST /api/queue
// @access  Private/Secretary
const addToQueue = asyncHandler(async (req, res) => {
  const { patient_id, appointment_id, is_walk_in, notes } = req.body;

  // Verify patient exists
  const patient = await Patient.findById(patient_id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Check if appointment exists if provided
  let appointment = null;
  if (appointment_id) {
    appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }
  }

  // Check if patient is already in today's queue
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const existingQueueEntry = await Queue.findOne({
    patient_id,
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['Waiting', 'In Progress'] }
  });

  if (existingQueueEntry) {
    res.status(400);
    throw new Error('Patient is already in the queue');
  }

  // Get the next ticket number for today
  const lastTicket = await Queue.findOne({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ ticket_number: -1 });

  const ticketNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

  const queueEntry = await Queue.create({
    patient_id,
    appointment_id: appointment_id || null,
    ticket_number: ticketNumber,
    is_walk_in: is_walk_in || false,
    notes: notes || '',
    created_by_user_id: req.user ? req.user._id : null,
  });

  if (queueEntry) {
    // If this is for an appointment, update the appointment status to 'Checked In'
    if (appointment) {
      appointment.status = 'Checked In';
      await appointment.save();
    }

    // Populate patient information
    const populatedEntry = await Queue.findById(queueEntry._id)
      .populate('patient_id', 'name gender phone year_of_birth')
      .populate('appointment_id', 'appointment_date optional_time type reason status');

    res.status(201).json(populatedEntry);
  } else {
    res.status(400);
    throw new Error('Invalid queue data');
  }
});

// @desc    Get all queue entries for today
// @route   GET /api/queue
// @access  Private/Doctor/Secretary
const getQueueEntries = asyncHandler(async (req, res) => {
  // Get today's queue entries
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const queueEntries = await Queue.find({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate('patient_id', 'name gender phone year_of_birth')
    .populate('appointment_id', 'appointment_date optional_time type reason status')
    .sort({ status: 1, queue_position: 1, ticket_number: 1 });

  res.json(queueEntries);
});

// @desc    Update queue entry status
// @route   PUT /api/queue/:id
// @access  Private/Doctor/Secretary
const updateQueueEntry = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const queueEntry = await Queue.findById(req.params.id);

  if (queueEntry) {
    // Update status and related timestamps
    if (status) {
      queueEntry.status = status;

      if (status === 'In Progress' && !queueEntry.start_time) {
        queueEntry.start_time = new Date();

        // If there's an associated appointment, update its status
        if (queueEntry.appointment_id) {
          const appointment = await Appointment.findById(queueEntry.appointment_id);
          if (appointment) {
            appointment.status = 'In Progress';
            await appointment.save();
          }
        }
      } else if (status === 'Completed' && !queueEntry.end_time) {
        queueEntry.end_time = new Date();

        // If there's an associated appointment, update its status
        if (queueEntry.appointment_id) {
          const appointment = await Appointment.findById(queueEntry.appointment_id);
          if (appointment) {
            appointment.status = 'Completed';
            await appointment.save();
          }
        }
      } else if (status === 'No-show' || status === 'Cancelled') {
        // If there's an associated appointment, update its status
        if (queueEntry.appointment_id) {
          const appointment = await Appointment.findById(queueEntry.appointment_id);
          if (appointment) {
            appointment.status = status === 'No-show' ? 'No-show' : 'Cancelled';
            await appointment.save();
          }
        }
      }
    }

    if (notes !== undefined) queueEntry.notes = notes;

    const updatedEntry = await queueEntry.save();

    // Populate patient information
    const populatedEntry = await Queue.findById(updatedEntry._id)
      .populate('patient_id', 'name gender phone year_of_birth')
      .populate('appointment_id', 'appointment_date optional_time type reason status');

    res.json(populatedEntry);
  } else {
    res.status(404);
    throw new Error('Queue entry not found');
  }
});

// @desc    Remove a patient from the queue
// @route   DELETE /api/queue/:id
// @access  Private/Secretary
const removeFromQueue = asyncHandler(async (req, res) => {
  const queueEntry = await Queue.findById(req.params.id);

  if (queueEntry) {
    await queueEntry.deleteOne();
    res.json({ message: 'Patient removed from queue' });
  } else {
    res.status(404);
    throw new Error('Queue entry not found');
  }
});

// @desc    Get queue statistics
// @route   GET /api/queue/stats
// @access  Private/Doctor/Secretary
const getQueueStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const totalPatients = await Queue.countDocuments({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
  });

  const waitingPatients = await Queue.countDocuments({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    status: 'Waiting',
  });

  const inProgressPatients = await Queue.countDocuments({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    status: 'In Progress',
  });

  const completedPatients = await Queue.countDocuments({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    status: 'Completed',
  });

  const walkInPatients = await Queue.countDocuments({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    is_walk_in: true,
  });

  const appointmentPatients = await Queue.countDocuments({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    is_walk_in: false,
  });

  // Calculate average service time for completed patients
  const completedEntries = await Queue.find({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    status: 'Completed',
    start_time: { $exists: true },
    end_time: { $exists: true },
  });

  let avgServiceTime = 0;

  if (completedEntries.length > 0) {
    let totalServiceTime = 0;
    completedEntries.forEach(entry => {
      const serviceTime = (new Date(entry.end_time) - new Date(entry.start_time)) / (1000 * 60); // in minutes
      totalServiceTime += serviceTime;
    });
    avgServiceTime = Math.round(totalServiceTime / completedEntries.length);
  }

  // Get next ticket number
  const lastTicket = await Queue.findOne({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ ticket_number: -1 });

  const nextTicketNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;

  res.json({
    totalPatients,
    waitingPatients,
    inProgressPatients,
    completedPatients,
    walkInPatients,
    appointmentPatients,
    avgServiceTime,
    nextTicketNumber,
  });
});

// @desc    Get next patient in queue
// @route   GET /api/queue/next
// @access  Private/Doctor
const getNextPatient = asyncHandler(async (req, res) => {
  const nextPatient = await Queue.findOne({ status: 'Waiting' })
    .sort({ ticket_number: 1 })
    .populate('patient_id', 'name gender phone year_of_birth')
    .populate('appointment_id', 'appointment_date optional_time type reason status');

  if (nextPatient) {
    res.json(nextPatient);
  } else {
    res.status(404);
    throw new Error('No patients waiting in queue');
  }
});

// @desc    Reorder queue entries
// @route   PUT /api/queue/reorder
// @access  Private/Secretary
const reorderQueue = asyncHandler(async (req, res) => {
  const { queueOrder } = req.body;

  if (!queueOrder || !Array.isArray(queueOrder)) {
    res.status(400);
    throw new Error('Invalid queue order data');
  }

  // Update each queue entry with its new position
  const updatePromises = queueOrder.map((item, index) => {
    return Queue.findByIdAndUpdate(
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

  const queueEntries = await Queue.find({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
  })
    .populate('patient_id', 'name gender phone year_of_birth')
    .populate('appointment_id', 'appointment_date optional_time type reason status')
    .sort({ status: 1, queue_position: 1, ticket_number: 1 });

  res.json(queueEntries);
});

// @desc    Clear all completed queue entries
// @route   DELETE /api/queue/clear-completed
// @access  Private/Secretary
const clearCompletedQueue = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Find all completed entries for today
  const result = await Queue.deleteMany({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    status: 'Completed'
  });

  res.json({
    message: `${result.deletedCount} completed queue entries removed`,
    deletedCount: result.deletedCount
  });
});

module.exports = {
  addToQueue,
  getQueueEntries,
  updateQueueEntry,
  removeFromQueue,
  getQueueStats,
  getNextPatient,
  reorderQueue,
  clearCompletedQueue,
};
