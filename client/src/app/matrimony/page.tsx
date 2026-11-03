'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  X,
  Phone,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export default function MatrimonyPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'browse' | 'interests' | 'my_biodata'>('browse');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState('');
  const [gotraFilter, setGotraFilter] = useState('');
  const [manglikFilter, setManglikFilter] = useState('');

  // Interests state
  const [myInterests, setMyInterests] = useState<{ sent: any[]; received: any[] }>({
    sent: [],
    received: [],
  });

  // Modals
  const [interestTarget, setInterestTarget] = useState<any>(null);
  const [interestNote, setInterestNote] = useState('Jay Parshuram. We are interested in your matrimonial profile. Please review our details and let us know if we can connect further.');
  const [sendSuccess, setSendSuccess] = useState('');
  const [selectedBiodata, setSelectedBiodata] = useState<any>(null);

  // My Biodata Form
  const [biodataForm, setBiodataForm] = useState({
    height_cm: 172,
    weight_kg: 68,
    complexion: 'Fair',
    rashi: 'Kanya (Virgo)',
    nakshatra: 'Hasta',
    manglik: 'no',
    diet: 'pure_vegetarian',
    annual_income: '15 - 18 Lakhs INR',
    partner_expectations: 'Looking for a cultured, educated Brahmin bride/groom with strong family values.',
    hobbies: 'Reading, spiritual events, travel, music',
  });

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (genderFilter) q.append('gender', genderFilter);
      if (gotraFilter) q.append('gotra', gotraFilter);
      if (manglikFilter) q.append('manglik', manglikFilter);

      const res = await fetchApi(`/matrimony/profiles?${q.toString()}`);
      setProfiles(res.profiles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInterests = async () => {
    if (!user) return;
    try {
      const res = await fetchApi('/matrimony/interests/my');
      setMyInterests({ sent: res.sent || [], received: res.received || [] });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProfiles();
    if (user) {
      loadInterests();
    }
  }, [genderFilter, gotraFilter, manglikFilter, user]);

  const handleSendInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestTarget) return;

    try {
      await fetchApi('/matrimony/interest/send', {
        method: 'POST',
        body: JSON.stringify({
          receiver_user_id: interestTarget.user_id,
          note: interestNote,
        }),
      });
      setSendSuccess('Matrimonial interest request sent successfully.');
      setTimeout(() => {
        setInterestTarget(null);
        setSendSuccess('');
        loadInterests();
      }, 1800);
    } catch (err: any) {
      alert(err.message || 'Failed to send interest.');
    }
  };

  const handleRespondInterest = async (interestId: string, action: 'accept' | 'reject') => {
    try {
      await fetchApi('/matrimony/interest/respond', {
        method: 'POST',
        body: JSON.stringify({ interest_id: interestId, action }),
      });
      loadInterests();
    } catch (err: any) {
      alert(err.message || 'Failed to update interest.');
    }
  };

  const handleSaveMyBiodata = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/matrimony/profile/upsert', {
        method: 'POST',
        body: JSON.stringify(biodataForm),
      });
      alert('Your matrimonial biodata has been saved successfully.');
      loadProfiles();
      setActiveTab('browse');
    } catch (err: any) {
      alert(err.message || 'Failed to save biodata.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-samaj-navy-950 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <Heart className="w-3.5 h-3.5 fill-rose-400" />
            <span>RBSS Matrimony Portal</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Verified Samaj Matrimonial Biodatas
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Find suitable brides and grooms within the Rajgor Brahmin community with mutual contact privacy and verified family backgrounds.
          </p>
        </div>
      </div>

      {/* Responsive Horizontal Scroll Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs sm:text-sm font-bold overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('browse')}
          className={`pb-2.5 px-3 sm:px-4 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition touch-manipulation ${
            activeTab === 'browse'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>All Profiles ({profiles.length})</span>
        </button>

        {user && (
          <button
            onClick={() => setActiveTab('interests')}
            className={`pb-2.5 px-3 sm:px-4 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition touch-manipulation ${
              activeTab === 'interests'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>
              Interests ({myInterests.received.length + myInterests.sent.length})
            </span>
          </button>
        )}

        {user && (
          <button
            onClick={() => setActiveTab('my_biodata')}
            className={`pb-2.5 px-3 sm:px-4 flex items-center gap-1.5 border-b-2 whitespace-nowrap transition touch-manipulation ${
              activeTab === 'my_biodata'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Biodata</span>
          </button>
        )}
      </div>

      {/* TAB 1: BROWSE PROFILES */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Mobile-Friendly Filters */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span>Looking for:</span>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="">All</option>
                <option value="female">Brides (કન્યાઓ)</option>
                <option value="male">Grooms (યુવકો)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Manglik Status:</span>
              <select
                value={manglikFilter}
                onChange={(e) => setManglikFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="">All</option>
                <option value="no">Non-Manglik</option>
                <option value="anshik">Anshik Manglik</option>
                <option value="yes">Manglik</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-slate-200 text-sm">
              No matrimonial profiles found matching criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Photo with badges */}
                    <div className="relative h-60 bg-slate-100 overflow-hidden group">
                      <img
                        src={p.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&fit=crop&q=80'}
                        alt={p.full_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="px-2.5 py-1 rounded-full bg-white/95 text-samaj-navy text-xs font-bold shadow-xs">
                          {p.age} Yrs • {p.height_cm} cm
                        </span>
                        {p.is_verified && (
                          <span className="px-2 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-samaj-navy/90 text-amber-300 text-[10px] font-semibold backdrop-blur-xs">
                        Rashi: {p.rashi}
                      </div>
                    </div>

                    {/* Bio Specs */}
                    <div className="p-4 sm:p-5 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                          {p.full_name}
                        </h3>
                        <p className="text-xs font-semibold text-orange-600 mt-0.5">
                          Gotra: {p.gotra} • Kuldevi: {p.kuldevi}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.education}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{p.occupation} ({p.annual_income})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">Native: {p.native_village} • City: {p.current_city}</span>
                        </div>
                      </div>

                      {p.partner_expectations && (
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                          Expectation: &quot;{p.partner_expectations}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <button
                      onClick={() => setSelectedBiodata(p)}
                      className="px-3 py-2 text-xs font-bold text-slate-700 hover:text-samaj-navy bg-slate-100 rounded-xl transition touch-manipulation active:scale-95"
                    >
                      View Biodata
                    </button>

                    <button
                      onClick={() => setInterestTarget(p)}
                      className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 touch-manipulation active:scale-95"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      <span>Send Interest</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY INTERESTS */}
      {activeTab === 'interests' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-samaj-navy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Received Proposals ({myInterests.received.length})</span>
            </h3>

            {myInterests.received.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No proposals received yet.</p>
            ) : (
              <div className="space-y-3">
                {myInterests.received.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&fit=crop&q=80'}
                        alt={item.full_name}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-200 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.full_name}</h4>
                        <p className="text-xs text-slate-500">
                          Gotra: {item.gotra} • City: {item.current_city}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 italic">&quot;{item.note}&quot;</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {item.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleRespondInterest(item.id, 'accept')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition touch-manipulation active:scale-95"
                          >
                            Accept & Unlock Phone
                          </button>
                          <button
                            onClick={() => handleRespondInterest(item.id, 'reject')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition touch-manipulation active:scale-95"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Accepted – Phone: {item.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-samaj-navy flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Sent Proposals ({myInterests.sent.length})</span>
            </h3>

            {myInterests.sent.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">You have not sent any interest requests yet.</p>
            ) : (
              <div className="space-y-3">
                {myInterests.sent.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&fit=crop&q=80'}
                        alt={item.full_name}
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.full_name}</h4>
                        <p className="text-xs text-slate-500">City: {item.current_city}</p>
                      </div>
                    </div>

                    <div className="text-xs font-bold">
                      {item.status === 'accepted' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Accepted – Phone: {item.phone}</span>
                        </span>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY BIODATA FORM */}
      {activeTab === 'my_biodata' && (
        <div className="max-w-2xl bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-samaj-navy">
            Register or Edit Matrimonial Biodata
          </h2>

          <form onSubmit={handleSaveMyBiodata} className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={biodataForm.height_cm}
                  onChange={(e) => setBiodataForm({ ...biodataForm, height_cm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Annual Income</label>
                <input
                  type="text"
                  value={biodataForm.annual_income}
                  onChange={(e) => setBiodataForm({ ...biodataForm, annual_income: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rashi</label>
                <input
                  type="text"
                  value={biodataForm.rashi}
                  onChange={(e) => setBiodataForm({ ...biodataForm, rashi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Manglik Status</label>
                <select
                  value={biodataForm.manglik}
                  onChange={(e) => setBiodataForm({ ...biodataForm, manglik: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="no">Non-Manglik</option>
                  <option value="anshik">Anshik Manglik</option>
                  <option value="yes">Manglik</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Partner Expectations
              </label>
              <textarea
                rows={3}
                value={biodataForm.partner_expectations}
                onChange={(e) => setBiodataForm({ ...biodataForm, partner_expectations: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition touch-manipulation active:scale-98"
            >
              Save Biodata Profile
            </button>
          </form>
        </div>
      )}

      {/* Modal: Send Interest */}
      {interestTarget && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Send Matrimonial Interest</span>
              </h3>
              <button onClick={() => setInterestTarget(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sendSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800">{sendSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSendInterest} className="space-y-4 text-sm">
                <p className="text-xs text-slate-600">
                  You are sending an interest request to <strong>{interestTarget.full_name}</strong>. Phone numbers are unlocked mutually once accepted.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Introduction Message
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={interestNote}
                    onChange={(e) => setInterestNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-samaj-navy"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition touch-manipulation active:scale-98"
                >
                  Confirm & Send Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Full Biodata Preview */}
      {selectedBiodata && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy">Complete Marriage Biodata</h3>
              <button onClick={() => setSelectedBiodata(null)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedBiodata.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80'}
                  alt={selectedBiodata.full_name}
                  className="w-18 h-18 rounded-2xl object-cover border-2 border-orange-400 shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">{selectedBiodata.full_name}</h4>
                  <p className="text-orange-600 font-bold">Gotra: {selectedBiodata.gotra} • {selectedBiodata.kuldevi}</p>
                  <p className="text-slate-500">{selectedBiodata.age} Yrs • {selectedBiodata.height_cm} cm • {selectedBiodata.complexion}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Rashi: <strong>{selectedBiodata.rashi}</strong></div>
                <div>Manglik: <strong>{selectedBiodata.manglik}</strong></div>
                <div>Education: <strong>{selectedBiodata.education}</strong></div>
                <div>Occupation: <strong>{selectedBiodata.occupation}</strong></div>
                <div>Income: <strong>{selectedBiodata.annual_income}</strong></div>
                <div>Native Village: <strong>{selectedBiodata.native_village}</strong></div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <h5 className="font-bold text-slate-800 mb-1">Partner Expectations:</h5>
                <p className="text-slate-600">{selectedBiodata.partner_expectations}</p>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-center text-slate-600 font-medium">
                🔒 Privacy: Contact numbers are shared only upon mutual consent.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
