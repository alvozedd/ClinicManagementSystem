const mongoose = require('mongoose');

/**
 * Queue Model
 * 
 * This model stores the queue positions for appointments on a given day.
 * It allows for tracking the order of patients in the clinic queue.
 */
const queueSchema = mongoose.Schema(
  {
    // The date this queue is for (without time)
    date: {
      type: Date,
      required: true,
    },
    
    // Array of appointments in queue order
    appointments: [
      {
        appointment_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Appointment',
          required: true,
        },
        // Queue position (1, 2, 3, etc.)
        position: {
          type: Number,
          required: true,
        },
        // Whether this appointment is active in the queue
        active: {
          type: Boolean,
          default: true,
        },
        // When the appointment was added to the queue
        added_at: {
          type: Date,
          default: Date.now,
        },
        // When the appointment was completed (if applicable)
        completed_at: {
          type: Date,
        }
      }
    ],
    
    // Metadata
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
queueSchema.index({ date: 1 }, { unique: true });

// Method to add an appointment to the queue
queueSchema.methods.addAppointment = function(appointmentId) {
  // Check if appointment is already in the queue
  const existingIndex = this.appointments.findIndex(
    a => a.appointment_id.toString() === appointmentId.toString()
  );
  
  if (existingIndex !== -1) {
    // If it exists but is not active, reactivate it
    if (!this.appointments[existingIndex].active) {
      this.appointments[existingIndex].active = true;
      this.appointments[existingIndex].added_at = new Date();
      this.appointments[existingIndex].completed_at = undefined;
    }
    return this.save();
  }
  
  // Add the appointment to the end of the queue
  const nextPosition = this.appointments.length > 0 
    ? Math.max(...this.appointments.map(a => a.position)) + 1 
    : 1;
  
  this.appointments.push({
    appointment_id: appointmentId,
    position: nextPosition,
    active: true,
    added_at: new Date()
  });
  
  this.last_updated = new Date();
  return this.save();
};

// Method to reorder the queue
queueSchema.methods.reorderQueue = function(newOrder) {
  // newOrder should be an array of appointment IDs in the desired order
  
  // Update positions based on the new order
  newOrder.forEach((appointmentId, index) => {
    const appointmentIndex = this.appointments.findIndex(
      a => a.appointment_id.toString() === appointmentId.toString()
    );
    
    if (appointmentIndex !== -1) {
      this.appointments[appointmentIndex].position = index + 1;
    }
  });
  
  // Sort the appointments array by position
  this.appointments.sort((a, b) => a.position - b.position);
  
  this.last_updated = new Date();
  return this.save();
};

// Method to mark an appointment as completed
queueSchema.methods.completeAppointment = function(appointmentId) {
  const appointmentIndex = this.appointments.findIndex(
    a => a.appointment_id.toString() === appointmentId.toString()
  );
  
  if (appointmentIndex !== -1) {
    // Mark as inactive and set completion time
    this.appointments[appointmentIndex].active = false;
    this.appointments[appointmentIndex].completed_at = new Date();
    
    // Move to the end of the queue
    const maxPosition = Math.max(...this.appointments.map(a => a.position));
    this.appointments[appointmentIndex].position = maxPosition + 1;
    
    // Sort the appointments array by position
    this.appointments.sort((a, b) => a.position - b.position);
    
    this.last_updated = new Date();
  }
  
  return this.save();
};

// Static method to get or create a queue for a specific date
queueSchema.statics.getOrCreateForDate = async function(date) {
  // Normalize the date to remove time component
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  
  // Try to find an existing queue for this date
  let queue = await this.findOne({ date: normalizedDate });
  
  // If no queue exists, create a new one
  if (!queue) {
    queue = new this({
      date: normalizedDate,
      appointments: []
    });
    await queue.save();
  }
  
  return queue;
};

const Queue = mongoose.model('Queue', queueSchema);

module.exports = Queue;
