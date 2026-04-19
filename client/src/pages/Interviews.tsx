import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import InterviewForm from '../components/Interviews/InterviewForm';
import InterviewCard from '../components/Interviews/InterviewCard';
import ConfirmDialog from '../components/Common/ConfirmDialog';

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/interviews?limit=200');
      setInterviews(res.data.interviews);
    } catch {
      setError('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInterviews(); }, [fetchInterviews]);

  const handleFormSubmit = async (data) => {
    if (editingInterview) {
      const res = await api.put(`/interviews/${editingInterview._id}`, data);
      setInterviews((prev) => prev.map((i) => i._id === editingInterview._id ? res.data.interview : i));
    } else {
      const res = await api.post('/interviews', data);
      setInterviews((prev) => [res.data.interview, ...prev]);
    }
    setFormOpen(false);
    setEditingInterview(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/interviews/${deleteTarget._id}`);
      setInterviews((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete interview');
    } finally {
      setDeleting(false);
    }
  };

  const now = new Date();
  const upcoming = interviews.filter((i) => new Date(i.scheduledAt) >= now);
  const past = interviews.filter((i) => new Date(i.scheduledAt) < now);

  return (
    <div className="min-h-screen p-6 space-y-6 pb-24 md:pb-6">

      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Interviews</h2>
          <p className="text-gray-500 mt-1 text-sm">{interviews.length} total</p>
        </div>
        <button
          onClick={() => { setEditingInterview(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Schedule
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center pt-12">
          <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-800">Upcoming</span>
              <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {upcoming.length}
              </span>
            </div>
            {upcoming.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-400 text-sm">No upcoming interviews</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map((i) => (
                  <InterviewCard
                    key={i._id}
                    interview={i}
                    onEdit={(iv) => { setEditingInterview(iv); setFormOpen(true); }}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Past */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-500">Past</span>
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                {past.length}
              </span>
            </div>
            {past.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <p className="text-gray-400 text-sm">No past interviews</p>
              </div>
            ) : (
              <div className="space-y-2">
                {past.map((i) => (
                  <InterviewCard
                    key={i._id}
                    interview={i}
                    onEdit={(iv) => { setEditingInterview(iv); setFormOpen(true); }}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating add button (mobile) */}
      <button
        onClick={() => { setEditingInterview(null); setFormOpen(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-float flex items-center justify-center hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 md:hidden z-20"
      >
        <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <InterviewForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingInterview(null); }}
        onSubmit={handleFormSubmit}
        initial={editingInterview}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Interview"
        message={`Delete this ${deleteTarget?.type} interview scheduled for ${deleteTarget?.scheduledAt ? new Date(deleteTarget.scheduledAt).toLocaleDateString() : ''}?`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
