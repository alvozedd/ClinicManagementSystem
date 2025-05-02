const mongoose = require('mongoose');

const noteSchema = mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    appointment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false, // Notes can be created without an appointment
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['General', 'Medication', 'Lab Result', 'Procedure', 'Follow-up', 'Other'],
      default: 'General',
    },
    tags: [String],
    attachments: [
      {
        filename: String,
        originalname: String,
        path: String,
        mimetype: String,
      }
    ],
    created_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    is_private: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
noteSchema.index({ patient_id: 1 });
noteSchema.index({ appointment_id: 1 });
noteSchema.index({ created_by_user_id: 1 });
noteSchema.index({ category: 1 });
noteSchema.index({ tags: 1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
