import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import KanbanBoard from '../components/Applications/KanbanBoard';
import ApplicationTable from '../components/Applications/ApplicationTable';
import ApplicationForm from '../components/Applications/ApplicationForm';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import SearchBar from '../components/Common/SearchBar';

const STATUSES = ['', 'Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'];

export default function Applications() {
  const [view, setView] = useState('kanban');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [contactMap, setContactMap] = useState<Record<string, string>>({});
  const [interviewSet, setInterviewSet] = useState<Set<string>>(new Set());

  const [formOpen, setFormOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { document.title = 'Applications — Trackr'; }, []);

  // Fetch supplemental contact + interview data once on mount
  useEffect(() => {
    Promise.all([
      api.get('/contacts?limit=200'),
      api.get('/interviews?limit=200'),
    ]).then(([cRes, iRes]) => {
      // Build applicationId → contact name map
      const cMap: Record<string, string> = {};
      (cRes.data.contacts ?? []).forEach((c: any) => {
        if (c.application) {
          const appId = typeof c.application === 'object' ? c.application._id : c.application;
          if (appId) cMap[appId] = c.name;
        }
      });
      setContactMap(cMap);

      // Build set of applicationIds that have at least one interview
      const iSet = new Set<string>();
      (iRes.data.interviews ?? []).forEach((i: any) => {
        if (i.application) {
          const appId = typeof i.application === 'object' ? i.application._id : i.application;
          if (appId) iSet.add(appId);
        }
      });
      setInterviewSet(iSet);
    }).catch(() => {}); // supplemental — fail silently
  }, []);

  const fetchApplications = useCallback(async (page = 1) => {
    setSearchLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: view === 'kanban' ? 200 : 20 });
      if (searchQuery) params.set('q', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/applications?${params}`);
      setApplications(res.data.applications);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load applications', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchQuery, statusFilter, view]);

  useEffect(() => { fetchApplications(1); }, [searchQuery, statusFilter, view]);

  const handleFormSubmit = async (data) => {
    if (editingApp) {
      const res = await api.put(`/applications/${editingApp._id}`, data);
      setApplications((prev) => prev.map((a) => a._id === editingApp._id ? res.data.application : a));
    } else {
      const res = await api.post('/applications', data);
      setApplications((prev) => [res.data.application, ...prev]);
    }
    setFormOpen(false);
    setEditingApp(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/applications/${deleteTarget._id}`);
      setApplications((prev) => prev.filter((a) => a._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete application', err);
      setError('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setApplications((prev) => prev.map((a) => a._id === appId ? { ...a, status: newStatus } : a));
    try {
      await api.patch(`/applications/${appId}/status`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchApplications(pagination.page);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6 pb-24 md:pb-6">

      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Applications</h1>
          <p className="text-gray-500 mt-1 text-sm">{pagination.total} total</p>
        </div>
        <button
          onClick={() => { setEditingApp(null); setFormOpen(true); }}
          aria-label="Add new application"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {/* Search bar */}
      <div>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search companies or roles…"
          loading={searchLoading}
        />
      </div>

      {/* Filter chips */}
      <div role="group" aria-label="Filter by status" className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            aria-pressed={statusFilter === s}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              statusFilter === s
                ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-md'
                : 'bg-white/80 text-gray-600 border border-gray-200 hover:bg-white'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* View toggle */}
      <div role="group" aria-label="View mode" className="flex items-center gap-2">
        {['kanban', 'table'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 capitalize ${
              view === v
                ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                : 'bg-white/80 border border-gray-200 text-gray-600 hover:bg-white'
            }`}
          >
            {v === 'kanban' ? '⠿ Board' : '☰ List'}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center pt-12">
          <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" aria-label="Loading" role="status" />
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          applications={applications}
          onEdit={(app) => { setEditingApp(app); setFormOpen(true); }}
          onDelete={setDeleteTarget}
          onStatusChange={handleStatusChange}
          contactMap={contactMap}
          interviewSet={interviewSet}
        />
      ) : (
        <div className="space-y-4">
          <ApplicationTable
            applications={applications}
            onEdit={(app) => { setEditingApp(app); setFormOpen(true); }}
            onDelete={setDeleteTarget}
            contactMap={contactMap}
            interviewSet={interviewSet}
          />
          {pagination.pages > 1 && (
            <nav aria-label="Pagination" className="flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchApplications(i + 1)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={pagination.page === i + 1 ? 'page' : undefined}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    pagination.page === i + 1
                      ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                      : 'bg-white/80 border border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Floating add button (mobile) */}
      <button
        onClick={() => { setEditingApp(null); setFormOpen(true); }}
        aria-label="Add new application"
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-float flex items-center justify-center hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 md:hidden z-20"
      >
        <svg className="w-7 h-7 text-gray-800" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <ApplicationForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingApp(null); }}
        onSubmit={handleFormSubmit}
        initial={editingApp}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Application"
        message={`Delete "${deleteTarget?.company} — ${deleteTarget?.role}"? This will also remove linked interviews.`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
