import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusChip from '../components/Applications/StatusChip';

// Update browser tab title for this page
const PAGE_TITLE = 'Dashboard — Trackr';

function StatCard({ gradient, iconBg, icon, value, label }) {
  return (
    <div className={`${gradient} rounded-3xl p-4 shadow-card`}>
      <div className={`${iconBg} bg-white/50 backdrop-blur-sm rounded-2xl p-2 w-10 h-10 flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-semibold text-gray-800">{value ?? '—'}</div>
      <div className="text-xs text-gray-600 mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => { document.title = PAGE_TITLE; }, []);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/applications?limit=3&sort=-dateApplied'),
    ])
      .then(([statsRes, appsRes]) => {
        setStats(statsRes.data);
        setRecentApps(appsRes.data.applications);
      })
      .catch(() => setError('Could not load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  // Build chart data from recentActivity or use fallback shape
  const chartData = (stats?.recentActivity ?? []).map((d) => ({
    name: d._id,
    applications: d.count,
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 pb-24 md:pb-6 page-enter">

      {/* Header */}
      <div className="pt-2">
        <h1 className="text-3xl font-semibold text-gray-800">{greeting} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Here's your application progress</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          gradient="bg-gradient-to-br from-yellow-100 to-yellow-200"
          icon={
            <svg className="w-5 h-5 text-yellow-700" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          value={stats?.summary?.totalApplications}
          label="Total"
        />
        <StatCard
          gradient="bg-gradient-to-br from-pink-100 to-pink-200"
          icon={
            <svg className="w-5 h-5 text-pink-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          value={stats?.summary?.interviewsThisWeek}
          label="Interviews"
        />
        <StatCard
          gradient="bg-gradient-to-br from-blue-100 to-blue-200"
          icon={
            <svg className="w-5 h-5 text-blue-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          value={stats?.summary?.offersCount}
          label="Offers"
        />
      </div>

      {/* Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h3 className="font-semibold text-gray-800">Application Activity</h3>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#fbbf24"
                strokeWidth={3}
                dot={{ fill: '#fbbf24', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#fbbf24' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
            No activity yet — start adding applications!
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Recent Applications</h3>
          <Link to="/applications" className="text-sm text-yellow-600 font-medium hover:text-yellow-700 transition-colors">
            See All →
          </Link>
        </div>

        <div className="space-y-3">
          {recentApps.length === 0 ? (
            <div className="glass-card p-6 text-center text-gray-400 text-sm">
              No applications yet.{' '}
              <Link to="/applications" className="text-yellow-600 font-medium">Add your first one →</Link>
            </div>
          ) : (
            recentApps.map((app) => (
              <Link
                key={app._id}
                to="/applications"
                className="block glass-card p-4 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 truncate">{app.company}</h4>
                    <p className="text-sm text-gray-500 truncate">{app.role}</p>
                  </div>
                  <StatusChip status={app.status} />
                </div>
                <p className="text-xs text-gray-400">
                  {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Response rate pill */}
      {stats?.summary?.responseRate !== undefined && (
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-peach-100 to-peach-200 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-peach-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{stats.summary.responseRate}% response rate</p>
            <p className="text-xs text-gray-500">Applications that moved past "Applied"</p>
          </div>
        </div>
      )}
    </div>
  );
}
