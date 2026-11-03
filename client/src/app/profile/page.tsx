'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Save,
  LogOut,
  MapPin,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  ShieldAlert,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { fetchApi } from '../../lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form
  const [profile, setProfile] = useState<any>({
    full_name: '',
    father_name: '',
    surname: '',
    gotra: '',
    kuldevi: '',
    native_village: '',
    current_city: '',
    education: '',
    occupation: '',
    company_or_business: '',
    blood_group: '',
    phone_visible: true,
    bio: '',
    address: '',
  });

  const [family, setFamily] = useState<any[]>([]);

  // Add Family modal state
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [familyForm, setFamilyForm] = useState({
    full_name: '',
    relation: 'Father',
    age: '',
    education: '',
    occupation: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchApi('/auth/me')
      .then((res) => {
        if (res.user?.profile) {
          setProfile(res.user.profile);
        }
      })
      .catch((err) => console.error(err));

    fetchApi(`/members/${user.id}`)
      .then((res) => {
        if (res.member?.family) {
          setFamily(res.member.family);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/members/profile/update', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/members/family/add', {
        method: 'POST',
        body: JSON.stringify(familyForm),
      });
      setFamily([...family, res.familyMember]);
      setShowAddFamily(false);
      setFamilyForm({ full_name: '', relation: 'Father', age: '', education: '', occupation: '' });
    } catch (err: any) {
      alert(err.message || 'Failed to add family member.');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-samaj-navy to-slate-900 text-orange-400 font-black flex items-center justify-center text-3xl shadow-md border-2 border-orange-500/30 shrink-0">
            {profile.full_name ? profile.full_name[0] : '🕉️'}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-slate-900">
                {profile.full_name || 'Samaj Member'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Member</span>
              </span>
            </div>

            <div className="text-xs text-slate-500 font-semibold mt-1">
              Phone: +91 {user.phone} • Role: <strong className="text-orange-600 uppercase">{user.role}</strong>
            </div>

            <div className="text-xs text-orange-600 font-bold mt-1">
              Gotra: {profile.gotra} • Kuldevi: {profile.kuldevi}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="px-3.5 py-2 bg-samaj-navy hover:bg-slate-800 text-orange-400 text-xs font-bold rounded-xl flex items-center gap-1.5 transition touch-manipulation active:scale-95"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition touch-manipulation active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Profile details updated successfully.</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-base text-samaj-navy">
            Edit Personal Profile
          </h2>

          {/* Phone Privacy Toggle */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500 hidden sm:inline">Phone Visibility:</span>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, phone_visible: !profile.phone_visible })}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition touch-manipulation active:scale-95 ${
                profile.phone_visible
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {profile.phone_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{profile.phone_visible ? 'Public' : 'Protected'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Father / Husband Name</label>
            <input
              type="text"
              value={profile.father_name || ''}
              onChange={(e) => setProfile({ ...profile, father_name: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Native Village *</label>
            <input
              type="text"
              required
              value={profile.native_village || ''}
              onChange={(e) => setProfile({ ...profile, native_village: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Current City *</label>
            <input
              type="text"
              required
              value={profile.current_city || ''}
              onChange={(e) => setProfile({ ...profile, current_city: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Education</label>
            <input
              type="text"
              value={profile.education || ''}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Occupation / Profession</label>
            <input
              type="text"
              value={profile.occupation || ''}
              onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
            <select
              value={profile.blood_group || ''}
              onChange={(e) => setProfile({ ...profile, blood_group: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
            >
              <option value="">Select Blood Group</option>
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              className="w-full px-3.5 py-2.5 border rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Short Bio</label>
          <textarea
            rows={2}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 border rounded-xl text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-samaj-navy hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 touch-manipulation active:scale-98"
        >
          <Save className="w-4 h-4 text-orange-400" />
          <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </form>

      {/* Family Details Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-base text-samaj-navy">Family Members</h2>
            <p className="text-xs text-slate-500">Add dependents and family records</p>
          </div>

          <button
            onClick={() => setShowAddFamily(true)}
            className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-xs rounded-xl flex items-center gap-1 transition touch-manipulation active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        {family.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">No family members registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {family.map((f, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-2xl border flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{f.full_name}</h4>
                  <span className="text-slate-500">{f.relation} • Age: {f.age || 'N/A'}</span>
                </div>
                <span className="font-semibold text-slate-700">{f.occupation || ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Family Member Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy">Add Family Member</h3>
              <button onClick={() => setShowAddFamily(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFamilySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={familyForm.full_name}
                  onChange={(e) => setFamilyForm({ ...familyForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Relation *</label>
                  <select
                    value={familyForm.relation}
                    onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl bg-white"
                  >
                    {['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={familyForm.age}
                    onChange={(e) => setFamilyForm({ ...familyForm, age: e.target.value })}
                    className="w-full px-3.5 py-2.5 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Education</label>
                <input
                  type="text"
                  value={familyForm.education}
                  onChange={(e) => setFamilyForm({ ...familyForm, education: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={familyForm.occupation}
                  onChange={(e) => setFamilyForm({ ...familyForm, occupation: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition touch-manipulation active:scale-98"
              >
                Add Family Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
