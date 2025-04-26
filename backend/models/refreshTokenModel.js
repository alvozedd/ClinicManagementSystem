const mongoose = require('mongoose');

const refreshTokenSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
    createdByIp: {
      type: String,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
refreshTokenSchema.index({ user: 1 });
refreshTokenSchema.index({ token: 1 });

// Add method to check if token is active
refreshTokenSchema.methods.isActive = function() {
  return !this.revoked && this.expires > new Date();
};

// Static method to revoke all other sessions for a user
refreshTokenSchema.statics.revokeOtherSessions = async function(userId, currentSessionId) {
  return this.updateMany(
    {
      user: userId,
      sessionId: { $ne: currentSessionId },
      revoked: false
    },
    {
      revoked: true,
      revokedReason: 'New session started'
    }
  );
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
