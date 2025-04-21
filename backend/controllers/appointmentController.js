const asyncHandler = require('../middleware/asyncHandler');
const Appointment = require('../models/appointmentModel');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/Secretary
const createAppointment = asyncHandler(async (req, res) => {
  const { patient_id, appointment_date, optional_time, notes } = req.body;

  const appointment = await Appointment.create({
    patient_id,
    appointment_date,
    optional_time,
    notes,
    created_by_user_id: req.user._id,
  });

  if (appointment) {
    res.status(201).json(appointment);
  } else {
    res.status(400);
    throw new Error('Invalid appointment data');
  }
});

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({}).populate('patient_id', 'name');
  res.json(appointments);
});

// @desc    Get appointments by patient ID
// @route   GET /api/appointments/patient/:id
// @access  Private
const getAppointmentsByPatientId = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patient_id: req.params.id }).populate('patient_id', 'name');

  if (appointments) {
    res.json(appointments);
  } else {
    res.status(404);
    throw new Error('No appointments found for this patient');
  }
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('patient_id', 'name');

  if (appointment) {
    res.json(appointment);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private/Secretary
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    appointment.appointment_date = req.body.appointment_date || appointment.appointment_date;
    appointment.optional_time = req.body.optional_time || appointment.optional_time;
    appointment.notes = req.body.notes || appointment.notes;

    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Secretary
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    await appointment.deleteOne();
    res.json({ message: 'Appointment removed' });
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentsByPatientId,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
