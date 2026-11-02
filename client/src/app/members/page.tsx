'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Eye,
  X,
  Users,
  Droplet,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export default function MembersPage() {
  const { t, lang } = useI18n();
  const { user } = useAuth();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [selectedGotra, setSelectedGotra] = useState('');

  const [activeMember, setActiveMember] = useState<any>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (selectedCity) queryParams.append('city', selectedCity);
      if (selectedVillage) queryParams.append('village', selectedVillage);
      if (selectedGotra) queryParams.append('gotra', selectedGotra);

      const res = await fetchApi(`/members?${queryParams.toString()}`);
      setMembers(res.members || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedCity, selectedVillage, selectedGotra]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleOpenDetail = async (memberId: string) => {
    try {
      const res = await fetchApi(`/members/${memberId}`);
      setActiveMember(res.member);
    } catch (err) {
      console.error(err);
    }
  };

  const cities = ['All', 'Ahmedabad', 'Rajkot', 'Bhuj - Kutch', 'Vadodara', 'Surat', 'Gandhidham', 'Jamnagar'];
  const gotras = ['All', 'Kashyap', 'Gautam', 'Bharadwaj', 'Vashistha', 'Parashar', 'Shandilya', 'Kaushik', 'Garg', 'Vatsa'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Banner */}
      <div className="bg-gradient-to-r from-samaj-navy-950 via-samaj-navy-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <Users className="w-3.5 h-3.5" />
            <span>{t('directory_title')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {lang === 'gu' ? 'રાજગોર બ્રાહ્મણ સભ્ય ડિરેક્ટરી' : 'RBSS Member Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('directory_desc')}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-subtle space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-samaj-navy"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-samaj-navy hover:bg-slate-900 text-white text-xs sm:text-sm font-bold rounded-xl transition"
          >
            {t('search')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
            <span>{lang === 'gu' ? 'શહેર:' : 'City:'}</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value === 'All' ? '' : e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
            <span>{lang === 'gu' ? 'ગોત્ર:' : 'Gotra:'}</span>
            <select
              value={selectedGotra}
              onChange={(e) => setSelectedGotra(e.target.value === 'All' ? '' : e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              {gotras.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-400 ml-auto font-medium">
            Total: <strong className="text-samaj-navy">{members.length}</strong>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">{t('loading')}</div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          No members found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-subtle hover:shadow-card hover:border-samaj-navy transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <img
                    src={member.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&fit=crop&q=80'}
                    alt={member.full_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 leading-snug truncate">
                      {member.full_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-samaj-gold font-bold mt-0.5">
                      <span>Gotra: {member.gotra}</span>
                      <span>•</span>
                      <span>{member.kuldevi}</span>
                    </div>
                    {member.blood_group && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 mt-1">
                        <Droplet className="w-2.5 h-2.5" />
                        <span>{member.blood_group}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Village: <strong className="text-slate-800">{member.native_village}</strong> | City: {member.current_city}
                    </span>
                  </div>

                  {member.occupation && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.occupation}</span>
                    </div>
                  )}

                  {member.education && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.education}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`tel:${member.phone}`}
                  className="text-xs font-bold text-samaj-navy hover:text-samaj-gold flex items-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-samaj-gold" />
                  <span>{member.phone || 'Phone Protected'}</span>
                </a>

                <button
                  onClick={() => handleOpenDetail(member.id)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-samaj-navy hover:text-white text-slate-800 text-xs font-bold rounded-lg transition"
                >
                  {t('view')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Details Modal */}
      {activeMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h2 className="font-bold text-base text-samaj-navy">
                Member Profile Information
              </h2>
              <button
                onClick={() => setActiveMember(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3.5">
                <img
                  src={activeMember.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&fit=crop&q=80'}
                  alt={activeMember.full_name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-samaj-navy shrink-0"
                />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                    {activeMember.full_name}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    {activeMember.father_name ? `Father: ${activeMember.father_name}` : ''}
                  </p>
                  <p className="text-samaj-gold font-bold mt-1">
                    Gotra: {activeMember.gotra} | Kuldevi: {activeMember.kuldevi}
                  </p>
                </div>
              </div>

              {activeMember.bio && (
                <div className="p-3 bg-slate-50 rounded-xl border text-slate-600 italic">
                  &quot;{activeMember.bio}&quot;
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <span className="text-slate-400 block font-medium">Native Village:</span>
                  <span className="font-bold text-slate-800">{activeMember.native_village}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Current City:</span>
                  <span className="font-bold text-slate-800">{activeMember.current_city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Blood Group:</span>
                  <span className="font-bold text-red-600">{activeMember.blood_group || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Education:</span>
                  <span className="font-bold text-slate-800">{activeMember.education || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block font-medium">Occupation:</span>
                  <span className="font-bold text-slate-800">{activeMember.occupation || 'N/A'}</span>
                </div>
              </div>

              <a
                href={`tel:${activeMember.phone}`}
                className="w-full py-3 bg-samaj-navy text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition"
              >
                <Phone className="w-4 h-4 text-samaj-gold" />
                <span>Call: {activeMember.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
