const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get dashboard statistics for the authenticated user
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Aggregated stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalApplications:
 *                       type: integer
 *                     responseRate:
 *                       type: integer
 *                     interviewsThisWeek:
 *                       type: integer
 *                     offersCount:
 *                       type: integer
 *                 statusBreakdown:
 *                   type: array
 *                 recentActivity:
 *                   type: array
 */
router.get('/', getStats);

module.exports = router;
