'use client';

import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, Award, BookOpen, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { fetchApi } from '../../lib/api';

export default function CareersPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const q = typeFilter ? `?type=${typeFilter}` : '';
      const res = await fetchApi(`/careers${q}`);
      setItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [typeFilter]);

  const tabs = [
    { id: '', label: 'બધી તકો (All Opportunities)' },
    { id: 'scholarship', label: 'સરસ્વતી સન્માન / સ્કોલરશીપ' },
    { id: 'job', label: 'નોકરી / રોજગાર (Jobs)' },
    { id: 'guidance', label: 'GPSC / UPSC માર્ગદર્શન' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-samaj-navy-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>વિદ્યા વિકાસ અને યુવા ઉત્કર્ષ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            શિક્ષણ અને કારકિર્દી માર્ગદર્શન
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            તેજસ્વી વિદ્યાર્થીઓ માટે ઉચ્ચ શિક્ષણ સ્કોલરશીપ, નોકરીની તકો અને સનદી સેવા (Civil Services) સ્પર્ધાત્મક પરીક્ષા ગાઇડન્સ
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-4 py-2 rounded-xl shrink-0 transition ${
              typeFilter === tab.id
                ? 'bg-samaj-navy text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">{t('loading')}</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          હાલ કોઈ તક ઉપલબ્ધ નથી.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                    {item.type}
                  </span>
                  {item.deadline && (
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>અંતિમ તારીખ: {item.deadline}</span>
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <div className="text-xs font-bold text-samaj-gold-700">
                  સંચાલક: {item.organization}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {item.eligibility && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <strong className="text-slate-900 block mb-0.5">પાત્રતા (Eligibility):</strong>
                    {item.eligibility}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  સંપર્ક: {item.contact_info}
                </span>

                {item.apply_link && (
                  <a
                    href={item.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-samaj-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 transition"
                  >
                    <span>અરજી કરો</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
