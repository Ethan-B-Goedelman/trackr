import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

export default function ActivityChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px]">
        <p className="text-sm text-gray-400">No activity yet</p>
      </div>
    );
  }

  const formatted = data.map((d) => ({
    date: dayjs(d._id).format('MMM D'),
    Applications: d.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, fontSize: 13, border: '1px solid #f3f4f6' }}
        />
        <Area
          type="monotone"
          dataKey="Applications"
          stroke="#fbbf24"
          strokeWidth={2.5}
          fill="url(#colorApps)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
