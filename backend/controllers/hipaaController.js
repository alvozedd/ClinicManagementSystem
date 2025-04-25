/**
 * HIPAA Compliance Controller
 * Handles HIPAA-related functionality like audit logs, data export, and breach reporting
 */
const asyncHandler = require('../middleware/asyncHandler');
const AuditLog = require('../models/auditLogModel');
const Patient = require('../models/patientModel');
const Appointment = require('../models/appointmentModel');
const Diagnosis = require('../models/diagnosisModel');
const auditService = require('../utils/auditService');
const logger = require('../utils/logger');

/**
 * @desc    Get audit logs with filtering and pagination
 * @route   GET /api/hipaa/audit-logs
 * @access  Private/Admin
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  // Extract query parameters
  const {
    page = 1,
    limit = 20,
    startDate,
    endDate,
    user,
    action,
    resourceType,
    resourceId,
    status,
  } = req.query;

  // Build filter object
  const filter = {};

  // Add date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Add other filters
  if (user) filter.user = user;
  if (action) filter.action = action;
  if (resourceType) filter.resourceType = resourceType;
  if (resourceId) filter.resourceId = resourceId;
  if (status) filter.status = status;

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get total count
  const total = await AuditLog.countDocuments(filter);

  // Get audit logs
  const auditLogs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Log this access to audit logs
  await auditService.logAuditEvent({
    req,
    action: 'READ',
    description: 'Retrieved audit logs',
    resourceType: 'AuditLog',
    status: 'SUCCESS',
    details: { filter, page, limit },
  });

  // Return audit logs with pagination info
  res.json({
    auditLogs,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    totalItems: total,
  });
});

/**
 * @desc    Export patient data in HIPAA-compliant format
 * @route   GET /api/hipaa/export/patient/:id
 * @access  Private/Doctor/Admin
 */
const exportPatientData = asyncHandler(async (req, res) => {
  const patientId = req.params.id;

  // Get patient data
  const patient = await Patient.findById(patientId);

  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  // Get patient appointments
  const appointments = await Appointment.find({ patient_id: patientId });

  // Get patient diagnoses
  const diagnoses = await Diagnosis.find({
    appointment_id: { $in: appointments.map(a => a._id) },
  });

  // Create export data
  const exportData = {
    patient: {
      id: patient._id,
      name: patient.name,
      gender: patient.gender,
      phone: patient.phone,
      year_of_birth: patient.year_of_birth,
      next_of_kin: {
        name: patient.next_of_kin_name,
        relationship: patient.next_of_kin_relationship,
        phone: patient.next_of_kin_phone,
      },
      created_at: patient.createdAt,
      updated_at: patient.updatedAt,
    },
    appointments: appointments.map(appointment => ({
      id: appointment._id,
      date: appointment.appointment_date,
      time: appointment.optional_time,
      status: appointment.status,
      type: appointment.type,
      reason: appointment.reason,
      notes: appointment.notes,
      created_at: appointment.createdAt,
      updated_at: appointment.updatedAt,
    })),
    diagnoses: diagnoses.map(diagnosis => ({
      id: diagnosis._id,
      appointment_id: diagnosis.appointment_id,
      diagnosis_text: diagnosis.diagnosis_text,
      created_at: diagnosis.createdAt,
      updated_at: diagnosis.updatedAt,
    })),
    export_info: {
      exported_at: new Date(),
      exported_by: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    },
  };

  // Log this export to audit logs
  await auditService.logPhiDisclosure(
    req,
    'Patient',
    patientId,
    'Exported patient data',
    {
      exportFormat: 'JSON',
      exportedData: ['patient', 'appointments', 'diagnoses'],
      recipient: req.user.name,
    }
  );

  // Set filename for download
  const filename = `patient_${patientId}_export_${new Date().toISOString().split('T')[0]}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/json');

  // Return export data
  res.json(exportData);
});

/**
 * @desc    Report a potential breach of PHI
 * @route   POST /api/hipaa/breach-report
 * @access  Private
 */
const reportBreach = asyncHandler(async (req, res) => {
  const { description, affectedData, dateDiscovered, additionalDetails } = req.body;

  // Validate input
  if (!description) {
    res.status(400);
    throw new Error('Description is required');
  }

  // Log the breach report to audit logs
  const auditLog = await auditService.logAuditEvent({
    req,
    action: 'SYSTEM_EVENT',
    description: 'Potential breach reported',
    status: 'WARNING',
    details: {
      description,
      affectedData,
      dateDiscovered,
      additionalDetails,
      reportedBy: req.user ? req.user._id : null,
    },
  });

  // In a real system, you would also:
  // 1. Send notifications to security officers
  // 2. Start the breach assessment process
  // 3. Potentially lock down affected resources

  // Return success
  res.status(201).json({
    message: 'Breach report submitted successfully',
    reportId: auditLog._id,
  });
});

/**
 * @desc    Get HIPAA compliance status
 * @route   GET /api/hipaa/compliance-status
 * @access  Private/Admin
 */
const getComplianceStatus = asyncHandler(async (req, res) => {
  // In a real system, you would check various compliance metrics
  // For this demo, we'll return a mock status

  // Log this access
  await auditService.logSystemEvent(
    req,
    'Compliance status checked',
    { checkType: 'HIPAA' }
  );

  res.json({
    status: 'compliant',
    lastChecked: new Date(),
    metrics: {
      auditLogging: 'enabled',
      encryption: 'enabled',
      accessControls: 'implemented',
      backups: 'configured',
      sessionTimeout: `${Math.floor(require('../middleware/sessionTimeoutMiddleware').SESSION_TIMEOUT / 60000)} minutes`,
    },
    recommendations: [
      'Consider implementing automatic backup verification',
      'Review user access permissions quarterly',
    ],
  });
});

module.exports = {
  getAuditLogs,
  exportPatientData,
  reportBreach,
  getComplianceStatus,
};
