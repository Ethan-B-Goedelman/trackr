const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const {
  getApplications,
  createApplication,
  getApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { STATUS_VALUES } = require('../models/Application');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Applications
 *   description: Job application management
 */

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: List all applications (supports server-side search & pagination)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search term (searches company, role, location, notes on the server)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Applied, Phone Screen, Technical, Onsite, Offer, Accepted, Rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -dateApplied
 *     responses:
 *       200:
 *         description: Paginated list of applications
 *       401:
 *         description: Not authenticated
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  validate,
  getApplications
);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Create a new job application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, role]
 *             properties:
 *               company:
 *                 type: string
 *                 example: Acme Corp
 *               role:
 *                 type: string
 *                 example: Senior Software Engineer
 *               status:
 *                 type: string
 *                 enum: [Applied, Phone Screen, Technical, Onsite, Offer, Accepted, Rejected]
 *               location:
 *                 type: string
 *                 example: Remote
 *               salaryMin:
 *                 type: number
 *                 example: 120000
 *               salaryMax:
 *                 type: number
 *                 example: 160000
 *               jobUrl:
 *                 type: string
 *               dateApplied:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created
 *       400:
 *         description: Validation error
 */
router.post(
  '/',
  [
    body('company').trim().notEmpty().withMessage('Company is required'),
    body('role').trim().notEmpty().withMessage('Role is required'),
    body('status').optional().isIn(STATUS_VALUES).withMessage(`Status must be one of: ${STATUS_VALUES.join(', ')}`),
    body('salaryMin').optional().isNumeric().withMessage('Salary must be a number'),
    body('salaryMax').optional().isNumeric().withMessage('Salary must be a number'),
  ],
  validate,
  createApplication
);

/**
 * @swagger
 * /api/applications/{id}:
 *   get:
 *     summary: Get a single application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application details
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid application ID')],
  validate,
  getApplication
);

/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     summary: Update an application
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated application
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid application ID'),
    body('status').optional().isIn(STATUS_VALUES),
    body('salaryMin').optional().isNumeric(),
    body('salaryMax').optional().isNumeric(),
  ],
  validate,
  updateApplication
);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Delete an application (also deletes linked interviews)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid application ID')],
  validate,
  deleteApplication
);

// PATCH status only (used by Kanban drag-and-drop)
router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid application ID'),
    body('status').isIn(STATUS_VALUES).withMessage('Invalid status'),
  ],
  validate,
  updateStatus
);

module.exports = router;
