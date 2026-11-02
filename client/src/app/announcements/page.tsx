'use client';

import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Award, Heart, HeartHandshake, Sparkles, Filter } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { fetchApi } from '../../lib/api';

export default function AnnouncementsPage() {
  const { t } = useI18n();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const q = categoryFilter ? `?category=${categoryFilter}` : '';
      const res = await fetchApi(`/announcements${q}`);
      setAnnouncements(res.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const categories = [
    { id: '', label: 'બધા પરિપત્રો (All)' },
    { id: 'notice', label: 'સત્તાવાર સૂચના (Notice)' },
    { id: 'urgent', label: 'તાકીદનું (Urgent)' },
    { id: 'achievement', label: 'ગૌરવ / સિદ્ધિ (Achievement)' },
    { id: 'condolence', label: 'શ્રદ્ધાંજલિ / બેસણું (Condolence)' },
    { id: 'wedding', label: 'લગ્ન / શુભ પ્રસંગ (Wedding)' },
    { id: 'birthday', label: 'જન્મદિવસ (Birthday)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-samaj-navy-950 via-slate-900 to-samaj-navy-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Bell className="w-3.5 h-3.5" />
            <span>સત્તાવાર પરિપત્ર અને માહિતી મંચ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            સમાજ સમાચાર અને સૂચનાઓ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            રાજગોર બ્રાહ્મણ સમાજના તમામ મહત્વના પરિપત્રો, શ્રદ્ધાંજલિ સંદેશ અને યુવા ગૌરવ સિદ્ધિઓ
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-bold scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`px-4 py-2 rounded-xl shrink-0 transition ${
              categoryFilter === c.id
                ? 'bg-samaj-navy text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">{t('loading')}</div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          આ કેટેગરીમાં હાલ કોઈ સૂચના નથી.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-6 border shadow-subtle hover:shadow-card transition flex flex-col justify-between ${
                item.is_urgent
                  ? 'border-red-300 bg-red-50/20'
                  : item.is_pinned
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    {item.is_urgent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>તાકીદનું</span>
                      </span>
                    )}
                    {item.is_pinned && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        📌 પિન કરેલ
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {new Date(item.publish_date).toLocaleDateString('gu-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug mb-2">
                  {item.title_gu || item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>

                {item.image_url && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>પ્રકાશક: રાજગોર સમાજ મધ્યસ્થ કાર્યાલય</span>
                <span>જય પરશુરામ</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
