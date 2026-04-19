const Contact = require('../models/Contact');
const Application = require('../models/Application');

// Escape special regex characters to prevent injection
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/contacts
const getContacts = async (req, res, next) => {
  try {
    const { q, applicationId, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };
    if (applicationId) filter.application = applicationId;

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { role: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      Contact.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('application', 'company role')
        .lean(),
      Contact.countDocuments(filter),
    ]);

    res.json({ contacts, pagination: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
};

// POST /api/contacts
const createContact = async (req, res, next) => {
  try {
    const { name, email, phone, company, role, linkedIn, notes, application: appId } = req.body;

    // If application is provided, verify it belongs to user
    if (appId) {
      const app = await Application.findOne({ _id: appId, user: req.user._id });
      if (!app) {
        return res.status(404).json({ error: 'Application not found' });
      }
    }

    const contact = await Contact.create({
      user: req.user._id,
      name,
      email,
      phone,
      company,
      role,
      linkedIn,
      notes,
      application: appId || null,
    });

    // Link contact to application if provided
    if (appId) {
      await Application.findByIdAndUpdate(appId, { $addToSet: { contacts: contact._id } });
    }

    res.status(201).json({ contact });
  } catch (err) {
    next(err);
  }
};

// GET /api/contacts/:id
const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate('application', 'company role status');

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ contact });
  } catch (err) {
    next(err);
  }
};

// PUT /api/contacts/:id
const updateContact = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'company', 'role', 'linkedIn', 'notes', 'application'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Fetch existing contact BEFORE updating so we can compare application links
    const existingContact = await Contact.findOne({ _id: req.params.id, user: req.user._id });
    if (!existingContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const oldAppId = existingContact.application ? existingContact.application.toString() : null;
    const newAppId = updates.application ? updates.application.toString() : null;

    const contact = await Contact.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    // Fix application contacts arrays when the linked application changes
    if (oldAppId !== newAppId) {
      // Remove contact from the old application's contacts array
      if (oldAppId) {
        await Application.findByIdAndUpdate(oldAppId, { $pull: { contacts: contact._id } });
      }
      // Add contact to the new application's contacts array (verify ownership first)
      if (newAppId) {
        const newApp = await Application.findOne({ _id: newAppId, user: req.user._id });
        if (newApp) {
          await Application.findByIdAndUpdate(newAppId, { $addToSet: { contacts: contact._id } });
        }
      }
    }

    res.json({ contact });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contacts/:id
const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Remove from application contacts array
    if (contact.application) {
      await Application.findByIdAndUpdate(contact.application, {
        $pull: { contacts: contact._id },
      });
    }

    res.json({ message: 'Contact deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContacts, createContact, getContact, updateContact, deleteContact };
