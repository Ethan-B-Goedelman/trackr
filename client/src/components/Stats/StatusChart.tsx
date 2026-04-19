import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = {
  'Applied':      '#94a3b8',
  'Phone Screen': '#38bdf8',
  'Technical':    '#a78bfa',
  'Onsite':       '#fbbf24',
  'Offer':        '#34d399',
  'Accepted':     '#059669',
  'Rejected':     '#f87171',
};

export default function StatusChart({ data }) {
  const filtered = data.filter((d) => d.count > 0);

  if (filtered.length === 0) {
    return (
      <div className="flex items-center justify-center h-[220px]">
        <p className="text-sm text-gray-400">No data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={filtered}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {filtered.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val, name) => [val, name]}
          contentStyle={{ borderRadius: 12, fontSize: 13, border: '1px solid #f3f4f6' }}
        />
        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
