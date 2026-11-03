'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  FileCheck,
  TrendingUp,
  Calendar,
  Bell,
  Download,
  Plus,
  Shield,
  Activity,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { fetchApi } from '../../lib/api';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState<'approvals' | 'roles' | 'announcements' | 'events' | 'finance' | 'logs'>('approvals');
  const [metrics, setMetrics] = useState<any>(null);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Announcement Form
  const [ancForm, setAncForm] = useState({
    title: '',
    title_gu: '',
    category: 'notice',
    content: '',
    is_urgent: false,
    is_pinned: false,
  });

  // Event Form
  const [evForm, setEvForm] = useState({
    title: '',
    title_gu: '',
    category: 'cultural',
    description: '',
    venue_name: '',
    city: 'Ahmedabad',
    start_time: '2026-12-25T10:00:00',
    end_time: '2026-12-25T16:00:00',
    max_attendees: 500,
  });

  // Role Form
  const [roleUserId, setRoleUserId] = useState('');
  const [roleSelect, setRoleSelect] = useState('committee');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [mRes, pRes, lRes] = await Promise.all([
        fetchApi('/admin/metrics'),
        fetchApi('/admin/pending-members'),
        fetchApi('/admin/audit-logs'),
      ]);

      setMetrics(mRes.metrics);
      setPendingMembers(pRes.pendingMembers || []);
      setAuditLogs(lRes.logs || []);
    } catch (err: any) {
      console.error('Admin API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!isAdmin) {
      alert('Forbidden: Administrative privileges required.');
      router.push('/');
      return;
    }
    loadAdminData();
  }, [user, isAdmin]);

  const handleApproveMember = async (userId: string) => {
    try {
      await fetchApi(`/admin/approve-member/${userId}`, { method: 'POST' });
      alert('Member verified and approved successfully.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleRejectMember = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this membership application?')) return;
    try {
      await fetchApi(`/admin/reject-member/${userId}`, { method: 'POST' });
      alert('Application rejected.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/announcements', {
        method: 'POST',
        body: JSON.stringify(ancForm),
      });
      alert('Official notice published successfully.');
      setAncForm({ title: '', title_gu: '', category: 'notice', content: '', is_urgent: false, is_pinned: false });
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/events', {
        method: 'POST',
        body: JSON.stringify(evForm),
      });
      alert('Event scheduled and published successfully.');
      setEvForm({
        title: '',
        title_gu: '',
        category: 'cultural',
        description: '',
        venue_name: '',
        city: 'Ahmedabad',
        start_time: '2026-12-25T10:00:00',
        end_time: '2026-12-25T16:00:00',
        max_attendees: 500,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to add event.');
    }
  };

  const handleRoleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleUserId) return;
    try {
      await fetchApi('/admin/update-role', {
        method: 'POST',
        body: JSON.stringify({ userId: roleUserId, role: roleSelect }),
      });
      alert(`User role updated to ${roleSelect}.`);
      setRoleUserId('');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update role.');
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,ID,Phone,Name,Village,City\n' +
      pendingMembers.map((m) => `"${m.id}","${m.phone}","${m.full_name || ''}","${m.native_village || ''}","${m.current_city || ''}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RBSS_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-samaj-navy-950 via-slate-900 to-samaj-navy-900 rounded-3xl p-5 sm:p-8 text-white relative shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Admin Executive Console</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Central Administrative Dashboard
          </h1>
          <p className="text-xs text-slate-300">
            Active Administrator: <strong>{user.profile?.full_name || user.phone}</strong> (Role: <span className="uppercase text-orange-400 font-bold">{user.role}</span>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 touch-manipulation active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 touch-manipulation active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Verified Members</span>
            <div className="text-xl sm:text-3xl font-black text-samaj-navy mt-1">
              {metrics.totalMembers}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Active Samaj Directory</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 bg-amber-50/20 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase">Pending Approvals</span>
            <div className="text-xl sm:text-3xl font-black text-amber-900 mt-1">
              {metrics.pendingApprovals}
            </div>
            <span className="text-[10px] text-amber-700 font-semibold">New applications</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Matrimonial Profiles</span>
            <div className="text-xl sm:text-3xl font-black text-rose-700 mt-1">
              {metrics.matrimonyProfiles}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">Active Biodatas</span>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200 bg-emerald-50/20 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase">Treasury Balance</span>
            <div className="text-xl sm:text-3xl font-black text-emerald-900 mt-1">
              ₹{(metrics.netTreasuryBalance || 0).toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold">Net Community Fund</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs (Horizontally scrollable on mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs sm:text-sm font-bold border-b border-slate-200 scrollbar-none">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'approvals' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'
          }`}
        >
          Member Approvals ({pendingMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'roles' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'
          }`}
        >
          RBAC Roles & Permissions
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'announcements' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'
          }`}
        >
          Post Notice
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'events' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'
          }`}
        >
          Add Event
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-2.5 px-3 sm:px-4 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'logs' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400'
          }`}
        >
          Audit Trail
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="font-bold text-base text-samaj-navy">Member Verification Requests</h3>
              <p className="text-xs text-slate-500">Verify native village and family background</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {pendingMembers.length} Applications Pending
            </span>
          </div>

          {pendingMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No pending registrations. All members are verified and active.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center shrink-0">
                      {m.full_name ? m.full_name[0] : 'U'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{m.full_name || 'New Member'}</h4>
                      <p className="text-xs text-slate-600 font-medium">
                        Phone: <strong>+91 {m.phone}</strong> • Village: <strong>{m.native_village || 'N/A'}</strong> • City: {m.current_city || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Gotra: {m.gotra || 'N/A'} • Kuldevi: {m.kuldevi || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleApproveMember(m.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition touch-manipulation active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectMember(m.id)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-bold rounded-xl transition touch-manipulation active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RBAC ROLES */}
      {activeTab === 'roles' && (
        <div className="max-w-2xl bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-samaj-navy">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-500">
              Assign administrative roles: Super Admin, President, Secretary, Treasurer, Committee Member
            </p>
          </div>

          <form onSubmit={handleRoleChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">User ID or Phone Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. u-mem-10 or 9898000001"
                value={roleUserId}
                onChange={(e) => setRoleUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Designate Role *</label>
              <select
                value={roleSelect}
                onChange={(e) => setRoleSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white font-medium"
              >
                <option value="super_admin">👑 Super Admin (Full Control)</option>
                <option value="president">🏛️ President</option>
                <option value="secretary">📜 Secretary</option>
                <option value="treasurer">💰 Treasurer</option>
                <option value="committee">👥 Committee Member</option>
                <option value="member">👤 Standard Member</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition touch-manipulation active:scale-98"
            >
              Update Member Role
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PUBLISH NOTICE */}
      {activeTab === 'announcements' && (
        <div className="max-w-2xl bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-samaj-navy">Publish Official Circular</h3>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Circular Title *</label>
              <input
                type="text"
                required
                value={ancForm.title}
                onChange={(e) => setAncForm({ ...ancForm, title: e.target.value, title_gu: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={ancForm.category}
                  onChange={(e) => setAncForm({ ...ancForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
                >
                  <option value="notice">Official Notice</option>
                  <option value="urgent">Urgent Circular</option>
                  <option value="achievement">Student Achievement</option>
                  <option value="condolence">Condolence Notice</option>
                  <option value="wedding">Wedding Announcement</option>
                  <option value="birthday">Birthday Greeting</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-4 sm:pt-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={ancForm.is_urgent}
                    onChange={(e) => setAncForm({ ...ancForm, is_urgent: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Mark Urgent</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={ancForm.is_pinned}
                    onChange={(e) => setAncForm({ ...ancForm, is_pinned: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>Pin to Top</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Content Details *</label>
              <textarea
                rows={4}
                required
                value={ancForm.content}
                onChange={(e) => setAncForm({ ...ancForm, content: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition touch-manipulation active:scale-98"
            >
              Publish Circular
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: ADD EVENT */}
      {activeTab === 'events' && (
        <div className="max-w-2xl bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h3 className="font-bold text-base text-samaj-navy">Schedule Community Event</h3>

          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={evForm.title}
                onChange={(e) => setEvForm({ ...evForm, title: e.target.value, title_gu: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue Name *</label>
                <input
                  type="text"
                  required
                  value={evForm.venue_name}
                  onChange={(e) => setEvForm({ ...evForm, venue_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={evForm.city}
                  onChange={(e) => setEvForm({ ...evForm, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Start Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={evForm.start_time}
                  onChange={(e) => setEvForm({ ...evForm, start_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">End Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={evForm.end_time}
                  onChange={(e) => setEvForm({ ...evForm, end_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Event Description *</label>
              <textarea
                rows={3}
                required
                value={evForm.description}
                onChange={(e) => setEvForm({ ...evForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition touch-manipulation active:scale-98"
            >
              Publish Event
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-samaj-navy">Administrative Audit Trail</h3>

          <div className="space-y-2 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider">{log.action}</span>
                  <span className="text-slate-500 block">
                    Admin: {log.admin_name} (+91 {log.admin_phone}) • Target: {log.target_type} ({log.target_id})
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {new Date(log.created_at).toLocaleString('en-US')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
