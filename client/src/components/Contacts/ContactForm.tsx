import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Portal from '../Common/Portal';

export default function ContactForm({ open, onClose, onSubmit, initial, serverError = '' }) {
  const [applications, setApplications] = useState([]);

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '', email: '', phone: '', company: '',
      role: '', linkedIn: '', notes: '', application: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    api.get('/applications?limit=200').then((res) => {
      setApplications(res.data.applications);
      if (initial) {
        reset({
          name: initial.name || '',
          email: initial.email || '',
          phone: initial.phone || '',
          company: initial.company || '',
          role: initial.role || '',
          linkedIn: initial.linkedIn || '',
          notes: initial.notes || '',
          application: initial.application?._id ?? initial.application ?? '',
        });
      } else {
        reset({
          name: '', email: '', phone: '', company: '',
          role: '', linkedIn: '', notes: '', application: '',
        });
      }
    });
  }, [open, initial]);

  const handleFormSubmit = async (data) => {
    await onSubmit({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      company: data.company || undefined,
      role: data.role || undefined,
      linkedIn: data.linkedIn || undefined,
      notes: data.notes || undefined,
      application: data.application || undefined,
    });
  };

  if (!open) return null;

  const inputCls = (hasError?: boolean) =>
    `trackr-input${hasError ? ' !border-red-400 focus:!border-red-400' : ''}`;

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-6">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeSlideUp_0.25s_ease_both]">
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-4 space-y-5">
          <h2 className="text-2xl font-semibold text-gray-800">
            {initial ? 'Edit Contact' : 'Add Contact'}
          </h2>

          {serverError && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Jane Smith"
                {...register('name', { required: 'Name is required' })}
                className={inputCls(!!errors.name)}
              />
              {errors.name && <p className="text-xs text-red-500 px-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Email</label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  {...register('email', {
                    pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                  })}
                  className={inputCls(!!errors.email)}
                />
                {errors.email && <p className="text-xs text-red-500 px-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Phone</label>
                <input type="tel" placeholder="+1 555 000 0000" {...register('phone')} className="trackr-input" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Company</label>
                <input type="text" placeholder="Acme Corp" {...register('company')} className="trackr-input" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 px-1">Role / Title</label>
                <input type="text" placeholder="Recruiter" {...register('role')} className="trackr-input" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">LinkedIn URL</label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/…"
                {...register('linkedIn', {
                  pattern: { value: /^(https?:\/\/)?(www\.)?linkedin\.com\/.+/, message: 'Enter a valid LinkedIn URL' },
                })}
                className={inputCls(!!errors.linkedIn)}
              />
              {errors.linkedIn && <p className="text-xs text-red-500 px-1">{errors.linkedIn.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">
                Linked Application
                <span className="ml-1.5 text-xs font-normal text-gray-400">(optional)</span>
              </label>
              <select {...register('application')} className="trackr-input">
                <option value="">— No linked application —</option>
                {applications.map((a) => (
                  <option key={a._id} value={a._id}>{a.company} — {a.role}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 px-1">You can link this contact to a job application, or leave it unlinked.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 px-1">Notes</label>
              <textarea
                rows={3}
                placeholder="Context, how you met, follow-up reminders…"
                {...register('notes')}
                className="trackr-input resize-none"
              />
            </div>

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
                  <svg className="animate-spin w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {initial ? 'Save Changes' : 'Add Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </Portal>
  );
}