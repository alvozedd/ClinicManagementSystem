const mongoose = require('mongoose');

const queueSchema = mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    ticket_number: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Waiting', 'In Progress', 'Completed', 'No-show', 'Cancelled'],
      default: 'Waiting',
    },
    is_walk_in: {
      type: Boolean,
      default: false,
    },
    check_in_time: {
      type: Date,
      default: Date.now,
    },
    start_time: {
      type: Date,
    },
    end_time: {
      type: Date,
    },
    notes: {
      type: String,
    },
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    queue_position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Queue = mongoose.model('Queue', queueSchema);

module.exports = Queue;
