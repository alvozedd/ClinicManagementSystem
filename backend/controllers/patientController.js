const asyncHandler = require('../middleware/asyncHandler');
const Patient = require('../models/patientModel');

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private/Doctor/Secretary
const createPatient = asyncHandler(async (req, res) => {
  const {
    name,
    gender,
    phone,
    next_of_kin_name,
    next_of_kin_relationship,
    next_of_kin_phone,
  } = req.body;

  const patient = await Patient.create({
    name,
    gender,
    phone,
    next_of_kin_name,
    next_of_kin_relationship,
    next_of_kin_phone,
    created_by_user_id: req.user._id,
  });

  if (patient) {
    res.status(201).json(patient);
  } else {
    res.status(400);
    throw new Error('Invalid patient data');
  }
});

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find({});
  res.json(patients);
});

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (patient) {
    res.json(patient);
  } else {
    res.status(404);
    throw new Error('Patient not found');
  }
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Doctor/Secretary
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (patient) {
    patient.name = req.body.name || patient.name;
    patient.gender = req.body.gender || patient.gender;
    patient.phone = req.body.phone || patient.phone;
    patient.next_of_kin_name = req.body.next_of_kin_name || patient.next_of_kin_name;
    patient.next_of_kin_relationship = req.body.next_of_kin_relationship || patient.next_of_kin_relationship;
    patient.next_of_kin_phone = req.body.next_of_kin_phone || patient.next_of_kin_phone;

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } else {
    res.status(404);
    throw new Error('Patient not found');
  }
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Doctor/Secretary
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (patient) {
    await patient.deleteOne();
    res.json({ message: 'Patient removed' });
  } else {
    res.status(404);
    throw new Error('Patient not found');
  }
});

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
