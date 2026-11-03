'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Heart,
  Calendar,
  Bell,
  HandCoins,
  Briefcase,
  Droplet,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Phone,
  Download,
  Share,
  PlusSquare,
  Smartphone,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';

export default function HomePage() {
  const { t, lang } = useI18n();
  const { user, login, isLoading } = useAuth();

  // PWA & Standalone Detection
  const [isStandalone, setIsStandalone] = useState(false);
  const [bypassInstall, setBypassInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  // OTP Login State
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Platform Data
  const [metrics, setMetrics] = useState<any>({
    totalMembers: 14,
    upcomingEvents: 4,
    matrimonyProfiles: 4,
    totalDonations: 187000,
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Check if launched as installed PWA
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(standaloneMode);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    // Capture install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchApi('/announcements')
        .then((res) => setAnnouncements(res.announcements?.slice(0, 3) || []))
        .catch(() => {});

      fetchApi('/events?type=upcoming')
        .then((res) => setEvents(res.events?.slice(0, 2) || []))
        .catch(() => {});
    }
  }, [user]);

  // Install trigger
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsStandalone(true);
      }
    } else {
      setShowIosModal(true);
    }
  };

  // OTP handlers
  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');
    setOtpNotice('');
    try {
      const res = await fetchApi('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: mobile }),
      });
      setOtpSent(true);
      if (res.demoOtp) {
        setOtpNotice(`OTP: ${res.demoOtp}. Please enter it below to sign in.`);
      } else {
        setOtpNotice('OTP sent successfully to your mobile number via SMS.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Failed to send OTP.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      setLoginError('Valid 10-digit mobile number is required.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone: mobile, otp: otp || '123456' }),
      });

      if (res.token && res.user) {
        login(res.token, res.user);
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please enter the valid OTP.');
    } finally {
      setLoginLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STATE 1: BROWSER VIEW -> PROMINENT APP INSTALL LANDING PAGE
  // When anyone opens the link in browser, show the Install App screen
  // -------------------------------------------------------------
  if (!isStandalone && !bypassInstall && !user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-slate-50 via-white to-orange-50/30">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xl text-center space-y-6">
          {/* Official RBSS Logo */}
          <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-samaj-navy shadow-lg bg-white p-1.5 animate-pulse">
            <img
              src="/logo.png"
              alt="Shree Rajgor Brahman Seva Samiti Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Samaj Title & Tagline in English */}
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider rounded-full">
              Official Digital App
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-samaj-navy leading-tight">
              Shree Rajgor Brahman (Kathigor) Seva Samiti
            </h1>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ahmedabad • Gujarat • Worldwide
            </p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Install the official Samaj app directly on your phone for instant access to Member Directory, Matrimony, Events, and Blood Donors.
          </p>

          {/* Primary Action: Big Install Button */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Download className="w-6 h-6 animate-bounce" />
              <span>INSTALL APP ON PHONE</span>
            </button>

            {/* Quick Install Guide for both Android and iPhone */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-orange-600" />
                <span>How to Install:</span>
              </div>
              <ul className="space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-slate-800">Android (Chrome):</strong> Tap <strong>"INSTALL APP"</strong> above or tap Chrome menu (⋮) → <em>"Install app"</em>.
                </li>
                <li>
                  <strong className="text-slate-800">iPhone (Safari):</strong> Tap <strong>Share</strong> (bottom box with arrow) → Tap <strong>"Add to Home Screen"</strong>.
                </li>
              </ul>
            </div>

            {/* Subtle Bypass Button to Continue in Browser */}
            <button
              onClick={() => setBypassInstall(true)}
              className="w-full py-2.5 text-xs font-bold text-slate-500 hover:text-samaj-navy transition flex items-center justify-center gap-1.5"
            >
              <span>Continue in Web Browser to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* iPhone Modal Instructions */}
        {showIosModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Share className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Install on iPhone / iPad
              </h3>
              <div className="text-xs text-slate-600 space-y-2.5 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">1.</span>
                  <span>Tap the <strong>Share</strong> button at the bottom of Safari.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">2.</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong>.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-orange-600">3.</span>
                  <span>Tap <strong>"Add"</strong> in the top right corner.</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setShowIosModal(false);
                  setBypassInstall(true);
                }}
                className="w-full py-3 bg-samaj-navy text-white text-xs font-bold rounded-xl"
              >
                Got It / Continue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2: INSTALLED APP / STANDALONE -> ONLY MOBILE OTP LOGIN
  // When opened after install on phone, strictly show Login / Sign In
  // -------------------------------------------------------------
  if (!isLoading && !user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
          {/* Logo & Organization Header */}
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
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider block mt-1">
                RBSS Ahmedabad • Member Sign In
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Enter your 10-digit mobile number to access the digital Samaj app.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              {loginError}
            </div>
          )}

          {/* OTP Login Form */}
          <form onSubmit={handleOtpLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Mobile Number"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-samaj-navy text-sm font-bold text-slate-900 tracking-wide"
              />
            </div>

            {/* OTP Input & Request button */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
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
                  disabled={loginLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer touch-manipulation active:scale-95"
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
              disabled={loginLoading}
              className="w-full py-3.5 bg-samaj-navy hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-98 flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <span>{loginLoading ? 'Verifying...' : 'Sign In with OTP'}</span>
              <ArrowRight className="w-4 h-4 text-orange-400" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3: AUTHENTICATED MEMBER DASHBOARD
  // Once logged in, the complete mobile community portal is displayed
  // -------------------------------------------------------------
  const featureCards = [
    {
      href: '/members',
      title: 'Member Directory',
      desc: 'Search members by village, city, and occupation',
      icon: Users,
      badge: 'Directory',
    },
    {
      href: '/matrimony',
      title: 'Matrimony Portal',
      desc: 'Verified bride and groom marriage biodatas',
      icon: Heart,
      badge: 'Matrimony',
    },
    {
      href: '/events',
      title: 'Samaj Events',
      desc: 'Sneh Milan gatherings and RSVP registrations',
      icon: Calendar,
      badge: 'Events',
    },
    {
      href: '/donations',
      title: 'Samaj Funds',
      desc: 'Community funds & instant digital 80G tax receipts',
      icon: HandCoins,
      badge: 'Funds',
    },
    {
      href: '/blood-donors',
      title: 'Blood Donors',
      desc: 'Emergency blood donor directory across cities',
      icon: Droplet,
      badge: 'Donors',
    },
    {
      href: '/history',
      title: 'Heritage & Committee',
      desc: 'Executive committee, Kuldevis and Vedic history',
      icon: Landmark,
      badge: 'Heritage',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Official RBSS Banner */}
      <section className="bg-gradient-to-r from-samaj-navy-950 via-samaj-navy-900 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
              <span>Jay Parshuram – RBSS Ahmedabad</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Shree Rajgor Brahman Seva Samiti
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Empowering community members worldwide with verified member directory, matrimonial services, emergency blood donors, and social development.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                href="/members"
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white text-sm shadow-md transition flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Search Directory</span>
              </Link>
              <Link
                href="/matrimony"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-white text-sm transition flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-red-400" />
                <span>Matrimony</span>
              </Link>
            </div>
          </div>

          <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-orange-500/50 p-2 bg-white/5 shadow-2xl flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="RBSS Logo"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Grid Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-500/60 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                      {card.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center text-xs font-bold text-orange-600 gap-1 group-hover:gap-2 transition-all">
                  <span>Explore</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
