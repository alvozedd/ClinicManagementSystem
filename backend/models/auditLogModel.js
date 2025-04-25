const mongoose = require('mongoose');

/**
 * Audit Log Schema
 * Records all access to Protected Health Information (PHI) for HIPAA compliance
 */
const auditLogSchema = mongoose.Schema(
  {
    // Who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Can be null for system actions or unauthenticated access attempts
    },
    userName: {
      type: String,
      required: false,
    },
    userRole: {
      type: String,
      required: false,
    },
    // IP address of the user
    ipAddress: {
      type: String,
      required: true,
    },
    // What action was performed
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE', 'READ', 'UPDATE', 'DELETE', 
        'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
        'EXPORT', 'PRINT', 'SHARE',
        'PASSWORD_CHANGE', 'PASSWORD_RESET',
        'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED',
        'PHI_ACCESS', 'PHI_DISCLOSURE',
        'SYSTEM_EVENT'
      ],
    },
    // Description of the action
    description: {
      type: String,
      required: true,
    },
    // Resource type that was accessed (Patient, Appointment, Diagnosis, etc.)
    resourceType: {
      type: String,
      required: false,
    },
    // ID of the resource that was accessed
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    // Success or failure of the action
    status: {
      type: String,
      required: true,
      enum: ['SUCCESS', 'FAILURE', 'WARNING', 'INFO'],
    },
    // Additional data about the action (JSON)
    details: {
      type: Object,
      required: false,
    },
    // Request ID for tracing
    requestId: {
      type: String,
      required: false,
    },
    // User agent information
    userAgent: {
      type: String,
      required: false,
    },
    // Reason for access (if applicable)
    reason: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

// Index for faster queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
auditLogSchema.index({ status: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
