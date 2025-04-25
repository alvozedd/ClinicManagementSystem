const asyncHandler = require('../middleware/asyncHandler');
const Appointment = require('../models/appointmentModel');

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private/Doctor/Secretary
const createAppointment = asyncHandler(async (req, res) => {
  const { patient_id, appointment_date, optional_time, notes, status, type, reason, createdBy } = req.body;

  // Log the incoming request data for debugging
  console.log('Creating appointment with data:', {
    patient_id,
    appointment_date,
    status,
    type,
    createdBy,
    userRole: req.user ? req.user.role : 'none (visitor)'
  });

  // Create appointment data object
  const appointmentData = {
    patient_id,
    appointment_date,
    optional_time,
    notes,
    status: status || 'Scheduled',
    type: type || 'Consultation',
    reason
  };

  // Add created_by_user_id only if user is authenticated
  if (req.user) {
    appointmentData.created_by_user_id = req.user._id;
  }

  // Add createdBy field to track who created the appointment
  appointmentData.createdBy = createdBy || (req.user ? req.user.role : 'visitor');

  console.log('Final appointment data:', appointmentData);

  const appointment = await Appointment.create(appointmentData);

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
// @access  Private/Doctor/Secretary
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (appointment) {
    // Always update fields that are provided in the request body
    if (req.body.appointment_date !== undefined) {
      appointment.appointment_date = req.body.appointment_date;
    }

    if (req.body.optional_time !== undefined) {
      appointment.optional_time = req.body.optional_time;
    }

    if (req.body.notes !== undefined) {
      appointment.notes = req.body.notes;
    }

    // Update the new fields
    if (req.body.status !== undefined) {
      appointment.status = req.body.status;
    }

    if (req.body.type !== undefined) {
      appointment.type = req.body.type;
    }

    if (req.body.reason !== undefined) {
      appointment.reason = req.body.reason;
    }

    const updatedAppointment = await appointment.save();

    // Populate patient information before returning
    const populatedAppointment = await Appointment.findById(updatedAppointment._id).populate('patient_id', 'name');
    res.json(populatedAppointment);
  } else {
    res.status(404);
    throw new Error('Appointment not found');
  }
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Doctor/Secretary
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
