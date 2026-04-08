import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import api from '../../services/api';

const TYPES = ['Phone', 'Video', 'Technical', 'Onsite', 'Behavioral', 'Other'];

const TYPE_ICONS = {
  Phone: '📞', Video: '🎥', Technical: '💻',
  Onsite: '🏢', Behavioral: '🧠', Other: '📋',
};

export default function InterviewForm({ open, onClose, onSubmit, initial }) {
  const [applications, setApplications] = useState([]);

  const {
    register, handleSubmit, watch, setValue, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      application: '',
      scheduledAt: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
      type: 'Video',
      interviewerName: '',
      interviewerRole: '',
      location: '',
      prepNotes: '',
      reflection: '',
      rating: '',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (open) {
      api.get('/applications?limit=200').then((res) => setApplications(res.data.applications));
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        application: initial.application?._id ?? initial.application ?? '',
        scheduledAt: dayjs(initial.scheduledAt).format('YYYY-MM-DDTHH:mm'),
        type: initial.type || 'Video',
        interviewerName: initial.interviewerName || '',
        interviewerRole: initial.interviewerRole || '',
        location: initial.location || '',
        prepNotes: initial.prepNotes || '',
        reflection: initial.reflection || '',
        rating: initial.rating ?? '',
      });
    } else {
      reset({
        application: '',
        scheduledAt: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
        type: 'Video',
        interviewerName: '',
        interviewerRole: '',
        location: '',
        prepNotes: '',
        reflection: '',
        rating: '',
      });
    }
  }, [initial, open]);

  const handleFormSubmit = async (data) => {
    await onSubmit({
      application: data.application || undefined,
      scheduledAt: new Date(data.scheduledAt).toISOString(),
      type: data.type,
      interviewerName: data.interviewerName,
      interviewerRole: data.interviewerRole,
      location: data.location,
      prepNotes: data.prepNotes,
      reflection: data.reflection,
      rating: data.rating !== '' ? Number(data.rating) : undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-6">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeSlideUp_0.25s_ease_both]">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-4 space-y-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            {initial ? 'Edit Interview' : 'Schedule Interview'}
          </h2>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>

            {/* Application */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Application *</label>
              <select
                {...register('application', { required: 'Application is required' })}
                className="trackr-input"
              >
                <option value="">Select an application…</option>
                {applications.map((a) => (
                  <option key={a._id} value={a._id}>{a.company} — {a.role}</option>
                ))}
              </select>
              {errors.application && <p className="text-xs text-red-500 px-1">{errors.application.message}</p>}
            </div>

            {/* Date & Time */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Date & Time *</label>
              <input
                type="datetime-local"
                {...register('scheduledAt', { required: 'Date & time is required' })}
                className="trackr-input"
              />
              {errors.scheduledAt && <p className="text-xs text-red-500 px-1">{errors.scheduledAt.message}</p>}
            </div>

            {/* Type — segmented control */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Interview Type</label>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('type', t)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedType === t
                        ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {TYPE_ICONS[t]} {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Interviewer */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Interviewer Name</label>
                <input type="text" placeholder="Jane Smith" {...register('interviewerName')} className="trackr-input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Their Role</label>
                <input type="text" placeholder="Hiring Manager" {...register('interviewerRole')} className="trackr-input" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Location / Link</label>
              <input type="text" placeholder="Zoom link or office address" {...register('location')} className="trackr-input" />
            </div>

            {/* Prep Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Prep Notes</label>
              <textarea
                rows={3}
                placeholder="Topics to review, questions to ask…"
                {...register('prepNotes')}
                className="trackr-input resize-none"
              />
            </div>

            {/* Reflection */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Post-Interview Reflection</label>
              <textarea
                rows={3}
                placeholder="How did it go? What would you do differently?"
                {...register('reflection')}
                className="trackr-input resize-none"
              />
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Self-Rating</label>
              <div className="flex gap-2">
                {['', 1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setValue('rating', n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      watch('rating') === n
                        ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                        : 'bg-white/80 border border-gray-200 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {n === '' ? '—' : `${n}★`}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-gray-100 text-gray-700 font-medium rounded-2xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {initial ? 'Save Changes' : 'Schedule Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
