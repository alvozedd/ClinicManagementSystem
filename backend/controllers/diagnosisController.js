const asyncHandler = require('../middleware/asyncHandler');
const Diagnosis = require('../models/diagnosisModel');

// @desc    Create a new diagnosis
// @route   POST /api/diagnoses
// @access  Private/Doctor
const createDiagnosis = asyncHandler(async (req, res) => {
  const { appointment_id, diagnosis_text } = req.body;

  // No longer check for existing diagnosis - allow multiple diagnoses per appointment

  const diagnosis = await Diagnosis.create({
    appointment_id,
    diagnosis_text,
    created_by_user_id: req.user._id,
  });

  if (diagnosis) {
    res.status(201).json(diagnosis);
  } else {
    res.status(400);
    throw new Error('Invalid diagnosis data');
  }
});

// @desc    Get all diagnoses
// @route   GET /api/diagnoses
// @access  Private/Doctor
const getDiagnoses = asyncHandler(async (req, res) => {
  // If user is a doctor, only return diagnoses created by them
  // If user is an admin, return all diagnoses
  const filter = req.user.role === 'doctor' ? { created_by_user_id: req.user._id } : {};

  const diagnoses = await Diagnosis.find(filter)
    .populate({
      path: 'appointment_id',
      populate: {
        path: 'patient_id',
        select: 'name',
      },
    });

  res.json(diagnoses);
});

// @desc    Get diagnoses by appointment ID
// @route   GET /api/diagnoses/appointment/:id
// @access  Private/Doctor
const getDiagnosisByAppointmentId = asyncHandler(async (req, res) => {
  const filter = {
    appointment_id: req.params.id,
  };

  // If user is a doctor, only return diagnoses created by them
  if (req.user.role === 'doctor') {
    filter.created_by_user_id = req.user._id;
  }

  // Changed from findOne to find to get all diagnoses for an appointment
  const diagnoses = await Diagnosis.find(filter).sort({ createdAt: -1 });

  if (diagnoses && diagnoses.length > 0) {
    res.json(diagnoses);
  } else {
    res.json([]);
  }
});

// @desc    Get diagnosis by ID
// @route   GET /api/diagnoses/:id
// @access  Private/Doctor
const getDiagnosisById = asyncHandler(async (req, res) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  // Check if diagnosis exists
  if (!diagnosis) {
    res.status(404);
    throw new Error('Diagnosis not found');
  }

  // Check if user is authorized to view this diagnosis
  if (req.user.role === 'doctor' && diagnosis.created_by_user_id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this diagnosis');
  }

  res.json(diagnosis);
});

// @desc    Update diagnosis
// @route   PUT /api/diagnoses/:id
// @access  Private/Doctor
const updateDiagnosis = asyncHandler(async (req, res) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    res.status(404);
    throw new Error('Diagnosis not found');
  }

  // Check if user is authorized to update this diagnosis
  if (req.user.role === 'doctor' && diagnosis.created_by_user_id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this diagnosis');
  }

  diagnosis.diagnosis_text = req.body.diagnosis_text || diagnosis.diagnosis_text;

  const updatedDiagnosis = await diagnosis.save();
  res.json(updatedDiagnosis);
});

// @desc    Delete diagnosis
// @route   DELETE /api/diagnoses/:id
// @access  Private/Doctor
const deleteDiagnosis = asyncHandler(async (req, res) => {
  const diagnosis = await Diagnosis.findById(req.params.id);

  if (!diagnosis) {
    res.status(404);
    throw new Error('Diagnosis not found');
  }

  // Check if user is authorized to delete this diagnosis
  if (req.user.role === 'doctor' && diagnosis.created_by_user_id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this diagnosis');
  }

  await diagnosis.deleteOne();
  res.json({ message: 'Diagnosis removed' });
});

module.exports = {
  createDiagnosis,
  getDiagnoses,
  getDiagnosisByAppointmentId,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
};
