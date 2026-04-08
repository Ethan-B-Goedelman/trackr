const mongoose = require('mongoose');

const STATUS_VALUES = [
  'Applied',
  'Phone Screen',
  'Technical',
  'Onsite',
  'Offer',
  'Accepted',
  'Rejected',
];

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    role: {
      type: String,
      required: [true, 'Role/position is required'],
      trim: true,
      maxlength: [100, 'Role cannot exceed 100 characters'],
    },
    status: {
      type: String,
      enum: {
        values: STATUS_VALUES,
        message: `Status must be one of: ${STATUS_VALUES.join(', ')}`,
      },
      default: 'Applied',
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    salaryMin: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    salaryMax: {
      type: Number,
      min: [0, 'Salary cannot be negative'],
    },
    jobUrl: {
      type: String,
      trim: true,
    },
    dateApplied: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: interviews linked to this application
applicationSchema.virtual('interviews', {
  ref: 'Interview',
  localField: '_id',
  foreignField: 'application',
});

// Compound index for fast search per user
applicationSchema.index({ user: 1, company: 'text', role: 'text', location: 'text' });
applicationSchema.index({ user: 1, status: 1 });
applicationSchema.index({ user: 1, dateApplied: -1 });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUS_VALUES = STATUS_VALUES;
