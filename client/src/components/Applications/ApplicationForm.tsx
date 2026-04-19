import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

const STATUSES = ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];

export default function ApplicationForm({ open, onClose, onSubmit, initial }) {
  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      company: '', role: '', status: 'Applied', location: '',
      salaryMin: '', salaryMax: '', jobUrl: '',
      dateApplied: new Date().toISOString().split('T')[0], notes: '',
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        company: initial.company || '',
        role: initial.role || '',
        status: initial.status || 'Applied',
        location: initial.location || '',
        salaryMin: initial.salaryMin ?? '',
        salaryMax: initial.salaryMax ?? '',
        jobUrl: initial.jobUrl || '',
        dateApplied: initial.dateApplied ? initial.dateApplied.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: initial.notes || '',
      });
    } else {
      reset({
        company: '', role: '', status: 'Applied', location: '',
        salaryMin: '', salaryMax: '', jobUrl: '',
        dateApplied: new Date().toISOString().split('T')[0], notes: '',
      });
    }
  }, [initial, open]);

  const handleFormSubmit = async (data) => {
    await onSubmit({
      ...data,
      salaryMin: data.salaryMin !== '' ? Number(data.salaryMin) : undefined,
      salaryMax: data.salaryMax !== '' ? Number(data.salaryMax) : undefined,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeSlideUp_0.25s_ease_both]">
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-4 space-y-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            {initial ? 'Edit Application' : 'New Application'}
          </h2>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>

            {/* Company */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Company Name *</label>
              <input
                type="text"
                placeholder="e.g., Apple Inc."
                {...register('company', { required: 'Company is required' })}
                className="trackr-input"
              />
              {errors.company && <p className="text-xs text-red-500 px-1">{errors.company.message}</p>}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Role *</label>
              <input
                type="text"
                placeholder="e.g., Software Engineer Intern"
                {...register('role', { required: 'Role is required' })}
                className="trackr-input"
              />
              {errors.role && <p className="text-xs text-red-500 px-1">{errors.role.message}</p>}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Location</label>
              <input type="text" placeholder="e.g., San Francisco, CA" {...register('location')} className="trackr-input" />
            </div>

            {/* Status — segmented control */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Status</label>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STATUSES.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue('status', s)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedStatus === s
                        ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-2 grid grid-cols-3 gap-2">
                {STATUSES.slice(4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue('status', s)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedStatus === s
                        ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Salary Min</label>
                <input
                  type="number"
                  placeholder="120000"
                  {...register('salaryMin', {
                    min: { value: 0, message: 'Must be positive' },
                    validate: (v) => v === '' || !isNaN(Number(v)) || 'Must be a number',
                  })}
                  className="trackr-input"
                />
                {errors.salaryMin && <p className="text-xs text-red-500 px-1">{errors.salaryMin.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Salary Max</label>
                <input
                  type="number"
                  placeholder="160000"
                  {...register('salaryMax', {
                    min: { value: 0, message: 'Must be positive' },
                    validate: (v, formValues) => {
                      if (v === '' || !formValues.salaryMin) return true;
                      if (isNaN(Number(v))) return 'Must be a number';
                      if (Number(v) < Number(formValues.salaryMin)) return 'Max must be ≥ min';
                      return true;
                    },
                  })}
                  className="trackr-input"
                />
                {errors.salaryMax && <p className="text-xs text-red-500 px-1">{errors.salaryMax.message}</p>}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Application Date</label>
              <input type="date" {...register('dateApplied', { required: true })} className="trackr-input" />
            </div>

            {/* Job URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Job URL</label>
              <input type="url" placeholder="https://…" {...register('jobUrl')} className="trackr-input" />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Notes</label>
              <textarea
                rows={4}
                placeholder="Add any notes about this application…"
                maxLength={5000}
                {...register('notes', {
                  maxLength: { value: 5000, message: 'Notes cannot exceed 5000 characters' },
                })}
                className="trackr-input resize-none"
              />
              {errors.notes && <p className="text-xs text-red-500 px-1">{errors.notes.message}</p>}
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
                {initial ? 'Update Application' : 'Save Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
