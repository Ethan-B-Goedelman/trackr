import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import api from '../services/api';

const TYPE_COLORS = {
  Phone:      { dot: 'bg-sky-400',     bar: 'bg-sky-100 border-sky-400 text-sky-700' },
  Video:      { dot: 'bg-violet-400',  bar: 'bg-violet-100 border-violet-400 text-violet-700' },
  Technical:  { dot: 'bg-amber-400',   bar: 'bg-amber-100 border-amber-400 text-amber-700' },
  Onsite:     { dot: 'bg-emerald-400', bar: 'bg-emerald-100 border-emerald-400 text-emerald-700' },
  Behavioral: { dot: 'bg-pink-400',    bar: 'bg-pink-100 border-pink-400 text-pink-700' },
  Other:      { dot: 'bg-gray-400',    bar: 'bg-gray-100 border-gray-400 text-gray-600' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const from = currentMonth.toISOString();
    const to = currentMonth.endOf('month').toISOString();
    setLoading(true);
    api
      .get(`/interviews?from=${from}&to=${to}&limit=200`)
      .then((res) => setInterviews(res.data.interviews))
      .catch(() => setError('Failed to load interviews'))
      .finally(() => setLoading(false));
  }, [currentMonth]);

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfWeek = currentMonth.day();
  const today = dayjs();

  const interviewsByDay = {};
  interviews.forEach((iv) => {
    const d = dayjs(iv.scheduledAt).date();
    if (!interviewsByDay[d]) interviewsByDay[d] = [];
    interviewsByDay[d].push(iv);
  });

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedInterviews = selectedDay ? (interviewsByDay[selectedDay] ?? []) : [];

  return (
    <div className="min-h-screen p-6 space-y-6 pb-24 md:pb-6">

      {/* Header */}
      <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-3xl font-semibold text-gray-800">Calendar</h2>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setCurrentMonth(dayjs().startOf('month')); setSelectedDay(null); }}
            className="px-3 py-2 text-sm font-medium bg-white/80 border border-gray-200 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 text-gray-600"
          >
            Today
          </button>
          <button
            onClick={() => { setCurrentMonth((m) => m.subtract(1, 'month')); setSelectedDay(null); }}
            className="p-2 bg-white/80 border border-gray-200 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-semibold text-gray-800 min-w-[140px] text-center">
            {currentMonth.format('MMMM YYYY')}
          </span>
          <button
            onClick={() => { setCurrentMonth((m) => m.add(1, 'month')); setSelectedDay(null); }}
            className="p-2 bg-white/80 border border-gray-200 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-200 text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center pt-12">
          <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Calendar grid */}
          <div className="glass-card overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-yellow-50/60">
              {DAYS.map((d) => (
                <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {d}
                </div>
              ))}
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                const isToday =
                  day &&
                  today.date() === day &&
                  today.month() === currentMonth.month() &&
                  today.year() === currentMonth.year();
                const isSelected = day && selectedDay === day;
                const dayInterviews = day ? (interviewsByDay[day] ?? []) : [];

                return (
                  <div
                    key={idx}
                    onClick={() => day && setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[72px] md:min-h-[90px] p-1.5 border-b border-r border-gray-50 transition-colors ${
                      day ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-yellow-50' : day ? 'hover:bg-gray-50/80' : 'bg-gray-50/30'}`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-center mb-1">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                              isToday
                                ? 'bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                                : isSelected
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'text-gray-700'
                            }`}
                          >
                            {day}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          {dayInterviews.slice(0, 2).map((iv) => {
                            const c = TYPE_COLORS[iv.type] ?? TYPE_COLORS.Other;
                            return (
                              <div
                                key={iv._id}
                                className={`text-[10px] font-medium px-1 py-0.5 rounded border-l-2 truncate ${c.bar}`}
                              >
                                {dayjs(iv.scheduledAt).format('h:mm')} {iv.application?.company}
                              </div>
                            );
                          })}
                          {dayInterviews.length > 2 && (
                            <div className="text-[10px] text-gray-400 px-1">+{dayInterviews.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="glass-card p-5 space-y-3">
              <h3 className="font-semibold text-gray-800">
                {currentMonth.date(selectedDay).format('dddd, MMMM D')}
              </h3>
              {selectedInterviews.length === 0 ? (
                <p className="text-sm text-gray-400">No interviews scheduled</p>
              ) : (
                <div className="space-y-2">
                  {selectedInterviews.map((iv) => {
                    const c = TYPE_COLORS[iv.type] ?? TYPE_COLORS.Other;
                    return (
                      <div key={iv._id} className={`flex items-start gap-3 p-3 rounded-2xl border-l-4 ${c.bar}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm">{iv.application?.company ?? 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{iv.application?.role}</p>
                          <p className="text-xs font-medium text-gray-600 mt-0.5">
                            {iv.type} · {dayjs(iv.scheduledAt).format('h:mm A')}
                          </p>
                          {iv.interviewerName && (
                            <p className="text-xs text-gray-400">with {iv.interviewerName}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
