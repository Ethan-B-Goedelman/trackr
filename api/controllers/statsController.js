const Application = require('../models/Application');
const Interview = require('../models/Interview');
const { STATUS_VALUES } = require('../models/Application');

// GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Week boundaries
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const [
      totalApplications,
      statusBreakdown,
      interviewsThisWeek,
      offersCount,
      recentActivity,
    ] = await Promise.all([
      // Total applications
      Application.countDocuments({ user: userId }),

      // Status breakdown (for pie/bar chart)
      Application.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // Interviews this week
      Interview.countDocuments({
        user: userId,
        scheduledAt: { $gte: weekStart, $lt: weekEnd },
      }),

      // Offers received
      Application.countDocuments({
        user: userId,
        status: { $in: ['Offer', 'Accepted'] },
      }),

      // Applications per day for the last 30 days (activity chart)
      Application.aggregate([
        {
          $match: {
            user: userId,
            dateApplied: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$dateApplied' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Response rate = apps that moved past "Applied" / total
    const appliedOnly = statusBreakdown.find((s) => s._id === 'Applied')?.count || 0;
    const responseRate =
      totalApplications > 0
        ? Math.round(((totalApplications - appliedOnly) / totalApplications) * 100)
        : 0;

    // Fill in all statuses with 0 if missing
    const statusMap = {};
    STATUS_VALUES.forEach((s) => (statusMap[s] = 0));
    statusBreakdown.forEach(({ _id, count }) => {
      statusMap[_id] = count;
    });

    res.json({
      summary: {
        totalApplications,
        responseRate,
        interviewsThisWeek,
        offersCount,
      },
      statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
