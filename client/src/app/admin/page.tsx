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
      alert('સભ્યને સફળતાપૂર્વક પ્રમાણિત કરવામાં આવ્યા.');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleRejectMember = async (userId: string) => {
    if (!confirm('શું આપ ખરેખર આ અરજી અસ્વીકાર કરવા માંગો છો?')) return;
    try {
      await fetchApi(`/admin/reject-member/${userId}`, { method: 'POST' });
      alert('અરજી રદ કરવામાં આવી.');
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
      alert('પરિપત્ર સફળતાપૂર્વક પ્રકાશિત થયો.');
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
      alert('કાર્યક્રમ સફળતાપૂર્વક ઉમેરાયો.');
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
    link.setAttribute('download', `Rajgor_Samaj_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="bg-gradient-to-r from-samaj-navy-950 via-slate-900 to-samaj-navy-900 rounded-3xl p-6 sm:p-8 text-white relative shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-samaj-gold/20 text-samaj-gold-300 text-xs font-bold border border-samaj-gold/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>વહીવટી કાર્યાલય (Admin Command Portal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('admin_title')}
          </h1>
          <p className="text-xs text-slate-300">
            સક્રિય ઍડમિનિસ્ટ્રેટર: <strong>{user.profile?.full_name || user.phone}</strong> (હોદ્દો: <span className="uppercase text-amber-300">{user.role}</span>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAdminData}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>રિફ્રેશ (Refresh)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-samaj-gold hover:bg-samaj-gold-500 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Excel / CSV Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
            <span className="text-xs font-bold text-slate-500 uppercase">પ્રમાણિત સભ્યો</span>
            <div className="text-2xl sm:text-3xl font-black text-samaj-navy mt-1">
              {metrics.totalMembers}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">સક્રિય જ્ઞાતિજનો</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/20 shadow-subtle">
            <span className="text-xs font-bold text-amber-800 uppercase">નવી મંજૂરી બાકી</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
              {metrics.pendingApprovals}
            </div>
            <span className="text-[11px] text-amber-700 font-semibold">ચકાસણી જરૂરી</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-subtle">
            <span className="text-xs font-bold text-slate-500 uppercase">વૈવાહિક સંબંધો</span>
            <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">
              {metrics.matrimonyProfiles}
            </div>
            <span className="text-[11px] text-slate-400 font-semibold">સક્રિય બાયોડેટા</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-200 bg-emerald-50/20 shadow-subtle">
            <span className="text-xs font-bold text-emerald-800 uppercase">તિજોરી શિલ્લક</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">
              ₹{(metrics.netTreasuryBalance).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">કુલ એકત્રિત સેવા ફંડ</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs sm:text-sm font-bold border-b border-slate-200">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'approvals' ? 'border-samaj-gold text-samaj-navy' : 'border-transparent text-slate-400'
          }`}
        >
          નવી સભ્ય મંજૂરી ({pendingMembers.length})
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`pb-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'roles' ? 'border-samaj-gold text-samaj-navy' : 'border-transparent text-slate-400'
          }`}
        >
          હોદ્દા અને પરમિશન (RBAC Roles)
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'announcements' ? 'border-samaj-gold text-samaj-navy' : 'border-transparent text-slate-400'
          }`}
        >
          પરિપત્ર પ્રકાશિત કરો
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'events' ? 'border-samaj-gold text-samaj-navy' : 'border-transparent text-slate-400'
          }`}
        >
          નવો કાર્યક્રમ ઉમેરો
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 border-b-2 transition whitespace-nowrap ${
            activeTab === 'logs' ? 'border-samaj-gold text-samaj-navy' : 'border-transparent text-slate-400'
          }`}
        >
          ઓડિટ લોગ્સ (Audit Trail)
        </button>
      </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <div>
              <h3 className="font-bold text-base text-samaj-navy">નવા નોંધાયેલ સભ્યોની ચકાસણી</h3>
              <p className="text-xs text-slate-500">ગામ અને વિગત વેરિફાઈ કરી સભ્યપદ મંજૂર કરો</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {pendingMembers.length} અરજીઓ વિચારણા હેઠળ
            </span>
          </div>

          {pendingMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              કોઈ નવી સભ્ય અરજી પેન્ડિંગ નથી. તમામ સભ્યો મંજૂર થયેલ છે.
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
                        ફોન: <strong>+91 {m.phone}</strong> | મૂળ ગામ: <strong>{m.native_village || 'N/A'}</strong> | હાલ: {m.current_city || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ગોત્ર: {m.gotra || 'N/A'} | કુળદેવી: {m.kuldevi || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleApproveMember(m.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('approve_button')}</span>
                    </button>
                    <button
                      onClick={() => handleRejectMember(m.id)}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-red-50 hover:text-red-600 text-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{t('reject_button')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLE BASED ACCESS CONTROL */}
      {activeTab === 'roles' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle space-y-6">
          <div>
            <h3 className="font-bold text-base text-samaj-navy">હોદ્દા અને પરમિશન બદલો (RBAC)</h3>
            <p className="text-xs text-slate-500">
              Super Admin, President, Secretary, Treasurer અને કારોબારી સભ્યના હોદ્દા સોંપો
            </p>
          </div>

          <form onSubmit={handleRoleChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">યુઝર ID / ફોન નંબર *</label>
              <input
                type="text"
                required
                placeholder="દા.ત. u-mem-10 અથવા યુઝર ID"
                value={roleUserId}
                onChange={(e) => setRoleUserId(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">સોંપવા માટેનો હોદ્દો (New Role) *</label>
              <select
                value={roleSelect}
                onChange={(e) => setRoleSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
              >
                <option value="super_admin">👑 Super Admin (સર્વોચ્ચ નિયંત્રણ)</option>
                <option value="president">🏛️ President (પ્રમુખ)</option>
                <option value="secretary">📜 Secretary (મહામંત્રી)</option>
                <option value="treasurer">💰 Treasurer (ખજાનચી)</option>
                <option value="committee">👥 Committee Member (કારોબારી સભ્ય)</option>
                <option value="member">👤 Member (સામાન્ય સભ્ય)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              હોદ્દો અપડેટ કરો (Update Role)
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PUBLISH ANNOUNCEMENT */}
      {activeTab === 'announcements' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle space-y-6">
          <h3 className="font-bold text-base text-samaj-navy">નવો સત્તાવાર પરિપત્ર પ્રકાશિત કરો</h3>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">પરિપત્ર શીર્ષક (ગુજરાતી) *</label>
              <input
                type="text"
                required
                value={ancForm.title_gu}
                onChange={(e) => setAncForm({ ...ancForm, title_gu: e.target.value, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">કેટેગરી *</label>
                <select
                  value={ancForm.category}
                  onChange={(e) => setAncForm({ ...ancForm, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="notice">સત્તાવાર નોટિસ (Notice)</option>
                  <option value="urgent">તાકીદનું (Urgent)</option>
                  <option value="achievement">વિદ્યાર્થી સિદ્ધિ / સન્માન</option>
                  <option value="condolence">દુઃખદ અવસાન (બેસણું)</option>
                  <option value="wedding">લગ્ન પ્રસંગ</option>
                  <option value="birthday">જન્મદિવસ શુભેચ્છા</option>
                </select>
              </div>

              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={ancForm.is_urgent}
                    onChange={(e) => setAncForm({ ...ancForm, is_urgent: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>તાકીદનું (Urgent)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={ancForm.is_pinned}
                    onChange={(e) => setAncForm({ ...ancForm, is_pinned: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span>ટોચ પર પિન કરો</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">સંપૂર્ણ વિગત (Content) *</label>
              <textarea
                rows={4}
                required
                value={ancForm.content}
                onChange={(e) => setAncForm({ ...ancForm, content: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              પરિપત્ર પ્રકાશિત કરો
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: CREATE EVENT */}
      {activeTab === 'events' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-subtle space-y-6">
          <h3 className="font-bold text-base text-samaj-navy">નવો સમાજ કાર્યક્રમ આયોજિત કરો</h3>

          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">કાર્યક્રમનું નામ (Title) *</label>
              <input
                type="text"
                required
                value={evForm.title_gu}
                onChange={(e) => setEvForm({ ...evForm, title_gu: e.target.value, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">સ્થળ (Venue Name) *</label>
                <input
                  type="text"
                  required
                  value={evForm.venue_name}
                  onChange={(e) => setEvForm({ ...evForm, venue_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">શહેર (City) *</label>
                <input
                  type="text"
                  required
                  value={evForm.city}
                  onChange={(e) => setEvForm({ ...evForm, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">શરૂઆત તારીખ અને સમય *</label>
                <input
                  type="datetime-local"
                  required
                  value={evForm.start_time}
                  onChange={(e) => setEvForm({ ...evForm, start_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">સમાપ્તિ તારીખ અને સમય *</label>
                <input
                  type="datetime-local"
                  required
                  value={evForm.end_time}
                  onChange={(e) => setEvForm({ ...evForm, end_time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">કાર્યક્રમ વર્ણન *</label>
              <textarea
                rows={3}
                required
                value={evForm.description}
                onChange={(e) => setEvForm({ ...evForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              કાર્યક્રમ પ્રકાશિત કરો (Publish Event)
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle space-y-4">
          <h3 className="font-bold text-base text-samaj-navy">વહીવટી ઓડિટ પ્રવૃત્તિ નોંધ (Admin Activity Logs)</h3>

          <div className="space-y-2 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 uppercase tracking-wider">{log.action}</span>
                  <span className="text-slate-500 block">
                    Admin: {log.admin_name} (+91 {log.admin_phone}) | Target: {log.target_type} ({log.target_id})
                  </span>
                </div>
                <span className="text-slate-400 font-mono">
                  {new Date(log.created_at).toLocaleString('gu-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
