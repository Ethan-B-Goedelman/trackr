const Interview = require('../models/Interview');
const Application = require('../models/Application');

// GET /api/interviews
const getInterviews = async (req, res, next) => {
  try {
    const { applicationId, from, to, page = 1, limit = 50 } = req.query;

    const filter = { user: req.user._id };
    if (applicationId) filter.application = applicationId;
    if (from || to) {
      filter.scheduledAt = {};
      if (from) filter.scheduledAt.$gte = new Date(from);
      if (to) filter.scheduledAt.$lte = new Date(to);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [interviews, total] = await Promise.all([
      Interview.find(filter)
        .sort({ scheduledAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('application', 'company role status')
        .lean(),
      Interview.countDocuments(filter),
    ]);

    res.json({ interviews, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
};

// POST /api/interviews
const createInterview = async (req, res, next) => {
  try {
    const { application: appId, scheduledAt, type, interviewerName, interviewerRole, location, prepNotes } = req.body;

    // Verify application belongs to user
    const app = await Application.findOne({ _id: appId, user: req.user._id });
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const interview = await Interview.create({
      user: req.user._id,
      application: appId,
      scheduledAt,
      type,
      interviewerName,
      interviewerRole,
      location,
      prepNotes,
    });

    const populated = await Interview.findById(interview._id)
      .populate('application', 'company role status');

    res.status(201).json({ interview: populated });
  } catch (err) {
    next(err);
  }
};

// GET /api/interviews/:id
const getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('application', 'company role status location');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ interview });
  } catch (err) {
    next(err);
  }
};

// PUT /api/interviews/:id
const updateInterview = async (req, res, next) => {
  try {
    const allowedFields = [
      'scheduledAt', 'type', 'interviewerName', 'interviewerRole',
      'location', 'prepNotes', 'reflection', 'rating',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    ).populate('application', 'company role status');

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ interview });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ message: 'Interview deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInterviews, createInterview, getInterview, updateInterview, deleteInterview };
