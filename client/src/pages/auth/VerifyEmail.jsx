import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); setErrorMsg('No verification token found in the URL.'); return; }

    verifyEmail(token)
      .then(() => { setStatus('success'); setTimeout(() => navigate('/dashboard'), 2500); })
      .catch((err) => { setStatus('error'); setErrorMsg(err.response?.data?.error || 'Verification failed. The link may have expired.'); });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-yellow-50 to-white flex flex-col items-center justify-center px-8 py-12">
      <div className="w-full max-w-sm text-center space-y-6 page-enter">

        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-3xl shadow-lg flex items-center justify-center">
              <svg className="animate-spin w-10 h-10 text-yellow-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">Verifying your email…</h2>
              <p className="text-gray-500 text-sm mt-1">Just a moment</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-300 to-green-400 rounded-3xl shadow-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Email verified!</h2>
              <p className="text-gray-500 text-sm">Redirecting to your dashboard…</p>
            </div>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Go to Dashboard</button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-200 to-red-300 rounded-3xl shadow-lg flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verification failed</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{errorMsg}</p>
            </div>
            <RouterLink to="/login" className="btn-primary inline-flex items-center justify-center">
              Back to Sign In
            </RouterLink>
          </>
        )}
      </div>
    </div>
  );
}
