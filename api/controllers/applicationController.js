const Application = require('../models/Application');
const Contact = require('../models/Contact');
const Interview = require('../models/Interview');

// Escape special regex characters to prevent injection
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/applications
const getApplications = async (req, res, next) => {
  try {
    const { q, status, page = 1, limit = 20, sort = '-dateApplied' } = req.query;

    const filter = { user: req.user._id };

    if (status) filter.status = status;

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { company: searchRegex },
        { role: searchRegex },
        { location: searchRegex },
        { notes: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('contacts', 'name email phone company role')
        .lean(),
      Application.countDocuments(filter),
    ]);

    res.json({
      applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/applications
const createApplication = async (req, res, next) => {
  try {
    const {
      company,
      role,
      status,
      location,
      salaryMin,
      salaryMax,
      jobUrl,
      dateApplied,
      notes,
    } = req.body;

    const application = await Application.create({
      user: req.user._id,
      company,
      role,
      status,
      location,
      salaryMin,
      salaryMax,
      jobUrl,
      dateApplied,
      notes,
    });

    res.status(201).json({ application });
  } catch (err) {
    next(err);
  }
};

// GET /api/applications/:id
const getApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('contacts')
      .populate('interviews');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
};

// PUT /api/applications/:id
const updateApplication = async (req, res, next) => {
  try {
    const allowedFields = [
      'company', 'role', 'status', 'location',
      'salaryMin', 'salaryMax', 'jobUrl', 'dateApplied', 'notes',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/applications/:id
const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Cascade delete interviews for this application
    await Interview.deleteMany({ application: req.params.id });

    // Remove dangling application reference from any linked contacts
    await Contact.updateMany(
      { application: req.params.id },
      { $unset: { application: '' } }
    );

    res.json({ message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/applications/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getApplications,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
};
