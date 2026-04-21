import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import StatusChip from '../components/Applications/StatusChip';

// ─── chart helpers ────────────────────────────────────────────────────────────

function groupByMonth(data: { _id: string; count: number }[]): Record<string, number> {
  const out: Record<string, number> = {};
  data.forEach(({ _id, count }) => { out[_id.slice(0, 7)] = (out[_id.slice(0, 7)] || 0) + count; });
  return out;
}

/** Build a 12-month chart for the current calendar year, filling gaps with 0. */
function buildChartData(chartActivity: any) {
  if (!chartActivity) return [];
  const apps = groupByMonth(chartActivity.applications ?? []);
  const ints = groupByMonth(chartActivity.interviews   ?? []);
  const cons = groupByMonth(chartActivity.contacts     ?? []);

  const year = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const month = `${year}-${String(i + 1).padStart(2, '0')}`;
    const label = new Date(year, i, 1).toLocaleDateString('en-US', { month: 'short' });
    return {
      name:         label,
      Applications: apps[month] || 0,
      Contacts:     cons[month] || 0,
      Interviews:   ints[month] || 0,
    };
  });
}

// ─── pipeline status config ───────────────────────────────────────────────────

const STATUS_CFG: Record<string, string> = {
  'Applied':      'bg-gray-400',
  'Phone Screen': 'bg-blue-400',
  'Technical':    'bg-purple-400',
  'Onsite':       'bg-yellow-400',
  'Offer':        'bg-green-400',
  'Accepted':     'bg-emerald-500',
  'Rejected':     'bg-red-400',
};
const STATUS_ORDER = ['Applied','Phone Screen','Technical','Onsite','Offer','Accepted','Rejected'];

// ─── custom tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey}
          </span>
          <span className="font-semibold text-gray-800">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── stat card ────────────────────────────────────────────────────────────────

function StatCard({ gradient, icon, value, label, sub }: {
  gradient: string; icon: React.ReactNode;
  value: number | undefined; label: string; sub: string;
}) {
  return (
    <div className={`${gradient} rounded-3xl p-3.5 shadow-card`}>
      <div className="bg-white/50 rounded-xl p-1.5 w-8 h-8 flex items-center justify-center mb-2.5">
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-800 leading-none">{value ?? '—'}</p>
      <p className="text-xs font-semibold text-gray-600 mt-0.5">{label}</p>
      <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user }                        = useAuth();
  const [stats,      setStats]          = useState<any>(null);
  const [recentApps, setRecentApps]     = useState<any[]>([]);
  const [staleApps,  setStaleApps]      = useState<any[]>([]);
  const [loading,    setLoading]        = useState(true);
  const [error,      setError]          = useState('');

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (user as any)?.firstName ?? '';

  useEffect(() => { document.title = 'Dashboard — Trackr'; }, []);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/applications?limit=3&sort=-dateApplied'),
      api.get('/applications?status=Applied&limit=100&sort=dateApplied'),
    ])
      .then(([s, a, applied]) => {
        setStats(s.data);
        setRecentApps(a.data.applications);
        // Filter for apps stuck in "Applied" for 14+ days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 14);
        const stale = (applied.data.applications ?? []).filter(
          (app: any) => app.dateApplied && new Date(app.dateApplied) < cutoff
        );
        setStaleApps(stale);
      })
      .catch(() => setError('Could not load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const chartData    = buildChartData(stats?.chartActivity);
  const nextInterview = stats?.nextInterview;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen p-5 space-y-4 pb-24 md:pb-5 page-enter">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {greeting}{firstName ? `, ${firstName}` : ''} 👋
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Here's your application progress</p>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          gradient="bg-gradient-to-br from-yellow-100 to-yellow-200"
          value={stats?.summary?.totalApplications}
          label="Applications" sub="total"
          icon={<svg className="w-4 h-4 text-yellow-700" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          gradient="bg-gradient-to-br from-pink-100 to-pink-200"
          value={stats?.summary?.upcomingInterviews}
          label="Interviews" sub="upcoming"
          icon={<svg className="w-4 h-4 text-pink-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <StatCard
          gradient="bg-gradient-to-br from-blue-100 to-blue-200"
          value={stats?.summary?.offersCount}
          label="Offers" sub="received"
          icon={<svg className="w-4 h-4 text-blue-600" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* ── Next Interview callout ──────────────────────────────────────────── */}
      {nextInterview && (
        <Link
          to="/interviews"
          className="flex items-center gap-3 glass-card px-4 py-3 hover:shadow-card-hover hover:scale-[1.01] transition-all duration-200"
        >
          <div className="w-9 h-9 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-pink-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-pink-500 uppercase tracking-wide">Next Interview</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {nextInterview.application?.company} — {nextInterview.type}
            </p>
          </div>
          <p className="text-xs text-gray-400 flex-shrink-0">
            {new Date(nextInterview.scheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {' · '}
            {new Date(nextInterview.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
          </p>
        </Link>
      )}

      {/* ── Activity chart ─────────────────────────────────────────────────── */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-4 h-4 text-yellow-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-800">Activity Overview — {new Date().getFullYear()}</h2>
        </div>

        {chartData.some(d => d.Applications + d.Contacts + d.Interviews > 0) ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gCon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gInt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f472b6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11, paddingTop: 10, color: '#6b7280' }} />
              <Area type="monotone" dataKey="Applications" stroke="#fbbf24" strokeWidth={2.5} fill="url(#gApps)" dot={false} activeDot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="Contacts"     stroke="#60a5fa" strokeWidth={2.5} fill="url(#gCon)"  dot={false} activeDot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} />
              <Area type="monotone" dataKey="Interviews"   stroke="#f472b6" strokeWidth={2.5} fill="url(#gInt)"  dot={false} activeDot={{ r: 4, fill: '#f472b6', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">
            No activity yet — start adding applications!
          </div>
        )}
      </div>

      {/* ── Follow-up Reminder ─────────────────────────────────────────────── */}
      {staleApps.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-gray-800">Follow-up Needed</h2>
            <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {staleApps.length}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            These applications have been in "Applied" for 14+ days with no response.
          </p>
          <div className="space-y-1.5">
            {staleApps.slice(0, 3).map((app: any) => {
              const daysAgo = Math.floor((Date.now() - new Date(app.dateApplied).getTime()) / 86_400_000);
              return (
                <Link
                  key={app._id}
                  to="/applications"
                  className="flex items-center gap-3 bg-amber-50/70 rounded-2xl px-3 py-2.5 hover:bg-amber-100/70 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{app.company}</p>
                    <p className="text-xs text-gray-500 truncate">{app.role}</p>
                  </div>
                  <p className="text-xs text-amber-600 font-semibold flex-shrink-0">{daysAgo}d ago</p>
                </Link>
              );
            })}
            {staleApps.length > 3 && (
              <Link
                to="/applications"
                className="text-xs text-amber-600 font-medium block text-center pt-1 hover:text-amber-700"
              >
                +{staleApps.length - 3} more — View all →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Pipeline + Recent (side by side on md+) ───────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Pipeline */}
        {stats?.statusBreakdown && stats.summary.totalApplications > 0 && (
          <div className="glass-card p-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Pipeline</h2>
            <div className="space-y-2">
              {STATUS_ORDER.map((status) => {
                const count = stats.statusBreakdown.find((s: any) => s.status === status)?.count ?? 0;
                if (!count) return null;
                const pct = Math.round((count / stats.summary.totalApplications) * 100);
                return (
                  <div key={status}>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[status]}`} />
                        {status}
                      </span>
                      <span className="text-gray-400 tabular-nums">{count} · {pct}%</span>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${STATUS_CFG[status]}`}
                        style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Applications */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <h2 className="text-sm font-semibold text-gray-800">Recent Applications</h2>
            <Link to="/applications" className="text-xs text-yellow-600 font-medium hover:text-yellow-700">
              See All →
            </Link>
          </div>
          <div className="space-y-2">
            {recentApps.length === 0 ? (
              <div className="glass-card p-6 text-center text-gray-400 text-sm">
                No applications yet.{' '}
                <Link to="/applications" className="text-yellow-600 font-medium">Add your first →</Link>
              </div>
            ) : (
              recentApps.map((app) => (
                <Link
                  key={app._id}
                  to="/applications"
                  className="flex items-center gap-3 glass-card px-4 py-3 hover:shadow-card-hover hover:scale-[1.01] transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{app.company}</p>
                    <p className="text-xs text-gray-500 truncate">{app.role}</p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <StatusChip status={app.status} />
                    <p className="text-[10px] text-gray-400">
                      {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Response rate ──────────────────────────────────────────────────── */}
      {stats?.summary?.responseRate !== undefined && (
        <div className="flex items-center gap-3 glass-card px-4 py-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-500" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{stats.summary.responseRate}% response rate</p>
            <p className="text-xs text-gray-400">Applications that moved past "Applied"</p>
          </div>
        </div>
      )}

    </div>
  );
}
