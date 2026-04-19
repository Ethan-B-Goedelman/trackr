const Application = require('../models/Application');
const Interview   = require('../models/Interview');
const Contact     = require('../models/Contact');
const { STATUS_VALUES } = require('../models/Application');

// GET /api/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    // Chart window: 5 months back → 2 months forward
    const chartStart = new Date(now);
    chartStart.setMonth(chartStart.getMonth() - 5);
    chartStart.setDate(1);
    chartStart.setHours(0, 0, 0, 0);

    const chartEnd = new Date(now);
    chartEnd.setMonth(chartEnd.getMonth() + 2);
    chartEnd.setDate(1);
    chartEnd.setHours(0, 0, 0, 0);

    const [
      totalApplications,
      statusBreakdown,
      upcomingInterviews,
      offersCount,
      appActivity,
      interviewActivity,
      contactActivity,
      nextInterview,
    ] = await Promise.all([

      // Total applications
      Application.countDocuments({ user: userId }),

      // Status breakdown
      Application.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),

      // All upcoming (future) interviews — fixes the "0 interviews" display bug
      Interview.countDocuments({
        user: userId,
        scheduledAt: { $gte: now },
      }),

      // Offers + Accepted
      Application.countDocuments({
        user: userId,
        status: { $in: ['Offer', 'Accepted'] },
      }),

      // Applications submitted per day (chart window)
      Application.aggregate([
        {
          $match: {
            user: userId,
            dateApplied: { $gte: chartStart, $lt: chartEnd },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$dateApplied' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Interviews scheduled per day (chart window)
      Interview.aggregate([
        {
          $match: {
            user: userId,
            scheduledAt: { $gte: chartStart, $lt: chartEnd },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$scheduledAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Contacts added per day (chart window)
      Contact.aggregate([
        {
          $match: {
            user: userId,
            createdAt: { $gte: chartStart, $lt: chartEnd },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Next upcoming interview (for dashboard callout)
      Interview.findOne({ user: userId, scheduledAt: { $gte: now } })
        .sort({ scheduledAt: 1 })
        .populate('application', 'company role')
        .lean(),
    ]);

    // Response rate = apps that moved past "Applied" / total
    const appliedOnly = statusBreakdown.find((s) => s._id === 'Applied')?.count || 0;
    const responseRate =
      totalApplications > 0
        ? Math.round(((totalApplications - appliedOnly) / totalApplications) * 100)
        : 0;

    // Fill all statuses with 0 if missing
    const statusMap = {};
    STATUS_VALUES.forEach((s) => (statusMap[s] = 0));
    statusBreakdown.forEach(({ _id, count }) => { statusMap[_id] = count; });

    res.json({
      summary: {
        totalApplications,
        responseRate,
        upcomingInterviews,
        offersCount,
      },
      statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
      chartActivity: {
        applications: appActivity,
        interviews:   interviewActivity,
        contacts:     contactActivity,
      },
      nextInterview,
      // backwards compat
      recentActivity: appActivity,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats };
