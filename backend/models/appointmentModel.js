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
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
