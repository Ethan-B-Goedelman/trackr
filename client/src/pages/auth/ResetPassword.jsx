import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();
  const password = watch('password');
  const token = searchParams.get('token');

  const onSubmit = async (data) => {
    if (!token) { setServerError('Invalid reset link — token is missing.'); return; }
    setServerError('');
    try {
      await resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setServerError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-yellow-50 to-white flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm text-center space-y-6 page-enter">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-300 to-green-400 rounded-3xl shadow-lg flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Password updated!</h2>
            <p className="text-gray-500 text-sm">Redirecting you to sign in…</p>
          </div>
          <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-yellow-50 to-white flex flex-col items-center justify-center px-8 py-12">
      <div className="w-full max-w-sm space-y-8 page-enter">

        <div className="text-center space-y-1">
          <h1 className="text-3xl font-semibold text-gray-800">New Password</h1>
          <p className="text-gray-500 text-sm">Choose a strong password for your account</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
              })}
              className="trackr-input pr-12"
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            {errors.password && <p className="text-xs text-red-500 mt-1 px-1">{errors.password.message}</p>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
              className="trackr-input"
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1 px-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center justify-center gap-2">
            {isSubmitting ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            Set New Password
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
