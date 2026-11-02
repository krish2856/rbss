'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Heart,
  Calendar,
  Bell,
  HandCoins,
  Briefcase,
  Droplet,
  Landmark,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { lang, toggleLang, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/members', label: t('nav_directory'), icon: Users },
    { href: '/matrimony', label: t('nav_matrimony'), icon: Heart },
    { href: '/events', label: t('nav_events'), icon: Calendar },
    { href: '/announcements', label: t('nav_announcements'), icon: Bell },
    { href: '/donations', label: t('nav_donations'), icon: HandCoins },
    { href: '/blood-donors', label: t('nav_blood'), icon: Droplet },
    { href: '/history', label: t('nav_history'), icon: Landmark },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Official RBSS Logo & Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border-2 border-samaj-navy shadow-sm bg-white p-0.5">
              <img
                src="/logo.png"
                alt="Shree Rajgor Brahman Seva Samiti Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base lg:text-lg text-samaj-navy tracking-tight block leading-tight">
                {lang === 'gu' ? 'શ્રી રાજગોર બ્રાહ્મણ સેવા સમિતિ' : 'Shree Rajgor Brahman Seva Samiti'}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-samaj-gold tracking-wider uppercase block">
                RBSS Ahmedabad (Kathigor)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-slate-700">
            <Link
              href="/members"
              className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                pathname === '/members' ? 'text-samaj-gold font-bold bg-orange-50' : ''
              }`}
            >
              {t('nav_directory')}
            </Link>
            <Link
              href="/matrimony"
              className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                pathname.startsWith('/matrimony') ? 'text-samaj-gold font-bold bg-orange-50' : ''
              }`}
            >
              {t('nav_matrimony')}
            </Link>
            <Link
              href="/events"
              className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                pathname === '/events' ? 'text-samaj-gold font-bold bg-orange-50' : ''
              }`}
            >
              {t('nav_events')}
            </Link>
            <Link
              href="/announcements"
              className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                pathname === '/announcements' ? 'text-samaj-gold font-bold bg-orange-50' : ''
              }`}
            >
              {t('nav_announcements')}
            </Link>
            <Link
              href="/donations"
              className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                pathname === '/donations' ? 'text-samaj-gold font-bold bg-orange-50' : ''
              }`}
            >
              {t('nav_donations')}
            </Link>
            <Link
              href="/blood-donors"
              className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                pathname === '/blood-donors' ? 'text-samaj-gold font-bold bg-orange-50' : ''
              }`}
            >
              {t('nav_blood')}
            </Link>
            <Link
              href="/history"
              className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                pathname === '/history' ? 'text-samaj-gold font-bold bg-orange-50' : ''
              }`}
            >
              {t('nav_history')}
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Clean 2-Way Language Switcher: English | ગુજરાતી */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-samaj-gold" />
              <span>{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>

            {/* Admin Portal Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-samaj-navy text-samaj-gold text-xs font-bold rounded-lg border border-samaj-gold/40 hover:bg-slate-900 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t('nav_admin')}</span>
              </Link>
            )}

            {/* User Account / Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-samaj-navy text-white font-bold flex items-center justify-center text-xs">
                    {user.profile?.full_name ? user.profile.full_name[0] : 'U'}
                  </div>
                  <span className="hidden xl:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {user.profile?.full_name || user.phone}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold bg-samaj-navy hover:bg-slate-900 text-white rounded-lg shadow-xs transition"
              >
                {t('login')}
              </Link>
            )}

            {/* Mobile hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                pathname === item.href
                  ? 'bg-orange-50 text-samaj-gold font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.icon && <item.icon className="w-4 h-4 text-slate-500" />}
              <span>{item.label}</span>
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-samaj-navy text-samaj-gold mt-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('nav_admin')}</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
