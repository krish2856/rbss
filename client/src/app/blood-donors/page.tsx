'use client';

import React, { useState, useEffect } from 'react';
import { Droplet, Phone, Plus, MapPin, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export default function BloodDonorsPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bloodFilter, setBloodFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Register modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regForm, setRegForm] = useState({
    full_name: user?.profile?.full_name || '',
    blood_group: 'O+',
    city: user?.profile?.current_city || 'Ahmedabad',
    phone: user?.phone || '',
    emergency_notes: 'Available for emergency requests',
  });

  const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  const cities = ['All', 'Ahmedabad', 'Rajkot', 'Bhuj - Kutch', 'Vadodara', 'Surat', 'Jamnagar', 'Gandhidham'];

  const loadDonors = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (bloodFilter && bloodFilter !== 'All') q.append('blood_group', bloodFilter);
      if (cityFilter && cityFilter !== 'All') q.append('city', cityFilter);

      const res = await fetchApi(`/blood-donors?${q.toString()}`);
      setDonors(res.donors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, [bloodFilter, cityFilter]);

  const handleRegisterDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in first.');
      return;
    }

    try {
      await fetchApi('/blood-donors/register', {
        method: 'POST',
        body: JSON.stringify(regForm),
      });
      alert('Registered as a voluntary blood donor successfully. Thank you!');
      setShowRegisterModal(false);
      loadDonors();
    } catch (err: any) {
      alert(err.message || 'Failed to register.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-samaj-navy-950 rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30">
            <Droplet className="w-3.5 h-3.5" />
            <span>Emergency Lifesaving Network</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Emergency Blood Donors Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Voluntary blood donor network of Rajgor Brahmin Samaj members across Gujarat ready to assist patients during medical emergencies.
          </p>
        </div>
      </div>

      {/* Filter and Register Action */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span>Blood Group:</span>
            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border rounded-lg text-slate-800 font-medium"
            >
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span>City:</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border rounded-lg text-slate-800 font-medium"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 touch-manipulation active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register as Donor</span>
        </button>
      </div>

      {/* Donors Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Loading blood donors...</div>
      ) : donors.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500 border border-slate-200 text-sm">
          No blood donors registered matching this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {donors.map((d) => (
            <div
              key={d.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-black flex items-center justify-center text-base shrink-0 shadow-xs">
                  {d.blood_group}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug truncate">
                    {d.full_name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{d.city}</span>
                  </div>
                  {d.emergency_notes && (
                    <p className="text-[11px] text-slate-400 mt-1 truncate">
                      {d.emergency_notes}
                    </p>
                  )}
                </div>
              </div>

              <a
                href={`tel:${d.phone}`}
                className="p-3 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 font-bold transition shrink-0 touch-manipulation active:scale-90"
                title="Call Donor"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 pb-[env(safe-area-inset-bottom,16px)]">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy flex items-center gap-2">
                <Droplet className="w-4 h-4 text-red-600" />
                <span>Voluntary Blood Donor Registration</span>
              </h3>
              <button onClick={() => setShowRegisterModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 touch-manipulation">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDonor} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={regForm.full_name}
                  onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={regForm.blood_group}
                    onChange={(e) => setRegForm({ ...regForm, blood_group: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={regForm.city}
                    onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Availability Notes</label>
                <input
                  type="text"
                  value={regForm.emergency_notes}
                  onChange={(e) => setRegForm({ ...regForm, emergency_notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition touch-manipulation active:scale-98"
              >
                Register as Voluntary Donor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
