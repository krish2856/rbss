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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { fetchApi } from '../../lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAdmin, updateUser } = useAuth();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-samaj-navy to-slate-900 text-samaj-gold font-black flex items-center justify-center text-3xl shadow-md border-2 border-samaj-gold/40">
            {profile.full_name ? profile.full_name[0] : '🕉️'}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {profile.full_name || 'Samaj Member'}
              </h1>
              {user.is_approved ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>પ્રમાણિત સભ્ય (Approved)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  મંજૂરી પ્રક્રિયા હેઠળ (Pending Review)
                </span>
              )}
            </div>

            <div className="text-xs text-slate-500 font-semibold mt-1">
              ફોન: +91 {user.phone} | હોદ્દો: <strong className="text-samaj-navy uppercase">{user.role}</strong>
            </div>

            <div className="text-xs text-samaj-gold-700 font-bold mt-1">
              ગોત્ર: {profile.gotra} | કુળદેવી: {profile.kuldevi}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2.5 bg-samaj-navy hover:bg-slate-800 text-samaj-gold text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{t('nav_admin')}</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>પ્રોફાઇલ વિગતો સફળતાપૂર્વક અપડેટ થઈ ગઈ છે.</span>
        </div>
      )}

      {/* Profile Edit Form */}
      <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-base text-samaj-navy">
            વ્યક્તિગત પ્રોફાઇલ ફેરફાર
          </h2>

          {/* Phone Privacy Toggle */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-500">ડિરેક્ટરીમાં ફોન નંબર:</span>
            <button
              type="button"
              onClick={() => setProfile({ ...profile, phone_visible: !profile.phone_visible })}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                profile.phone_visible
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {profile.phone_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{profile.phone_visible ? 'જાહેર (Visible)' : 'સુરક્ષિત (Masked)'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">પૂરું નામ *</label>
            <input
              type="text"
              required
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">પિતા / પતિનું નામ</label>
            <input
              type="text"
              value={profile.father_name || ''}
              onChange={(e) => setProfile({ ...profile, father_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">મૂળ ગામ *</label>
            <input
              type="text"
              required
              value={profile.native_village || ''}
              onChange={(e) => setProfile({ ...profile, native_village: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">હાલનું શહેર *</label>
            <input
              type="text"
              required
              value={profile.current_city || ''}
              onChange={(e) => setProfile({ ...profile, current_city: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">અભ્યાસ (Education)</label>
            <input
              type="text"
              value={profile.education || ''}
              onChange={(e) => setProfile({ ...profile, education: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">વ્યવસાય (Occupation)</label>
            <input
              type="text"
              value={profile.occupation || ''}
              onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">પરિચય / બાયો (Bio)</label>
          <textarea
            rows={2}
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-3 py-2 border rounded-xl text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-samaj-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
        >
          <Save className="w-4 h-4 text-samaj-gold" />
          <span>{loading ? t('loading') : t('save')}</span>
        </button>
      </form>

      {/* Family Details Module */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-samaj-navy">
              પરિવાર વિગત (Family Members)
            </h3>
            <p className="text-xs text-slate-500">
              સમાજ ડિરેક્ટરીમાં આપના કુટુંબની સભ્યોની યાદી
            </p>
          </div>
          <button
            onClick={() => setShowAddFamily(true)}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-samaj-navy hover:text-white text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>સભ્ય ઉમેરો</span>
          </button>
        </div>

        {family.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">કોઈ કુટુંબીજન નોંધાયેલ નથી.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {family.map((fam) => (
              <div
                key={fam.id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{fam.full_name}</h4>
                  <span className="text-slate-500 font-medium">
                    સંબંધ: {fam.relation} {fam.age ? `(${fam.age} વર્ષ)` : ''}
                  </span>
                  {fam.occupation && (
                    <span className="block text-[11px] text-slate-400 mt-0.5">{fam.occupation}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Family Member Modal */}
      {showAddFamily && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h3 className="font-bold text-base text-samaj-navy mb-4">
              પરિવારના સભ્યની વિગત ઉમેરો
            </h3>

            <form onSubmit={handleAddFamilySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">પૂરું નામ *</label>
                <input
                  type="text"
                  required
                  value={familyForm.full_name}
                  onChange={(e) => setFamilyForm({ ...familyForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">સંબંધ (Relation) *</label>
                  <select
                    value={familyForm.relation}
                    onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="Father">પિતા (Father)</option>
                    <option value="Mother">માતા (Mother)</option>
                    <option value="Brother">ભાઈ (Brother)</option>
                    <option value="Sister">બહેન (Sister)</option>
                    <option value="Spouse">પત્ની / પતિ (Spouse)</option>
                    <option value="Son">પુત્ર (Son)</option>
                    <option value="Daughter">પુત્રી (Daughter)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ઉંમર (Age)</label>
                  <input
                    type="number"
                    value={familyForm.age}
                    onChange={(e) => setFamilyForm({ ...familyForm, age: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">અભ્યાસ / વ્યવસાય</label>
                <input
                  type="text"
                  value={familyForm.occupation}
                  onChange={(e) => setFamilyForm({ ...familyForm, occupation: e.target.value })}
                  placeholder="Student / Job"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-samaj-navy text-white font-bold rounded-xl"
                >
                  ઉમેરો (Add)
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFamily(false)}
                  className="px-4 py-2.5 bg-slate-100 font-bold rounded-xl"
                >
                  રદ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
