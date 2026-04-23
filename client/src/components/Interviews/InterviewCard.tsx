import React from 'react';
import dayjs from 'dayjs';

const TYPE_COLORS = {
  Phone:      { bg: 'bg-sky-100',    text: 'text-sky-600' },
  Video:      { bg: 'bg-violet-100', text: 'text-violet-600' },
  Technical:  { bg: 'bg-amber-100',  text: 'text-amber-600' },
  Onsite:     { bg: 'bg-emerald-100',text: 'text-emerald-600' },
  Behavioral: { bg: 'bg-pink-100',   text: 'text-pink-600' },
  Other:      { bg: 'bg-gray-100',   text: 'text-gray-500' },
};


export default function InterviewCard({ interview, onEdit, onDelete }) {
  const { application, scheduledAt, type, interviewerName, interviewerRole, location, rating } = interview;
  const isPast = dayjs(scheduledAt).isBefore(dayjs());
  const colors = TYPE_COLORS[type] ?? TYPE_COLORS.Other;

  return (
    <div className={`glass-card p-4 transition-all duration-200 hover:shadow-card-hover hover:scale-[1.01] ${isPast ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text}`}>
              {type}
            </span>
            {isPast && (
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-400">Past</span>
            )}
            {rating && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                {rating}/5 ⭐
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 truncate">{application?.company ?? 'Unknown Company'}</h3>
          {application?.role && (
            <p className="text-sm text-gray-500 truncate">{application.role}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(interview)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(interview)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-sm font-semibold text-gray-700">
          {dayjs(scheduledAt).format('ddd, MMM D · h:mm A')}
        </p>
        {interviewerName && (
          <p className="text-sm text-gray-500">
            with {interviewerName}{interviewerRole ? ` (${interviewerRole})` : ''}
          </p>
        )}
        {location && (
          <p className="text-sm text-gray-400 truncate">📍 {location}</p>
        )}
      </div>
    </div>
  );
}
