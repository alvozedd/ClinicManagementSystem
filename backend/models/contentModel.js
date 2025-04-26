const mongoose = require('mongoose');

const contentSchema = mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ['footer', 'header', 'homepage', 'services', 'contact'],
      index: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['text', 'longtext', 'link', 'image', 'html'],
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: function() {
        return this.type !== 'link';
      },
    },
    url: {
      type: String,
      required: function() {
        return this.type === 'link';
      },
    },
    order: {
      type: Number,
      default: 0,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    updated_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for faster queries
contentSchema.index({ section: 1, category: 1, order: 1 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
