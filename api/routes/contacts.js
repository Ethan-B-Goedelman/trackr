const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', getContacts);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Contact name is required'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
    body('application').optional().isMongoId().withMessage('Invalid application ID'),
  ],
  validate,
  createContact
);

router.get('/:id', [param('id').isMongoId()], validate, getContact);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('email').optional().isEmail().normalizeEmail(),
    body('application').optional().isMongoId(),
  ],
  validate,
  updateContact
);

router.delete('/:id', [param('id').isMongoId()], validate, deleteContact);

module.exports = router;
