const asyncHandler = require('../middleware/asyncHandler');
const Diagnosis = require('../models/diagnosisModel');

// @desc    Create a new diagnosis
// @route   POST /api/diagnoses
// @access  Private/Doctor
const createDiagnosis = asyncHandler(async (req, res) => {
  const { appointment_id, diagnosis_text, treatment_plan, follow_up_instructions, medications, files } = req.body;

  console.log('Creating diagnosis with data:', req.body);

  // Validate required fields
  if (!appointment_id) {
    res.status(400);
    throw new Error('Appointment ID is required');
  }

  if (!diagnosis_text) {
    res.status(400);
    throw new Error('Diagnosis text is required');
  }

  // No longer check for existing diagnosis - allow multiple diagnoses per appointment

  try {
    const diagnosis = await Diagnosis.create({
      appointment_id,
      diagnosis_text,
      treatment_plan: treatment_plan || '',
      follow_up_instructions: follow_up_instructions || '',
      medications: medications || [],
      files: files || [],
      created_by_user_id: req.user._id,
    });

    if (diagnosis) {
      console.log('Diagnosis created successfully:', diagnosis);
      res.status(201).json(diagnosis);
    } else {
      res.status(400);
      throw new Error('Invalid diagnosis data');
    }
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    res.status(400);
    throw new Error(`Failed to create diagnosis: ${error.message}`);
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

// @desc    Get diagnoses by patient ID
// @route   GET /api/patients/:id/diagnoses
// @access  Private
const getDiagnosesByPatientId = asyncHandler(async (req, res) => {
  // First, find all appointments for this patient
  const Appointment = require('../models/appointmentModel');
  const patientId = req.params.id;

  console.log(`Fetching diagnoses for patient ID: ${patientId}`);

  const appointments = await Appointment.find({ patient_id: patientId });

  if (!appointments || appointments.length === 0) {
    console.log(`No appointments found for patient ID: ${patientId}`);
    return res.json([]);
  }

  console.log(`Found ${appointments.length} appointments for patient ID: ${patientId}`);

  // Get all appointment IDs
  const appointmentIds = appointments.map(app => app._id);

  // Create filter for diagnoses
  const filter = {
    appointment_id: { $in: appointmentIds }
  };

  // If user is a doctor, only return diagnoses created by them
  if (req.user.role === 'doctor') {
    filter.created_by_user_id = req.user._id;
  }

  // Find all diagnoses for these appointments
  const diagnoses = await Diagnosis.find(filter)
    .populate({
      path: 'appointment_id',
      match: { patient_id: patientId }, // Extra check to ensure we only get diagnoses for this patient
      select: 'appointment_date status type reason patient_id',
      populate: {
        path: 'patient_id',
        select: 'name'
      }
    })
    .sort({ createdAt: -1 });

  // Filter out any diagnoses where the appointment_id is null (meaning it didn't match our patient)
  const filteredDiagnoses = diagnoses.filter(diagnosis => diagnosis.appointment_id !== null);

  console.log(`Found ${filteredDiagnoses.length} diagnoses for patient ID: ${patientId}`);

  res.json(filteredDiagnoses);
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
  try {
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

    console.log('Updating diagnosis with data:', req.body);

    // Update all fields
    diagnosis.diagnosis_text = req.body.diagnosis_text || diagnosis.diagnosis_text;
    diagnosis.treatment_plan = req.body.treatment_plan !== undefined ? req.body.treatment_plan : diagnosis.treatment_plan;
    diagnosis.follow_up_instructions = req.body.follow_up_instructions !== undefined ? req.body.follow_up_instructions : diagnosis.follow_up_instructions;

    // Update medications if provided
    if (req.body.medications) {
      diagnosis.medications = req.body.medications;
    }

    // Update files if provided
    if (req.body.files) {
      diagnosis.files = req.body.files;
    }

    const updatedDiagnosis = await diagnosis.save();
    console.log('Diagnosis updated successfully:', updatedDiagnosis);
    res.json(updatedDiagnosis);
  } catch (error) {
    console.error('Error updating diagnosis:', error);
    res.status(400);
    throw new Error(`Failed to update diagnosis: ${error.message}`);
  }
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
  getDiagnosesByPatientId,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
};
