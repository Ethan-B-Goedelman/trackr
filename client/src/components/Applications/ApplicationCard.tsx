import React, { useState } from 'react';
import StatusChip from './StatusChip';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function ApplicationCard({ application, onEdit, onDelete, dragging, appsWithInterviews }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { company, role, location, salaryMin, salaryMax, dateApplied, status, jobUrl } = application;

  const salaryText =
    salaryMin || salaryMax
      ? [salaryMin, salaryMax].filter(Boolean).map((v) => `$${(v / 1000).toFixed(0)}k`).join(' – ')
      : null;

  return (
    <div
      className={`glass-card p-5 transition-all duration-200 ${
        dragging ? 'opacity-50 scale-95 shadow-2xl' : 'hover:shadow-card-hover hover:scale-[1.01]'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-800 truncate text-lg">{company}</h3>
          {appsWithInterviews?.has(application._id) && (
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" title="Has interview" />
          )}
      </div>
          <p className="text-gray-600 mt-0.5 truncate">{role}</p>
          {location && <p className="text-sm text-gray-400 mt-0.5 truncate">{location}</p>}
        </div>

        <div className="relative flex-shrink-0">
          <StatusChip status={status} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          {salaryText && (
            <span className="text-sm font-medium text-gray-600">{salaryText}</span>
          )}
          <span className="text-sm text-gray-400">
            {dateApplied ? dayjs(dateApplied).fromNow() : '—'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {jobUrl && (
            <a
              href={jobUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          <button
            onClick={() => onEdit(application)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(application)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
