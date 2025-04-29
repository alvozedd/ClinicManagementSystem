const asyncHandler = require('express-async-handler');
const Queue = require('../models/queueModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');

// @desc    Add a patient to the queue
// @route   POST /api/queue
// @access  Private/Secretary
const addToQueue = asyncHandler(async (req, res) => {
  const { patient_id, appointment_id, is_walk_in, notes } = req.body;
  console.log('Adding to queue:', { patient_id, appointment_id, is_walk_in });

  // Step 1: Verify patient exists
  if (!patient_id) {
    console.error('No patient ID provided');
    res.status(400);
    throw new Error('Patient ID is required');
  }

  const patient = await Patient.findById(patient_id);
  if (!patient) {
    console.error(`Patient not found with ID: ${patient_id}`);
    res.status(404);
    throw new Error('Patient not found');
  }

  // Step 2: Check if appointment exists if provided
  let appointment = null;
  if (appointment_id) {
    appointment = await Appointment.findById(appointment_id);
    if (!appointment) {
      console.error(`Appointment not found with ID: ${appointment_id}`);
      res.status(404);
      throw new Error('Appointment not found');
    }

    // Verify the appointment belongs to this patient
    if (appointment.patient_id.toString() !== patient_id.toString()) {
      console.error(`Appointment ${appointment_id} does not belong to patient ${patient_id}`);
      res.status(400);
      throw new Error('Appointment does not belong to this patient');
    }
  }

  // Step 3: Check if patient is already in today's queue
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const existingQueueEntry = await Queue.findOne({
    patient_id,
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['Waiting', 'In Progress'] }
  });

  if (existingQueueEntry) {
    console.error(`Patient ${patient_id} is already in the queue with entry ${existingQueueEntry._id}`);
    res.status(400);
    throw new Error('Patient is already in the queue');
  }

  // Step 4: Get the next ticket number for today
  const lastTicket = await Queue.findOne({
    check_in_time: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ ticket_number: -1 });

  const ticketNumber = lastTicket ? lastTicket.ticket_number + 1 : 1;
  console.log(`Assigning ticket number ${ticketNumber} (last ticket: ${lastTicket ? lastTicket.ticket_number : 'none'})`);

  // Step 5: Create the queue entry
  const queueEntry = await Queue.create({
    patient_id,
    appointment_id: appointment_id || null,
    ticket_number: ticketNumber,
    is_walk_in: is_walk_in || false,
    notes: notes || '',
    created_by_user_id: req.user ? req.user._id : null,
  });

  if (queueEntry) {
    console.log(`Created queue entry ${queueEntry._id} with ticket number ${ticketNumber}`);

    // Step 6: If this is for an appointment, update the appointment status to 'Checked In'
    if (appointment) {
      appointment.status = 'Checked In';
      await appointment.save();
      console.log(`Updated appointment ${appointment_id} status to 'Checked In'`);
    }

    // Step 7: Populate patient information
    const populatedEntry = await Queue.findById(queueEntry._id)
      .populate('patient_id', 'name gender phone year_of_birth')
      .populate('appointment_id', 'appointment_date optional_time type reason status');

    res.status(201).json(populatedEntry);
  } else {
    console.error('Failed to create queue entry');
    res.status(400);
    throw new Error('Invalid queue data');
  }
});

// @desc    Get all queue entries for today
// @route   GET /api/queue
// @access  Private/Doctor/Secretary
const getQueueEntries = asyncHandler(async (req, res) => {
  console.log('Getting queue entries');

  // Get today's queue entries
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  console.log(`Fetching queue entries between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

  try {
    // First count how many entries we expect to find
    const entryCount = await Queue.countDocuments({
      check_in_time: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log(`Found ${entryCount} queue entries for today`);

    // Get the entries with populated fields
    const queueEntries = await Queue.find({
      check_in_time: { $gte: startOfDay, $lte: endOfDay },
    })
      .populate('patient_id', 'name gender phone year_of_birth')
      .populate('appointment_id', 'appointment_date optional_time type reason status')
      .sort({ status: 1, queue_position: 1, ticket_number: 1 });

    console.log(`Returning ${queueEntries.length} queue entries`);

    // Log the ticket numbers for debugging
    const ticketNumbers = queueEntries.map(entry => entry.ticket_number).sort((a, b) => a - b);
    console.log('Ticket numbers in order:', ticketNumbers);

    res.json(queueEntries);
  } catch (error) {
    console.error('Error fetching queue entries:', error);
    res.status(500).json({ message: 'Failed to fetch queue entries', error: error.message });
  }
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
  console.log('Getting queue statistics');

  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  console.log(`Calculating stats for queue entries between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

  try {
    // Get all queue entries for today in a single query to reduce database load
    const allQueueEntries = await Queue.find({
      check_in_time: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log(`Found ${allQueueEntries.length} total queue entries for today`);

    // Calculate statistics from the fetched entries
    const totalPatients = allQueueEntries.length;

    const waitingPatients = allQueueEntries.filter(entry => entry.status === 'Waiting').length;
    const inProgressPatients = allQueueEntries.filter(entry => entry.status === 'In Progress').length;
    const completedPatients = allQueueEntries.filter(entry => entry.status === 'Completed').length;

    const walkInPatients = allQueueEntries.filter(entry => entry.is_walk_in === true).length;
    const appointmentPatients = allQueueEntries.filter(entry => entry.is_walk_in === false).length;

    // Calculate average service time for completed patients
    const completedEntries = allQueueEntries.filter(entry =>
      entry.status === 'Completed' && entry.start_time && entry.end_time
    );

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
    const ticketNumbers = allQueueEntries.map(entry => entry.ticket_number);
    const highestTicket = ticketNumbers.length > 0 ? Math.max(...ticketNumbers) : 0;
    const nextTicketNumber = highestTicket + 1;

    console.log('Queue statistics:', {
      totalPatients,
      waitingPatients,
      inProgressPatients,
      completedPatients,
      walkInPatients,
      appointmentPatients,
      nextTicketNumber
    });

    // Get today's scheduled appointments that aren't in the queue yet
    const todayAppointments = await Appointment.countDocuments({
      appointment_date: { $gte: startOfDay, $lte: endOfDay },
      status: 'Scheduled'
    });

    console.log(`Found ${todayAppointments} scheduled appointments for today`);

    // Return the statistics
    res.json({
      totalPatients,
      waitingPatients,
      inProgressPatients,
      completedPatients,
      walkInPatients,
      appointmentPatients,
      avgServiceTime,
      nextTicketNumber,
      todayAppointments
    });
  } catch (error) {
    console.error('Error calculating queue statistics:', error);
    res.status(500).json({ message: 'Failed to calculate queue statistics', error: error.message });
  }
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

// @desc    Reset the entire queue (clear all entries)
// @route   DELETE /api/queue/reset
// @access  Private/Admin
const resetQueue = asyncHandler(async (req, res) => {
  try {
    console.log('Resetting queue at', new Date().toISOString());

    // Get today's date for logging
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // First, get a count of today's queue entries for logging
    const todayCount = await Queue.countDocuments({
      check_in_time: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log(`Found ${todayCount} queue entries for today`);

    // Delete all queue entries
    const result = await Queue.deleteMany({});

    console.log(`Queue has been reset. ${result.deletedCount} total entries removed.`);

    // Verify that the queue is empty
    const remainingCount = await Queue.countDocuments({});
    console.log(`Remaining queue entries after reset: ${remainingCount}`);

    if (res) {
      res.json({
        message: `Queue has been reset. ${result.deletedCount} entries removed.`,
        deletedCount: result.deletedCount
      });
    }

    return {
      success: true,
      deletedCount: result.deletedCount
    };
  } catch (error) {
    console.error('Error resetting queue:', error);

    if (res) {
      res.status(500).json({
        message: 'Failed to reset queue',
        error: error.message
      });
    }

    return {
      success: false,
      error: error.message
    };
  }
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
  resetQueue,
};
