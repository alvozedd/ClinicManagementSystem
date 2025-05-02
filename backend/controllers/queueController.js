const asyncHandler = require('express-async-handler');
const IntegratedAppointment = require('../models/integratedAppointmentModel');
const logger = require('../utils/logger');

/**
 * @desc    Get today's queue
 * @route   GET /api/queue/today
 * @access  Private/Doctor/Secretary
 */
const getTodayQueue = asyncHandler(async (req, res) => {
  logger.info('Getting today\'s queue');
  
  try {
    const queue = await IntegratedAppointment.getTodayQueue();
    
    res.json(queue);
  } catch (error) {
    logger.error('Error getting today\'s queue', error);
    res.status(500);
    throw new Error('Failed to get queue: ' + error.message);
  }
});

/**
 * @desc    Add appointment to queue
 * @route   POST /api/queue/add/:id
 * @access  Private/Doctor/Secretary
 */
const addToQueue = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  logger.info(`Adding appointment ${appointmentId} to queue`);
  
  try {
    // Find the appointment
    const appointment = await IntegratedAppointment.findById(appointmentId);
    
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }
    
    // Get the current highest queue number
    const highestQueue = await IntegratedAppointment.find({ in_queue: true })
      .sort({ queue_number: -1 })
      .limit(1);
    
    const nextQueueNumber = highestQueue.length > 0 ? highestQueue[0].queue_number + 1 : 1;
    
    // Add to queue
    await appointment.addToQueue(nextQueueNumber);
    
    // Set the queue position to be the same as the queue number initially
    appointment.queue_position = nextQueueNumber;
    await appointment.save();
    
    // Get the updated appointment with populated fields
    const updatedAppointment = await IntegratedAppointment.findById(appointmentId)
      .populate('patient_id', 'name gender phone year_of_birth');
    
    res.json(updatedAppointment);
  } catch (error) {
    logger.error(`Error adding appointment ${appointmentId} to queue`, error);
    res.status(500);
    throw new Error('Failed to add to queue: ' + error.message);
  }
});

/**
 * @desc    Remove appointment from queue
 * @route   DELETE /api/queue/remove/:id
 * @access  Private/Doctor/Secretary
 */
const removeFromQueue = asyncHandler(async (req, res) => {
  const appointmentId = req.params.id;
  logger.info(`Removing appointment ${appointmentId} from queue`);
  
  try {
    // Find the appointment
    const appointment = await IntegratedAppointment.findById(appointmentId);
    
    if (!appointment) {
      res.status(404);
      throw new Error('Appointment not found');
    }
    
    // Get the current queue position of the appointment
    const removedPosition = appointment.queue_position;
    
    // Remove from queue
    await appointment.removeFromQueue();
    
    // Update positions of other appointments in the queue
    await IntegratedAppointment.updateMany(
      { in_queue: true, queue_position: { $gt: removedPosition } },
      { $inc: { queue_position: -1 } }
    );
    
    res.json({ message: 'Appointment removed from queue' });
  } catch (error) {
    logger.error(`Error removing appointment ${appointmentId} from queue`, error);
    res.status(500);
    throw new Error('Failed to remove from queue: ' + error.message);
  }
});

/**
 * @desc    Reorder queue
 * @route   PUT /api/queue/reorder
 * @access  Private/Doctor/Secretary
 */
const reorderQueue = asyncHandler(async (req, res) => {
  const { queueOrder } = req.body;
  logger.info('Reordering queue', { queueOrder });
  
  if (!queueOrder || !Array.isArray(queueOrder)) {
    res.status(400);
    throw new Error('Queue order is required and must be an array');
  }
  
  try {
    // Reorder queue
    await IntegratedAppointment.reorderQueue(queueOrder);
    
    // Get the updated queue
    const updatedQueue = await IntegratedAppointment.getTodayQueue();
    
    res.json(updatedQueue);
  } catch (error) {
    logger.error('Error reordering queue', error);
    res.status(500);
    throw new Error('Failed to reorder queue: ' + error.message);
  }
});

/**
 * @desc    Reset queue (clear all queue positions)
 * @route   POST /api/queue/reset
 * @access  Private/Doctor/Secretary
 */
const resetQueue = asyncHandler(async (req, res) => {
  logger.info('Resetting queue');
  
  try {
    // Reset all queue positions
    await IntegratedAppointment.updateMany(
      { in_queue: true },
      { in_queue: false, queue_position: 0 }
    );
    
    res.json({ message: 'Queue reset successfully' });
  } catch (error) {
    logger.error('Error resetting queue', error);
    res.status(500);
    throw new Error('Failed to reset queue: ' + error.message);
  }
});

module.exports = {
  getTodayQueue,
  addToQueue,
  removeFromQueue,
  reorderQueue,
  resetQueue
};
