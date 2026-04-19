import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import ContactForm from '../components/Contacts/ContactForm';
import ConfirmDialog from '../components/Common/ConfirmDialog';
import SearchBar from '../components/Common/SearchBar';

function ContactCard({ contact, onEdit, onDelete }) {
  const initials = contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="glass-card p-4 transition-all duration-200 hover:shadow-card-hover hover:scale-[1.01]">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-200 to-yellow-300 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-gray-700">{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
          {contact.role && (
            <p className="text-sm text-gray-500 truncate">
              {contact.role}{contact.company ? ` @ ${contact.company}` : ''}
            </p>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {contact.phone}
              </span>
            )}
            {contact.linkedIn && (
              <a
                href={contact.linkedIn}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>
            )}
          </div>

          {contact.application && (
            <p className="text-xs text-gray-400 mt-1.5 truncate">
              🔗 {contact.application.company} — {contact.application.role}
            </p>
          )}
          {contact.notes && (
            <p className="text-xs text-gray-400 mt-1 truncate">{contact.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(contact)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(contact)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { document.title = 'Contacts — Trackr'; }, []);

  const fetchContacts = useCallback(async (page = 1) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (searchQuery) params.set('q', searchQuery);
      const res = await api.get(`/contacts?${params}`);
      setContacts(res.data.contacts);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to load contacts', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => { fetchContacts(1); }, [fetchContacts]);

  const handleFormSubmit = async (data) => {
    if (editingContact) {
      const res = await api.put(`/contacts/${editingContact._id}`, data);
      setContacts((prev) => prev.map((c) => c._id === editingContact._id ? res.data.contact : c));
    } else {
      const res = await api.post('/contacts', data);
      setContacts((prev) => [res.data.contact, ...prev]);
    }
    setFormOpen(false);
    setEditingContact(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/contacts/${deleteTarget._id}`);
      setContacts((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      setError('Failed to delete contact');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6 pb-24 md:pb-6">

      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Contacts</h1>
          <p className="text-gray-500 mt-1 text-sm">{pagination.total} total</p>
        </div>
        <button
          onClick={() => { setEditingContact(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 font-semibold rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search name, company, email…"
        loading={searchLoading}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center pt-12">
          <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-gray-400 text-sm">
            {searchQuery ? 'No contacts match your search' : 'No contacts yet — tap + to add one'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {contacts.map((contact) => (
              <ContactCard
                key={contact._id}
                contact={contact}
                onEdit={(c) => { setEditingContact(c); setFormOpen(true); }}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => fetchContacts(i + 1)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    pagination.page === i + 1
                      ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 text-gray-800 shadow-sm'
                      : 'bg-white/80 border border-gray-200 text-gray-600 hover:bg-white'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating add button (mobile) */}
      <button
        onClick={() => { setEditingContact(null); setFormOpen(true); }}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-float flex items-center justify-center hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 md:hidden z-20"
      >
        <svg className="w-7 h-7 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <ContactForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingContact(null); }}
        onSubmit={handleFormSubmit}
        initial={editingContact}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Contact"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmColor="red"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
