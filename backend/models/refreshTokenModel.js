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

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
