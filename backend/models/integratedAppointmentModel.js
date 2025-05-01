const mongoose = require('mongoose');

/**
 * Integrated Appointment Model
 *
 * This model handles appointments with time-based sorting.
 */
const integratedAppointmentSchema = mongoose.Schema(
  {
    // Patient information
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Patient',
    },

    // Appointment details
    scheduled_date: {
      type: Date,
      required: true,
    },

    // Appointment type and reason
    type: {
      type: String,
      enum: ['Consultation', 'Follow-up', 'Procedure', 'Test', 'Emergency', 'Walk-in'],
      default: 'Consultation',
    },
    reason: {
      type: String,
    },

    // Appointment status
    status: {
      type: String,
      enum: [
        'Scheduled',    // Initial state when appointment is created
        'Checked-in',   // Patient has arrived and is in the waiting room
        'In-progress',  // Patient is currently with the doctor
        'Completed',    // Appointment is finished
        'Cancelled',    // Appointment was cancelled
        'No-show',      // Patient didn't show up
        'Rescheduled'   // Appointment was rescheduled
      ],
      default: 'Scheduled',
    },

    // Time information for sorting
    appointment_time: {
      type: String,
      default: '09:00',
    },

    // Timestamps for tracking patient flow
    check_in_time: {
      type: Date,
    },
    start_time: {
      type: Date,
    },
    end_time: {
      type: Date,
    },

    // Notes and additional information
    notes: {
      type: String,
    },

    // Diagnosis information (can be populated when appointment is completed)
    diagnosis: {
      text: String,
      treatment_plan: String,
      follow_up_instructions: String,
      medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
      }]
    },

    // Metadata
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: String,
      enum: ['doctor', 'secretary', 'visitor', 'admin'],
      default: 'visitor',
    },

    // For tracking rescheduled appointments
    original_appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IntegratedAppointment',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
integratedAppointmentSchema.index({ scheduled_date: 1 });
integratedAppointmentSchema.index({ patient_id: 1 });
integratedAppointmentSchema.index({ status: 1 });
integratedAppointmentSchema.index({ appointment_time: 1 });

// Virtual for patient's age at time of appointment
integratedAppointmentSchema.virtual('patientInfo', {
  ref: 'Patient',
  localField: 'patient_id',
  foreignField: '_id',
  justOne: true
});

// Method to check in a patient
integratedAppointmentSchema.methods.checkIn = async function() {
  if (this.status !== 'Scheduled' && this.status !== 'Rescheduled') {
    throw new Error(`Cannot check in appointment with status: ${this.status}`);
  }

  // Update the appointment
  this.status = 'Checked-in';
  this.check_in_time = new Date();

  return this.save();
};

// Method to start an appointment
integratedAppointmentSchema.methods.startAppointment = async function() {
  if (this.status !== 'Checked-in') {
    throw new Error(`Cannot start appointment with status: ${this.status}`);
  }

  this.status = 'In-progress';
  this.start_time = new Date();

  return this.save();
};

// Method to complete an appointment
integratedAppointmentSchema.methods.completeAppointment = async function(diagnosisData) {
  if (this.status !== 'In-progress') {
    throw new Error(`Cannot complete appointment with status: ${this.status}`);
  }

  this.status = 'Completed';
  this.end_time = new Date();

  if (diagnosisData) {
    this.diagnosis = diagnosisData;
  }

  return this.save();
};

// Method to cancel an appointment
integratedAppointmentSchema.methods.cancelAppointment = async function(reason) {
  if (this.status === 'Completed' || this.status === 'In-progress') {
    throw new Error(`Cannot cancel appointment with status: ${this.status}`);
  }

  this.status = 'Cancelled';
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nCancellation reason: ${reason}` : `Cancellation reason: ${reason}`;
  }

  return this.save();
};

// Method to mark as no-show
integratedAppointmentSchema.methods.markNoShow = async function() {
  if (this.status !== 'Scheduled' && this.status !== 'Rescheduled') {
    throw new Error(`Cannot mark no-show for appointment with status: ${this.status}`);
  }

  this.status = 'No-show';

  return this.save();
};

// Method to reschedule an appointment
integratedAppointmentSchema.methods.rescheduleAppointment = async function(newDate, reason) {
  if (this.status === 'Completed' || this.status === 'In-progress') {
    throw new Error(`Cannot reschedule appointment with status: ${this.status}`);
  }

  // Create a new appointment based on this one
  const IntegratedAppointment = this.constructor;

  const newAppointment = new IntegratedAppointment({
    patient_id: this.patient_id,
    scheduled_date: newDate,
    type: this.type,
    reason: this.reason,
    notes: reason ? `Rescheduled from ${this.scheduled_date.toDateString()}. Reason: ${reason}` : `Rescheduled from ${this.scheduled_date.toDateString()}`,
    created_by_user_id: this.created_by_user_id,
    createdBy: this.createdBy,
    original_appointment_id: this._id,
    status: 'Scheduled'
  });

  // Save the new appointment
  await newAppointment.save();

  // Update this appointment
  this.status = 'Rescheduled';
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nRescheduled reason: ${reason}` : `Rescheduled reason: ${reason}`;
  }

  await this.save();

  return newAppointment;
};

const IntegratedAppointment = mongoose.model('IntegratedAppointment', integratedAppointmentSchema);

module.exports = IntegratedAppointment;
