const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getInterviews,
  createInterview,
  getInterview,
  updateInterview,
  deleteInterview,
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { INTERVIEW_TYPES } = require('../models/Interview');

router.use(protect);

router.get('/', getInterviews);

router.post(
  '/',
  [
    body('application').isMongoId().withMessage('Valid application ID is required'),
    body('scheduledAt').isISO8601().withMessage('Valid date/time is required'),
    body('type').optional().isIn(INTERVIEW_TYPES).withMessage(`Type must be one of: ${INTERVIEW_TYPES.join(', ')}`),
    body('rating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  ],
  validate,
  createInterview
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid interview ID')],
  validate,
  getInterview
);

router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid interview ID'),
    body('scheduledAt').optional().isISO8601().withMessage('Valid date/time is required'),
    body('type').optional().isIn(INTERVIEW_TYPES),
    body('rating').optional({ nullable: true }).isInt({ min: 1, max: 5 }),
  ],
  validate,
  updateInterview
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid interview ID')],
  validate,
  deleteInterview
);

module.exports = router;
