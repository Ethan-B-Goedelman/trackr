const mongoose = require('mongoose');

const INTERVIEW_TYPES = ['Phone', 'Video', 'Technical', 'Onsite', 'Behavioral', 'Other'];

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: [true, 'Application reference is required'],
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Interview date/time is required'],
    },
    type: {
      type: String,
      enum: {
        values: INTERVIEW_TYPES,
        message: `Type must be one of: ${INTERVIEW_TYPES.join(', ')}`,
      },
      default: 'Video',
    },
    interviewerName: {
      type: String,
      trim: true,
      maxlength: [100, 'Interviewer name cannot exceed 100 characters'],
    },
    interviewerRole: {
      type: String,
      trim: true,
      maxlength: [100, 'Interviewer role cannot exceed 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    prepNotes: {
      type: String,
      maxlength: [10000, 'Prep notes cannot exceed 10000 characters'],
    },
    reflection: {
      type: String,
      maxlength: [10000, 'Reflection cannot exceed 10000 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

interviewSchema.index({ user: 1, scheduledAt: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
module.exports.INTERVIEW_TYPES = INTERVIEW_TYPES;
