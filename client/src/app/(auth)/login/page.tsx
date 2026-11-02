'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { fetchApi } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t, lang } = useI18n();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setOtpSent(true);
      if (res.demoOtp) {
        setOtp(res.demoOtp); // Auto-fill 123456
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('10-digit mobile number is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, otp: otp || '123456' }),
      });

      if (res.token && res.user) {
        login(res.token, res.user);
        router.push('/members');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoPhone: string) => {
    setPhone(demoPhone);
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: demoPhone, otp: '123456' }),
      });
      if (res.token && res.user) {
        login(res.token, res.user);
        router.push('/members');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card space-y-6">
        {/* Official RBSS Logo */}
        <div className="text-center space-y-3">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-3 border-samaj-navy shadow-md bg-white p-1">
            <img
              src="/logo.png"
              alt="Shree Rajgor Brahman Seva Samiti Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-black text-samaj-navy">
              {lang === 'gu'
                ? 'શ્રી રાજગોર બ્રાહ્મણ (કાઠીગોર) સેવા સમિતિ'
                : 'Shree Rajgor Brahman (Kathigor) Seva Samiti'}
            </h1>
            <p className="text-xs font-bold text-samaj-gold uppercase tracking-wider mt-1">
              RBSS Ahmedabad – Mobile OTP Login
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* OTP Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {lang === 'gu' ? 'મોબાઇલ નંબર' : 'Mobile Number'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-sm font-semibold">
                +91
              </span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9898000001"
                className="w-full pl-13 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-samaj-navy text-sm font-bold text-slate-900 tracking-wide"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">
              {lang === 'gu' ? 'OTP કોડ' : 'Enter 6-Digit OTP'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-samaj-navy text-sm font-mono font-bold tracking-widest text-center"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
              >
                {otpSent ? (lang === 'gu' ? 'ફરી મોકલો' : 'Resend OTP') : (lang === 'gu' ? 'OTP મેળવો' : 'Get OTP')}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Demo OTP: <strong className="text-slate-700 font-mono">123456</strong> (Instant Login)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-samaj-navy hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2"
          >
            <span>{loading ? t('loading') : (lang === 'gu' ? 'OTP દ્વારા લૉગિન કરો' : 'Login with OTP')}</span>
            <ArrowRight className="w-4 h-4 text-samaj-gold" />
          </button>
        </form>

        {/* Demo Switcher */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-400 uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Instant Demo Accounts:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('9898000001')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 text-left transition"
            >
              <div className="font-bold text-samaj-navy">Super Admin</div>
              <div className="text-[10px] text-slate-500">Dharmeshbhai Rajgor</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('9898000010')}
              className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 text-left transition"
            >
              <div className="font-bold text-slate-800">Verified Member</div>
              <div className="text-[10px] text-slate-500">Jigar Rajgor</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
