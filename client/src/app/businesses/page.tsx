'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, Phone, Globe, Plus, Search, Mail, Instagram, X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

export default function BusinessesPage() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Register modal
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    category: 'Finance & Legal',
    description: '',
    city: 'Ahmedabad',
    phone: user?.phone || '',
    email: '',
    website: '',
    instagram: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.append('search', search);
      if (categoryFilter) q.append('category', categoryFilter);

      const res = await fetchApi(`/businesses?${q.toString()}`);
      setBusinesses(res.businesses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('કૃપા કરીને પહેલા લૉગિન કરો.');
      return;
    }

    try {
      await fetchApi('/businesses', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      alert('વેપાર ડિરેક્ટરીમાં સફળતાપૂર્વક નોંધણી થઈ.');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit business.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-samaj-navy-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-card">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>જ્ઞાતિ વ્યાપાર-ઉદ્યોગ નેટવર્ક</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            રાજગોર વેપાર ડિરેક્ટરી
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            જ્ઞાતિજનો દ્વારા સંચાલિત વ્યવસાયો અને સેવાઓનું ડિજિટલ નેટવર્ક – એકબીજાના વ્યાપારને પ્રોત્સાહન
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="વ્યવસાયનું નામ અથવા સેવા શોધો..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-xs sm:text-sm"
          />
        </form>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-samaj-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>મારો વ્યવસાય ઉમેરો</span>
        </button>
      </div>

      {/* Businesses Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">{t('loading')}</div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          કોઈ વેપાર લિસ્ટિંગ મળ્યું નથી.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-subtle hover:shadow-card transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={biz.logo_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&fit=crop&q=80'}
                    alt={biz.business_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-samaj-gold-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      {biz.category}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug mt-1">
                      {biz.business_name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {biz.description}
                </p>

                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{biz.address || biz.city}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <a
                  href={`tel:${biz.phone}`}
                  className="flex items-center gap-1.5 text-samaj-navy font-bold hover:text-samaj-gold-700 transition"
                >
                  <Phone className="w-3.5 h-3.5 text-samaj-gold" />
                  <span>{biz.phone}</span>
                </a>

                {biz.website && (
                  <a
                    href={biz.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-samaj-navy hover:bg-slate-100 rounded-lg transition"
                    title="Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Business Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-bold text-base text-samaj-navy">નવો વ્યવસાય ઉમેરો</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBusiness} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">પેઢી / બિઝનેસનું નામ *</label>
                <input
                  type="text"
                  required
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">કેટેગરી *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="Finance & Legal">Finance & Legal (CA, વકીલ, ટેક્સ)</option>
                  <option value="Real Estate & Construction">Real Estate & બાંધકામ</option>
                  <option value="Design & Architecture">Design & આર્કિટેક્ચર</option>
                  <option value="IT & Software">IT & સોફ્ટવેર સર્વિસ</option>
                  <option value="Trading & Retail">વેપાર & રિટેલ (Trading)</option>
                  <option value="Healthcare">મેડિકલ & હેલ્થકેર</option>
                  <option value="Other">અન્ય સેવાઓ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">વ્યવસાય વર્ણન *</label>
                <textarea
                  rows={2}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">શહેર *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ફોન નંબર *</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">વેબસાઇટ લિંક</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition"
              >
                બિઝનેસ સબમિટ કરો
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
