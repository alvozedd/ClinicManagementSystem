const asyncHandler = require('../middleware/asyncHandler');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');
const Diagnosis = require('../models/diagnosisModel');

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private/Doctor/Secretary
const createPatient = asyncHandler(async (req, res) => {
  const {
    name,
    gender,
    phone,
    year_of_birth,
    next_of_kin_name,
    next_of_kin_relationship,
    next_of_kin_phone,
    medicalHistory,
    allergies,
    medications,
  } = req.body;

  const patient = await Patient.create({
    name,
    gender,
    phone,
    year_of_birth,
    next_of_kin_name,
    next_of_kin_relationship,
    next_of_kin_phone,
    medicalHistory: medicalHistory || [],
    allergies: allergies || [],
    medications: medications || [],
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
    // Update basic patient information
    patient.name = req.body.name || patient.name;
    patient.gender = req.body.gender || patient.gender;
    patient.phone = req.body.phone || patient.phone;

    // Update year of birth if provided
    if (req.body.year_of_birth !== undefined) {
      patient.year_of_birth = req.body.year_of_birth;
    }

    patient.next_of_kin_name = req.body.next_of_kin_name || patient.next_of_kin_name;
    patient.next_of_kin_relationship = req.body.next_of_kin_relationship || patient.next_of_kin_relationship;
    patient.next_of_kin_phone = req.body.next_of_kin_phone || patient.next_of_kin_phone;

    // Update medical history if provided
    if (req.body.medicalHistory) {
      patient.medicalHistory = req.body.medicalHistory;
    }

    // Update allergies if provided
    if (req.body.allergies) {
      patient.allergies = req.body.allergies;
    }

    // Update medications if provided
    if (req.body.medications) {
      patient.medications = req.body.medications;
    }

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } else {
    res.status(404);
    throw new Error('Patient not found');
  }
});

// @desc    Delete patient and all associated data (appointments, diagnoses)
// @route   DELETE /api/patients/:id
// @access  Private/Doctor/Secretary
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);

  if (patient) {
    // Step 1: Find all appointments for this patient
    const appointments = await Appointment.find({ patient_id: patient._id });
    console.log(`Found ${appointments.length} appointments for patient ${patient._id}`);

    // Step 2: For each appointment, delete associated diagnoses
    for (const appointment of appointments) {
      const diagnoses = await Diagnosis.find({ appointment_id: appointment._id });
      console.log(`Found ${diagnoses.length} diagnoses for appointment ${appointment._id}`);

      // Delete all diagnoses for this appointment
      if (diagnoses.length > 0) {
        await Diagnosis.deleteMany({ appointment_id: appointment._id });
        console.log(`Deleted all diagnoses for appointment ${appointment._id}`);
      }
    }

    // Step 3: Delete all appointments for this patient
    if (appointments.length > 0) {
      await Appointment.deleteMany({ patient_id: patient._id });
      console.log(`Deleted all appointments for patient ${patient._id}`);
    }

    // Step 4: Finally delete the patient
    await patient.deleteOne();
    console.log(`Deleted patient ${patient._id}`);

    res.json({
      message: 'Patient and all associated data removed',
      deletedAppointments: appointments.length,
      deletedDiagnoses: appointments.reduce((total, appointment) => {
        return total + (appointment.diagnosesCount || 0);
      }, 0)
    });
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
