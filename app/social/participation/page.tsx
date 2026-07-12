'use client';

import { useEffect, useState, useCallback } from 'react';

interface Activity {
  id: string;
  title: string;
  evidenceRequired: boolean;
  status: 'active' | 'inactive';
  category: { name: string };
  department: { name: string };
}

interface Participation {
  id: string;
  proofUrl: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  pointsEarned: number;
  completionDate: string | null;
  employee: {
    id: string;
    name: string;
    email: string;
    department: { name: string };
  };
  activity: {
    id: string;
    title: string;
    evidenceRequired: boolean;
    status: 'active' | 'inactive';
    category: { name: string };
    department: { name: string };
  };
}

interface CurrentUser {
  id: string;
  role: string;
  name: string;
}

const MANAGER_ROLES = ['admin', 'esg_manager', 'department_head'];
const APPROVER_ROLES = ['admin', 'esg_manager', 'department_head'];

type TabKey = 'mine' | 'queue';

const statusBadge = (s: string) => {
  if (s === 'approved')
    return (
      <span className="bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
        ✓ Approved
      </span>
    );
  if (s === 'rejected')
    return (
      <span className="bg-red-50 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">
        ✕ Rejected
      </span>
    );
  return (
    <span className="bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
      ⏳ Pending
    </span>
  );
};

export default function ParticipationPage() {
  const [tab, setTab] = useState<TabKey>('mine');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // My Participations state
  const [myParticipations, setMyParticipations] = useState<Participation[]>([]);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);
  const [myLoading, setMyLoading] = useState(true);

  // Join form
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinActivityId, setJoinActivityId] = useState('');
  const [joinProofUrl, setJoinProofUrl] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  // Proof update
  const [updatingProofId, setUpdatingProofId] = useState<string | null>(null);
  const [newProofUrl, setNewProofUrl] = useState('');
  const [updatingProof, setUpdatingProof] = useState(false);

  // Approval queue state
  const [queue, setQueue] = useState<Participation[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [approvePoints, setApprovePoints] = useState<Record<string, number>>({});

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadMe = useCallback(async () => {
    const res = await fetch('/api/social/me');
    if (res.ok) {
      const data = await res.json();
      setCurrentUser(data);
    }
  }, []);

  const loadMyParticipations = useCallback(async () => {
    setMyLoading(true);
    try {
      const [pRes, aRes] = await Promise.all([
        fetch('/api/social/participation'),
        fetch('/api/social/csr-activities?status=active'),
      ]);
      const [parts, acts] = await Promise.all([pRes.json(), aRes.json()]);
      setMyParticipations(Array.isArray(parts) ? parts : []);
      setAllActivities(Array.isArray(acts) ? acts : []);
    } catch {
      showToast('Failed to load participations', 'error');
    } finally {
      setMyLoading(false);
    }
  }, []);

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch('/api/social/participation?approvalStatus=pending');
      const data = await res.json();
      setQueue(Array.isArray(data) ? data : []);
    } catch {
      showToast('Failed to load approval queue', 'error');
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
    loadMyParticipations();
    loadQueue();
  }, [loadMe, loadMyParticipations, loadQueue]);

  const isManager = currentUser && MANAGER_ROLES.includes(currentUser.role);
  const isApprover = currentUser && APPROVER_ROLES.includes(currentUser.role);

  // Already-joined activity IDs
  const joinedIds = new Set(myParticipations.map((p) => p.activity.id));
  const joinableActivities = allActivities.filter((a) => !joinedIds.has(a.id));

  // ──────────── JOIN ACTIVITY ────────────
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinActivityId) {
      setJoinError('Please select an activity.');
      return;
    }
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/social/participation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: joinActivityId, proofUrl: joinProofUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error ?? 'Failed to join');
      } else {
        showToast('Successfully joined activity!');
        setShowJoinForm(false);
        setJoinActivityId('');
        setJoinProofUrl('');
        loadMyParticipations();
        loadQueue();
      }
    } catch {
      setJoinError('Network error. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  // ──────────── UPDATE PROOF ────────────
  const handleUpdateProof = async (participationId: string) => {
    setUpdatingProof(true);
    try {
      const res = await fetch(`/api/social/participation/${participationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl: newProofUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Failed to update proof', 'error');
      } else {
        showToast('Proof URL updated!');
        setUpdatingProofId(null);
        setNewProofUrl('');
        loadMyParticipations();
        loadQueue();
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setUpdatingProof(false);
    }
  };

  // ──────────── APPROVE / REJECT ────────────
  const handleApprove = async (p: Participation) => {
    const pts = approvePoints[p.id] ?? 10;
    try {
      const res = await fetch(`/api/social/participation/${p.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', pointsEarned: pts }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Cannot approve', 'error');
      } else {
        showToast(data.message ?? 'Approved!');
        loadQueue();
        loadMyParticipations();
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  const handleReject = async (p: Participation) => {
    if (!confirm(`Reject ${p.employee.name}'s participation in "${p.activity.title}"?`)) return;
    try {
      const res = await fetch(`/api/social/participation/${p.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error ?? 'Cannot reject', 'error');
      } else {
        showToast('Participation rejected.');
        loadQueue();
        loadMyParticipations();
      }
    } catch {
      showToast('Network error', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Participation</h1>
          <p className="text-slate-500 text-sm mt-1">
            Join CSR activities, upload proof, and track approvals.
          </p>
        </div>
        <button
          id="btn-join-activity"
          onClick={() => {
            setShowJoinForm(true);
            setTab('mine');
          }}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          + Join Activity
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          id="tab-mine"
          onClick={() => setTab('mine')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'mine'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          My Participations
          {myParticipations.length > 0 && (
            <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
              {myParticipations.length}
            </span>
          )}
        </button>
        {isApprover && (
          <button
            id="tab-queue"
            onClick={() => setTab('queue')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === 'queue'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Approval Queue
            {queue.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                {queue.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ─────────────── TAB: MY PARTICIPATIONS ─────────────── */}
      {tab === 'mine' && (
        <div className="space-y-4">
          {/* Join Form */}
          {showJoinForm && (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-4">Join a CSR Activity</h3>
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Activity <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="join-activity-select"
                      value={joinActivityId}
                      onChange={(e) => setJoinActivityId(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">Select an activity…</option>
                      {joinableActivities.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}{a.evidenceRequired ? ' ⚠ Evidence required' : ''}
                        </option>
                      ))}
                    </select>
                    {joinableActivities.length === 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        You have already joined all available activities.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Proof URL{' '}
                      <span className="text-slate-400 font-normal">(optional — upload link)</span>
                    </label>
                    <input
                      id="join-proof-url"
                      type="url"
                      value={joinProofUrl}
                      onChange={(e) => setJoinProofUrl(e.target.value)}
                      placeholder="https://drive.google.com/…"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                {joinError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{joinError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    id="btn-confirm-join"
                    disabled={joining}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  >
                    {joining ? 'Joining…' : 'Confirm Join'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJoinForm(false);
                      setJoinError('');
                    }}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* My Participations Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {myLoading ? (
              <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
            ) : myParticipations.length === 0 ? (
              <div className="p-14 text-center">
                <p className="text-3xl mb-2">🙋</p>
                <p className="font-semibold text-slate-700">No participations yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Click "Join Activity" to get started and earn XP.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Activity</th>
                      <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Category</th>
                      <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Proof</th>
                      <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Status</th>
                      <th className="text-center px-5 py-3.5 text-slate-500 font-medium">XP</th>
                      <th className="text-right px-5 py-3.5 text-slate-500 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myParticipations.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-800">{p.activity.title}</p>
                          <p className="text-xs text-slate-400">{p.activity.department.name}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {p.activity.category.name}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {updatingProofId === p.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                id={`proof-input-${p.id}`}
                                type="url"
                                value={newProofUrl}
                                onChange={(e) => setNewProofUrl(e.target.value)}
                                placeholder="https://…"
                                className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-40 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <button
                                onClick={() => handleUpdateProof(p.id)}
                                disabled={updatingProof}
                                className="text-xs text-emerald-600 font-medium hover:text-emerald-800"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setUpdatingProofId(null)}
                                className="text-xs text-slate-400 hover:text-slate-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : p.proofUrl ? (
                            <a
                              href={p.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-xs truncate max-w-32 block"
                            >
                              View proof ↗
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">{statusBadge(p.approvalStatus)}</td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-700">
                          {p.pointsEarned > 0 ? (
                            <span className="text-emerald-600">+{p.pointsEarned} XP</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {p.approvalStatus === 'pending' && (
                            <button
                              id={`btn-update-proof-${p.id}`}
                              onClick={() => {
                                setUpdatingProofId(p.id);
                                setNewProofUrl(p.proofUrl ?? '');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              {p.proofUrl ? 'Update proof' : 'Add proof'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────── TAB: APPROVAL QUEUE ─────────────── */}
      {tab === 'queue' && isApprover && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {queueLoading ? (
            <div className="p-10 text-center text-slate-400 text-sm">Loading queue…</div>
          ) : queue.length === 0 ? (
            <div className="p-14 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="font-semibold text-slate-700">All caught up!</p>
              <p className="text-sm text-slate-400 mt-1">
                No pending participations to review.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Employee</th>
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Activity</th>
                    <th className="text-left px-5 py-3.5 text-slate-500 font-medium">Proof</th>
                    <th className="text-center px-5 py-3.5 text-slate-500 font-medium">Evidence Req?</th>
                    <th className="text-center px-5 py-3.5 text-slate-500 font-medium">XP to Award</th>
                    <th className="text-right px-5 py-3.5 text-slate-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {queue.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{p.employee.name}</p>
                        <p className="text-xs text-slate-400">{p.employee.department.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">{p.activity.title}</p>
                        <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
                          {p.activity.category.name}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {p.proofUrl ? (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            View proof ↗
                          </a>
                        ) : (
                          <span
                            className={`text-xs ${
                              p.activity.evidenceRequired
                                ? 'text-red-600 font-medium'
                                : 'text-slate-400'
                            }`}
                          >
                            {p.activity.evidenceRequired ? '⚠ Missing' : 'None submitted'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {p.activity.evidenceRequired ? (
                          <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <input
                          id={`pts-input-${p.id}`}
                          type="number"
                          min={1}
                          max={500}
                          value={approvePoints[p.id] ?? 10}
                          onChange={(e) =>
                            setApprovePoints({ ...approvePoints, [p.id]: parseInt(e.target.value) })
                          }
                          className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`btn-approve-${p.id}`}
                            onClick={() => handleApprove(p)}
                            disabled={p.activity.evidenceRequired && !p.proofUrl}
                            title={
                              p.activity.evidenceRequired && !p.proofUrl
                                ? 'Cannot approve: evidence is required but no proof submitted'
                                : 'Approve participation'
                            }
                            className="text-xs bg-emerald-600 text-white font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                          <button
                            id={`btn-reject-${p.id}`}
                            onClick={() => handleReject(p)}
                            className="text-xs bg-red-50 text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
