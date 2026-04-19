import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Something went wrong');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-yellow-50 to-white flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm text-center space-y-6 page-enter">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-200 to-blue-300 rounded-3xl shadow-lg flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Check your email</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              If that email exists, we've sent a reset link. Check your inbox.
            </p>
          </div>
          <RouterLink to="/login" className="btn-primary inline-flex items-center justify-center">
            Back to Sign In
          </RouterLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-yellow-50 to-white flex flex-col items-center justify-center px-8 py-12">
      <div className="w-full max-w-sm space-y-8 page-enter">

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold text-gray-800">Reset Password</h1>
          <p className="text-gray-500 text-sm">Enter your email and we'll send a link</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div>
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
              })}
              className="trackr-input"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1 px-1">{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center justify-center gap-2">
            {isSubmitting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Send Reset Link
          </button>
        </form>

        <div className="text-center">
          <RouterLink to="/login" className="text-sm font-semibold text-gray-800 hover:text-yellow-600 transition-colors">
            ← Back to Sign In
          </RouterLink>
        </div>
      </div>
    </div>
  );
}
