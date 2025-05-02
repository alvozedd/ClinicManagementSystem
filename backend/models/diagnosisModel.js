const mongoose = require('mongoose');

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
  duration: {
    type: String,
  },
});

const diagnosisSchema = mongoose.Schema(
  {
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Appointment',
    },
    diagnosis_text: {
      type: String,
      required: true,
    },
    treatment_plan: {
      type: String,
    },
    follow_up_instructions: {
      type: String,
    },
    medications: [medicationSchema],
    files: [
      {
        file_id: String,
        filename: String,
        originalname: String,
        mimetype: String,
        uploaded_at: {
          type: Date,
          default: Date.now
        }
      }
    ],
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

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

module.exports = Diagnosis;
