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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-samaj-navy-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Landmark className="w-3.5 h-3.5" />
            <span>ગૌરવશાળી વારસો અને વેદ સંસ્કૃતિ</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            રાજગોર બ્રાહ્મણ સમાજ – ઇતિહાસ અને પરંપરા
          </h1>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            કચ્છ, સૌરાષ્ટ્ર અને ગુજરાતના રાજવી વંશોના રાજપુરોહિત-રાજગુરુ તરીકે ધર્મ, સંસ્કાર અને નીતિનું માર્ગદર્શન કરતો આદરણીય બ્રાહ્મણ સમાજ.
          </p>
        </div>
      </div>

      {/* History Narrative & Principles */}
      {history && (
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-subtle space-y-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-samaj-navy mb-4">
              {history.title_gu}
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {history.origin}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {history.principles?.map((p: any, idx: number) => (
              <div
                key={idx}
                className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60 space-y-2"
              >
                <div className="w-8 h-8 rounded-lg bg-samaj-gold text-slate-950 font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-sm text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Gotras and Kuldevis reference pills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-samaj-navy flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-samaj-gold" />
                <span>પવિત્ર ઋષિ ગોત્રાવલી (Gotras)</span>
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {history.gotras?.map((g: string) => (
                  <span
                    key={g}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 font-semibold text-slate-800"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm text-samaj-navy flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-samaj-gold" />
                <span>આરાધ્ય કુળદેવીઓ (Kuldevis)</span>
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {history.kuldevis?.map((k: string) => (
                  <span
                    key={k}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-semibold text-amber-900"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sacred Temples Directory */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-samaj-navy">
            પવિત્ર યાત્રાધામો અને મંદિર પરિચય
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            કુળદેવી માતાજીના પ્રખ્યાત ધામ અને દર્શન સ્થળો
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {temples.map((tmp) => (
            <div
              key={tmp.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-subtle hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="h-48 overflow-hidden bg-slate-100 relative">
                  <img
                    src={tmp.photo_url}
                    alt={tmp.temple_name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 text-amber-300 text-xs font-bold backdrop-blur-xs">
                    {tmp.deity_name_gu || tmp.deity_name}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {tmp.temple_name_gu || tmp.temple_name}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-samaj-gold shrink-0 mt-0.5" />
                    <span>{tmp.location}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed pt-1">
                    {tmp.description}
                  </p>
                </div>
              </div>

              {tmp.contact_phone && (
                <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 mt-2">
                  <span className="font-semibold">મંદિર સંપર્ક:</span>
                  <a href={`tel:${tmp.contact_phone}`} className="font-bold text-samaj-navy hover:underline">
                    {tmp.contact_phone}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Official Executive Committee Directory */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-samaj-navy">
            સમાજ હોદ્દેદારો અને કારોબારી સમિતિ
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            રાજગોર બ્રાહ્મણ સમાજ ટ્રસ્ટ (કાર્યકાળ: ૨૦૨૪ - ૨૦૨૭)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {committee.map((mem) => (
            <div
              key={mem.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card text-center space-y-3 transition"
            >
              <img
                src={mem.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80'}
                alt={mem.name}
                className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-samaj-gold shadow-xs"
              />
              <div>
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                  {mem.name}
                </h3>
                <span className="inline-block mt-1 px-3 py-1 rounded-full bg-amber-50 text-samaj-gold-700 text-xs font-bold border border-amber-200">
                  {mem.designation_gu || mem.designation}
                </span>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {mem.city} ({mem.term_years})
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-xs">
                {mem.phone && (
                  <a
                    href={`tel:${mem.phone}`}
                    className="p-2 bg-slate-50 hover:bg-samaj-navy hover:text-white rounded-xl transition"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
                {mem.email && (
                  <a
                    href={`mailto:${mem.email}`}
                    className="p-2 bg-slate-50 hover:bg-samaj-navy hover:text-white rounded-xl transition"
                    title="Email"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
