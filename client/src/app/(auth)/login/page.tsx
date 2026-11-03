'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import { fetchApi } from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useI18n();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setError('');
    setOtpNotice('');
    try {
      const res = await fetchApi('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      setOtpSent(true);
      if (res.demoOtp) {
        setOtpNotice(`OTP: ${res.demoOtp}. Please enter it below to sign in.`);
      } else {
        setOtpNotice('OTP sent successfully to your mobile number via SMS.');
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
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please enter the valid OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
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
            <h1 className="text-lg sm:text-xl font-black text-samaj-navy leading-tight">
              Shree Rajgor Brahman Seva Samiti
            </h1>
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mt-1">
              RBSS Ahmedabad • Member Sign In
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
              Mobile Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter Mobile Number"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-samaj-navy text-sm font-bold text-slate-900 tracking-wide"
            />
          </div>

          <div className="space-y-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider">
              Enter OTP
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter OTP"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-samaj-navy text-sm font-mono font-bold tracking-widest text-center"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition touch-manipulation active:scale-95 cursor-pointer"
              >
                {otpSent ? 'Resend OTP' : 'Get OTP'}
              </button>
            </div>
            {otpNotice && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl leading-relaxed">
                {otpNotice}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-samaj-navy hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
          >
            <span>{loading ? 'Verifying...' : 'Sign In with OTP'}</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </button>
        </form>
      </div>
    </div>
  );
}
