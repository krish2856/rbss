'use client';

import React, { useState, useEffect } from 'react';
import { Landmark, Shield, Sparkles, MapPin, Phone, Mail, Award, BookOpen } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { fetchApi } from '../../lib/api';

export default function HistoryPage() {
  const { t } = useI18n();
  const [history, setHistory] = useState<any>(null);
  const [temples, setTemples] = useState<any[]>([]);
  const [committee, setCommittee] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchApi('/samaj/history'),
      fetchApi('/samaj/temples'),
      fetchApi('/samaj/committee'),
    ])
      .then(([hRes, tRes, cRes]) => {
        setHistory(hRes.history);
        setTemples(tRes.temples || []);
        setCommittee(cRes.committee || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-samaj-navy-950 rounded-3xl p-5 sm:p-10 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Landmark className="w-3.5 h-3.5" />
            <span>Vedic Heritage & Cultural Legacy</span>
          </div>
          <h1 className="text-xl sm:text-4xl font-extrabold tracking-tight">
            Rajgor Brahmin Samaj – History & Traditions
          </h1>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            Preserving centuries of sacred Vedic traditions, spiritual lineage, Kuldevi shrines, and social leadership across Gujarat and worldwide.
          </p>
        </div>
      </div>

      {/* History Narrative */}
      {history && (
        <section className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-samaj-navy mb-3">
              {history.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {history.origin}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {history.principles?.map((p: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
                  {p.title}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Executive Committee */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-samaj-navy">
              Executive Committee & Office Bearers
            </h2>
            <p className="text-xs text-slate-500">RBSS Ahmedabad (2024-2027)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {committee.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4"
            >
              <img
                src={c.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&fit=crop&q=80'}
                alt={c.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-orange-500/30 shrink-0"
              />
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 truncate">{c.name}</h3>
                <span className="text-xs font-bold text-orange-600 block mt-0.5 truncate">
                  {c.designation}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{c.city}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Temples & Pilgrimage */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-samaj-navy">
              Kuldevi Temples & Sacred Pilgrimage Shrines
            </h2>
            <p className="text-xs text-slate-500">Historical shrines of Rajgor Gotras</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {temples.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="h-44 sm:h-52 bg-slate-100 overflow-hidden">
                  <img
                    src={t.photo_url}
                    alt={t.temple_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 sm:p-5 space-y-2">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block">
                    Deity: {t.deity_name}
                  </span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {t.temple_name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{t.location}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {t.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
