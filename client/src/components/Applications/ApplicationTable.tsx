import React, { useState } from 'react';
import StatusChip from './StatusChip';
import dayjs from 'dayjs';

const NON_SORTABLE = new Set(['actions', 'status', 'salary', 'contact']);

const COLS = [
  { id: 'company',     label: 'Company' },
  { id: 'role',        label: 'Role' },
  { id: 'status',      label: 'Status' },
  { id: 'location',    label: 'Location' },
  { id: 'salary',      label: 'Salary' },
  { id: 'contact',     label: 'Contact' },
  { id: 'dateApplied', label: 'Applied' },
  { id: 'actions',     label: '' },
];

export default function ApplicationTable({ applications, onEdit, onDelete, contactMap = {}, interviewSet = new Set() }) {
  const [orderBy, setOrderBy] = useState('dateApplied');
  const [order, setOrder] = useState('desc');

  const handleSort = (col) => {
    if (orderBy === col) setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    else { setOrderBy(col); setOrder('asc'); }
  };

  const sorted = [...applications].sort((a, b) => {
    let av = a[orderBy] ?? '', bv = b[orderBy] ?? '';
    if (orderBy === 'dateApplied') { av = new Date(av); bv = new Date(bv); }
    if (av < bv) return order === 'asc' ? -1 : 1;
    if (av > bv) return order === 'asc' ? 1 : -1;
    return 0;
  });

  if (applications.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-gray-400 text-sm">No applications yet — tap + to add one</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-yellow-50/60">
              {COLS.map((col) => (
                <th
                  key={col.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {!NON_SORTABLE.has(col.id) ? (
                    <button
                      onClick={() => handleSort(col.id)}
                      aria-label={`Sort by ${col.label}${orderBy === col.id ? `, currently ${order === 'asc' ? 'ascending' : 'descending'}` : ''}`}
                      className="flex items-center gap-1 hover:text-gray-800 transition-colors"
                    >
                      {col.label}
                      <span className="text-gray-300" aria-hidden="true">{orderBy === col.id ? (order === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </button>
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((app) => {
              const salaryText =
                app.salaryMin || app.salaryMax
                  ? [app.salaryMin, app.salaryMax]
                      .filter(Boolean)
                      .map((v) => `$${(v / 1000).toFixed(0)}k`)
                      .join(' – ')
                  : '—';
              const contactName = contactMap[app._id] ?? '—';
              const hasInterview = interviewSet.has(app._id);

              return (
                <tr key={app._id} className="hover:bg-yellow-50/40 transition-colors">
                  {/* Company + interview dot */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-800">{app.company}</span>
                      {hasInterview && (
                        <span
                          title="Interview scheduled"
                          className="flex-shrink-0 w-2 h-2 rounded-full bg-orange-400 ring-2 ring-orange-100"
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">{app.role}</td>
                  <td className="px-4 py-3.5"><StatusChip status={app.status} /></td>
                  <td className="px-4 py-3.5 text-gray-500">{app.location || '—'}</td>
                  {/* Salary */}
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{salaryText}</td>
                  {/* Contact */}
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{contactName}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {app.dateApplied ? dayjs(app.dateApplied).format('MMM D, YYYY') : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onEdit(app)}
                        aria-label={`Edit ${app.company} – ${app.role}`}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(app)}
                        aria-label={`Delete ${app.company} – ${app.role}`}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
