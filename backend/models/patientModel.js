const mongoose = require('mongoose');

// Define the medical history schema
const medicalHistorySchema = mongoose.Schema({
  condition: {
    type: String,
    required: true,
  },
  diagnosedDate: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
});

// Define the medication schema
const medicationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
  },
  startDate: {
    type: String,
  },
});

const patientSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    year_of_birth: {
      type: Number,
    },
    next_of_kin_name: {
      type: String,
    },
    next_of_kin_relationship: {
      type: String,
    },
    next_of_kin_phone: {
      type: String,
    },
    // New fields for medical history, allergies, and medications
    medicalHistory: [medicalHistorySchema],
    allergies: [String],
    medications: [medicationSchema],
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: String,
      enum: ['doctor', 'secretary', 'visitor'],
      default: 'doctor',
    },
  },
  {
    timestamps: true,
  }
);

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
