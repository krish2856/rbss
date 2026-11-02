'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { fetchApi } from '../../../lib/api';

const gotras = [
  'Kashyap (કશ્યપ)',
  'Gautam (ગૌતમ)',
  'Bharadwaj (ભારદ્વાજ)',
  'Vashistha (વશિષ્ઠ)',
  'Parashar (પારાશર)',
  'Shandilya (શાંડિલ્ય)',
  'Kaushik (કૌશિક)',
  'Garg (ગર્ગ)',
  'Vatsa (વત્સ)',
  'Haritas (હરિતાસ)',
];

const kuldevis = [
  'Maa Chamunda (માં ચામુંડા - ચોટીલા)',
  'Maa Ashapura (માં આશાપુરા - માતાનો મઢ)',
  'Maa Khodiyar (માં ખોડિયાર - રાજપરા)',
  'Maa Meldi (માં મેલડી)',
  'Maa Bhavani (માં ભવાની)',
  'Maa Harsiddhi (માં હરસિદ્ધિ)',
  'Maa Brahmani (માં બ્રહ્માણી)',
  'Maa Umiya (માં ઉમિયા)',
  'Other (અન્ય)',
];

const surnames = [
  'Rajgor',
  'Vyas',
  'Pandya',
  'Bhatt',
  'Dave',
  'Joshi',
  'Shukla',
  'Thaker',
  'Raval',
  'Mehta',
  'Trivedi',
  'Other',
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useI18n();

  const [form, setForm] = useState({
    phone: '',
    password: '',
    full_name: '',
    father_name: '',
    surname: 'Rajgor',
    gotra: 'Kashyap',
    kuldevi: 'Maa Chamunda',
    gender: 'male',
    dob: '1996-01-01',
    marital_status: 'single',
    native_village: '',
    native_taluka: '',
    current_city: 'Ahmedabad',
    education: '',
    occupation: '',
    company_or_business: '',
    blood_group: 'B+',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone || !form.full_name || !form.native_village || !form.current_city) {
      setError('કૃપા કરીને બધા જરૂરી ખાના (નામ, મૂળ ગામ, શહેર અને ફોન) ભરો.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(form),
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        setSuccessNotice(true);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (successNotice) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            નોંધણી સફળતાપૂર્વક સબમિટ થઈ!
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            તમારું એકાઉન્ટ તૈયાર છે. સુરક્ષા અને વિશ્વસનીયતા માટે સમાજ વહીવટી સમિતિ (Admin) દ્વારા ચકાસણી પૂર્ણ થયા પછી ડિરેક્ટરી અને વૈવાહિક સુવિધાઓ સંપૂર્ણ અનલોક થશે.
          </p>
          <div className="pt-2">
            <button
              onClick={() => router.push('/members')}
              className="w-full py-3 bg-samaj-navy text-white font-bold rounded-xl hover:bg-slate-800 transition"
            >
              ડિરેક્ટરી જુઓ (Continue to App)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-card space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-samaj-gold-700 flex items-center justify-center text-xl font-bold border border-amber-200">
            🕉️
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-samaj-navy">
            {t('register')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            રાજગોર બ્રાહ્મણ સમાજ ડિજિટલ પરિષદમાં સભ્યપદ માટે ફોર્મ
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-samaj-navy flex items-center gap-2 border-l-4 border-samaj-gold pl-2">
              ૧. વ્યક્તિગત વિગત (Personal Details)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  પૂરું નામ (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="દા.ત. જીગર ભરતભાઈ રાજગોર"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  પિતા/પતિનું નામ (Father / Husband Name)
                </label>
                <input
                  type="text"
                  name="father_name"
                  value={form.father_name}
                  onChange={handleChange}
                  placeholder="ભરતભાઈ કાંતિલાલ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  અટક (Surname) *
                </label>
                <select
                  name="surname"
                  value={form.surname}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy bg-white"
                >
                  {surnames.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  જાતિ (Gender) *
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy bg-white"
                >
                  <option value="male">પુરુષ (Male)</option>
                  <option value="female">સ્ત્રી (Female)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Heritage (Gotra & Kuldevi) */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-samaj-navy flex items-center gap-2 border-l-4 border-samaj-gold pl-2">
              ૨. ગોત્ર અને કુળદેવી (Heritage & Kuldevi)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ગોત્ર (Gotra) *
                </label>
                <select
                  name="gotra"
                  value={form.gotra}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy bg-white"
                >
                  {gotras.map((g) => (
                    <option key={g} value={g.split(' ')[0]}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  કુળદેવી (Kuldevi) *
                </label>
                <select
                  name="kuldevi"
                  value={form.kuldevi}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy bg-white"
                >
                  {kuldevis.map((k) => (
                    <option key={k} value={k.split(' ')[1] || k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Native Village & Residence */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-samaj-navy flex items-center gap-2 border-l-4 border-samaj-gold pl-2">
              ૩. મૂળ વતન અને વર્તમાન નિવાસ (Origins & Location)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  મૂળ ગામ (Native Village) *
                </label>
                <input
                  type="text"
                  required
                  name="native_village"
                  value={form.native_village}
                  onChange={handleChange}
                  placeholder="દા.ત. કોટડા / માધાપર"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  તાલુકો (Native Taluka)
                </label>
                <input
                  type="text"
                  name="native_taluka"
                  value={form.native_taluka}
                  onChange={handleChange}
                  placeholder="ભુજ / અંજાર"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  હાલનું શહેર (Current City) *
                </label>
                <input
                  type="text"
                  required
                  name="current_city"
                  value={form.current_city}
                  onChange={handleChange}
                  placeholder="અમદાવાદ / રાજકોટ"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Education & Occupation */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-samaj-navy flex items-center gap-2 border-l-4 border-samaj-gold pl-2">
              ૪. અભ્યાસ, વ્યવસાય અને બ્લડ ગ્રુપ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  અભ્યાસ (Education)
                </label>
                <input
                  type="text"
                  name="education"
                  value={form.education}
                  onChange={handleChange}
                  placeholder="B.E., M.Com, CA"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  વ્યવસાય (Occupation)
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={form.occupation}
                  onChange={handleChange}
                  placeholder="Software Engineer / Business"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  બ્લડ ગ્રુપ (Blood Group)
                </label>
                <select
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy bg-white"
                >
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Credentials */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-samaj-navy flex items-center gap-2 border-l-4 border-samaj-gold pl-2">
              ૫. લૉગિન વિગત (Mobile & Password)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  મોબાઇલ નંબર (Mobile Number) *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  name="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="9898000000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  પાસવર્ડ (Create Password) *
                </label>
                <input
                  type="password"
                  required
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-samaj-navy"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-samaj-navy hover:bg-slate-800 text-white font-bold text-base rounded-2xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5 text-samaj-gold" />
              <span>{loading ? t('loading') : 'સભ્યપદ નોંધણી સબમિટ કરો'}</span>
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            પહેલેથી રજીસ્ટર્ડ છો?{' '}
            <Link href="/login" className="font-bold text-samaj-gold-700 hover:underline">
              {t('login')} (Login to Account)
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
