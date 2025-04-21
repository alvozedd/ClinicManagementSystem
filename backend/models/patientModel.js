const mongoose = require('mongoose');

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
    next_of_kin_name: {
      type: String,
      required: true,
    },
    next_of_kin_relationship: {
      type: String,
      required: true,
    },
    next_of_kin_phone: {
      type: String,
      required: true,
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

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
