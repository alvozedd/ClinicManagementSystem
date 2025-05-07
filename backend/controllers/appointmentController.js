const asyncHandler = require('../middleware/asyncHandler');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Patient = require('../models/patientModel');

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
    notes,
    status: status || 'Scheduled',
    type: type || 'Consultation',
    reason
  };

  // Only add optional_time if it's explicitly provided
  if (optional_time) {
    appointmentData.optional_time = optional_time;
  }

  // Add created_by_user_id only if user is authenticated
  if (req.user) {
    appointmentData.created_by_user_id = req.user._id;
  }

  // Add createdBy field to track who created the appointment
  appointmentData.createdBy = createdBy || (req.user ? req.user.role : 'visitor');

  console.log('Final appointment data:', appointmentData);

  const appointment = await Appointment.create(appointmentData);

  if (appointment) {
    // Get patient details for notification message
    const patient = await Patient.findById(patient_id);
    const patientName = patient ? patient.name : 'A patient';

    // Create notifications for all doctors and secretaries
    try {
      // Find all doctors
      const doctors = await User.find({ role: 'doctor' });
      // Find all secretaries
      const secretaries = await User.find({ role: 'secretary' });

      // Create notifications for doctors
      for (const doctor of doctors) {
        await Notification.create({
          recipient_id: doctor._id,
          type: 'appointment_created',
          title: 'New Appointment',
          message: `${patientName} has booked an appointment for ${new Date(appointment_date).toLocaleDateString()}.`,
          related_id: appointment._id,
          related_model: 'Appointment',
          created_by: appointmentData.createdBy,
          created_by_user_id: req.user ? req.user._id : null,
        });
      }

      // Create notifications for secretaries
      for (const secretary of secretaries) {
        await Notification.create({
          recipient_id: secretary._id,
          type: 'appointment_created',
          title: 'New Appointment',
          message: `${patientName} has booked an appointment for ${new Date(appointment_date).toLocaleDateString()}.`,
          related_id: appointment._id,
          related_model: 'Appointment',
          created_by: appointmentData.createdBy,
          created_by_user_id: req.user ? req.user._id : null,
        });
      }

      console.log(`Created notifications for ${doctors.length} doctors and ${secretaries.length} secretaries`);
    } catch (error) {
      console.error('Error creating notifications:', error);
      // Don't throw error, just log it - we still want to return the appointment
    }

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

    // Create notifications for status changes
    if (req.body.status && req.body.status !== appointment.status) {
      try {
        // Get patient details for notification message
        const patient = await Patient.findById(appointment.patient_id);
        const patientName = patient ? patient.name : 'A patient';

        // Find all doctors and secretaries
        const doctors = await User.find({ role: 'doctor' });
        const secretaries = await User.find({ role: 'secretary' });

        // Create notifications for doctors
        for (const doctor of doctors) {
          // Skip notification for the user who made the change
          if (req.user && doctor._id.toString() === req.user._id.toString()) continue;

          await Notification.create({
            recipient_id: doctor._id,
            type: 'appointment_updated',
            title: 'Appointment Status Updated',
            message: `${patientName}'s appointment status has been changed to ${req.body.status}.`,
            related_id: appointment._id,
            related_model: 'Appointment',
            created_by: req.user ? req.user.role : 'system',
            created_by_user_id: req.user ? req.user._id : null,
          });
        }

        // Create notifications for secretaries
        for (const secretary of secretaries) {
          // Skip notification for the user who made the change
          if (req.user && secretary._id.toString() === req.user._id.toString()) continue;

          await Notification.create({
            recipient_id: secretary._id,
            type: 'appointment_updated',
            title: 'Appointment Status Updated',
            message: `${patientName}'s appointment status has been changed to ${req.body.status}.`,
            related_id: appointment._id,
            related_model: 'Appointment',
            created_by: req.user ? req.user.role : 'system',
            created_by_user_id: req.user ? req.user._id : null,
          });
        }

        console.log(`Created status update notifications for ${doctors.length} doctors and ${secretaries.length} secretaries`);
      } catch (error) {
        console.error('Error creating status update notifications:', error);
        // Don't throw error, just log it - we still want to return the appointment
      }
    }

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
