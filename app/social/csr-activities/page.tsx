'use client';

import { useEffect, useState, useCallback } from 'react';

interface Category {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Activity {
  id: string;
  title: string;
  description: string | null;
  evidenceRequired: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  category: { id: string; name: string };
  department: { id: string; name: string };
  _count: { participations: number };
}

interface CurrentUser {
  id: string;
  role: string;
  name: string;
}

const MANAGER_ROLES = ['admin', 'esg_manager', 'department_head'];

const emptyForm = {
  title: '',
  categoryId: '',
  departmentId: '',
  description: '',
  evidenceRequired: false,
  status: 'active' as 'active' | 'inactive',
};

export default function CSRActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [actRes, catRes, deptRes, meRes] = await Promise.all([
        fetch('/api/social/csr-activities'),
        fetch('/api/social/categories'),
        fetch('/api/social/departments'),
        fetch('/api/social/me'),
      ]);
      const [acts, cats, depts, me] = await Promise.all([
        actRes.json(),
        catRes.json(),
        deptRes.json(),
        meRes.json(),
      ]);
      setActivities(Array.isArray(acts) ? acts : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setCurrentUser(me?.id ? me : null);
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isManager = currentUser && MANAGER_ROLES.includes(currentUser.role);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      categoryId: a.category.id,
      departmentId: a.department.id,
      description: a.description ?? '',
      evidenceRequired: a.evidenceRequired,
      status: a.status,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.categoryId || !form.departmentId) {
      setFormError('Title, Category, and Department are required.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      const url = editingId
        ? `/api/social/csr-activities/${editingId}`
        : '/api/social/csr-activities';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? 'An error occurred');
      } else {
        showToast(editingId ? 'Activity updated!' : 'Activity created!');
        closeModal();
        loadData();
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string, title: string) => {
    if (!confirm(`Deactivate "${title}"? Existing participations will be preserved.`)) return;
    try {
      const res = await fetch(`/api/social/csr-activities/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Activity deactivated');
        loadData();
      } else {
        const d = await res.json();
        showToast(d.error ?? 'Failed to deactivate', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const filtered = activities.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.name.toLowerCase().includes(search.toLowerCase()) ||
      a.department.name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CSR Activities</h1>
          <p className="text-slate-500 text-sm mt-1">
            Corporate Social Responsibility activities for employee engagement.
          </p>
        </div>
        {isManager && (
          <button
            id="btn-create-activity"
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <span>+</span> New Activity
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="search-activities"
          type="text"
          placeholder="Search by title, category, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        />
        <select
          id="filter-status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading activities…</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-3xl mb-2">🌱</p>
            <p className="font-semibold text-slate-700">No activities found</p>
            <p className="text-sm text-slate-400 mt-1">
              {isManager
                ? 'Click "New Activity" to create the first one.'
                : 'Ask your manager to create CSR activities.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Title</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Category</th>
                  <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Department</th>
                  <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Evidence?</th>
                  <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Participants</th>
                  <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Status</th>
                  {isManager && (
                    <th className="text-right px-5 py-3.5 text-slate-500 font-medium">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{a.title}</p>
                      {a.description && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {a.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                        {a.category.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{a.department.name}</td>
                    <td className="px-5 py-4 text-center">
                      {a.evidenceRequired ? (
                        <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          Required
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-slate-700">
                      {a._count.participations}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          a.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            id={`btn-edit-${a.id}`}
                            onClick={() => openEdit(a)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Edit
                          </button>
                          {a.status === 'active' && (
                            <button
                              id={`btn-deactivate-${a.id}`}
                              onClick={() => handleDeactivate(a.id, a.title)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Activity' : 'New CSR Activity'}
              </h2>
              <button
                id="btn-close-modal"
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="form-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Tree Plantation Drive"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Category + Department */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="form-category"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="form-department"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select…</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="form-description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional details about this activity…"
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              {/* Evidence Required + Status */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    id="form-evidence-required"
                    type="checkbox"
                    checked={form.evidenceRequired}
                    onChange={(e) => setForm({ ...form, evidenceRequired: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span className="text-sm text-slate-700">Evidence required</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <select
                    id="form-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as 'active' | 'inactive' })
                    }
                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                  {formError}
                </p>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-activity"
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : editingId ? 'Save Changes' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
