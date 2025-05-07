const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['appointment_created', 'appointment_updated', 'appointment_cancelled', 'queue_updated'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    related_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    related_model: {
      type: String,
      enum: ['Appointment', 'Patient', 'IntegratedAppointment'],
      required: false,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Not required for visitor-created notifications
    },
    created_by: {
      type: String,
      enum: ['doctor', 'secretary', 'visitor', 'system'],
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
notificationSchema.index({ recipient_id: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
