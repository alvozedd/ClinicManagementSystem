const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },
    appointment_date: {
      type: Date,
      required: true,
    },
    optional_time: {
      type: String,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled', 'No-show'],
      default: 'Scheduled',
    },
    type: {
      type: String,
      default: 'Consultation',
    },
    reason: {
      type: String,
    },
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Changed to false to allow visitor bookings
      ref: 'User',
    },
    createdBy: {
      type: String,
      enum: ['doctor', 'secretary', 'visitor', 'admin'],
      default: 'visitor',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
