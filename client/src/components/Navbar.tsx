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
  const { lang, toggleLang } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/members', label: 'Member Directory', icon: Users },
    { href: '/matrimony', label: 'Matrimony', icon: Heart },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/announcements', label: 'Announcements', icon: Bell },
    { href: '/donations', label: 'Samaj Funds', icon: HandCoins },
    { href: '/blood-donors', label: 'Blood Donors', icon: Droplet },
    { href: '/history', label: 'Heritage & Committee', icon: Landmark },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Official RBSS Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group min-w-0">
            <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full overflow-hidden shrink-0 border-2 border-samaj-navy shadow-sm bg-white p-0.5">
              <img
                src="/logo.png"
                alt="Shree Rajgor Brahman Seva Samiti Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-base lg:text-lg text-samaj-navy tracking-tight block leading-tight truncate max-w-[200px] xs:max-w-[240px] sm:max-w-none">
                Shree Rajgor Brahman Seva Samiti
              </span>
              <span className="text-[9px] sm:text-xs font-bold text-orange-600 tracking-wider uppercase block truncate">
                RBSS Ahmedabad (Kathigor)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-slate-700">
              <Link
                href="/members"
                className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                  pathname === '/members' ? 'text-orange-600 font-bold bg-orange-50' : ''
                }`}
              >
                Member Directory
              </Link>
              <Link
                href="/matrimony"
                className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                  pathname.startsWith('/matrimony') ? 'text-orange-600 font-bold bg-orange-50' : ''
                }`}
              >
                Matrimony
              </Link>
              <Link
                href="/events"
                className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                  pathname === '/events' ? 'text-orange-600 font-bold bg-orange-50' : ''
                }`}
              >
                Events
              </Link>
              <Link
                href="/announcements"
                className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                  pathname === '/announcements' ? 'text-orange-600 font-bold bg-orange-50' : ''
                }`}
              >
                Announcements
              </Link>
              <Link
                href="/donations"
                className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                  pathname === '/donations' ? 'text-orange-600 font-bold bg-orange-50' : ''
                }`}
              >
                Samaj Funds
              </Link>
              <Link
                href="/blood-donors"
                className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                  pathname === '/blood-donors' ? 'text-orange-600 font-bold bg-orange-50' : ''
                }`}
              >
                Blood Donors
              </Link>
              <Link
                href="/history"
                className={`px-3 py-1.5 rounded-lg transition hover:text-samaj-navy hover:bg-slate-100 ${
                  pathname === '/history' ? 'text-orange-600 font-bold bg-orange-50' : ''
                }`}
              >
                Heritage
              </Link>
            </nav>
          )}

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Clean Language Switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition touch-manipulation active:scale-95"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-[11px] sm:text-xs">{lang === 'en' ? 'ગુજરાતી' : 'English'}</span>
            </button>

            {/* Admin Portal Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-samaj-navy text-orange-400 text-xs font-bold rounded-lg border border-orange-500/30 hover:bg-slate-900 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account / Profile */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 transition touch-manipulation"
                >
                  <div className="w-8 h-8 rounded-full bg-samaj-navy text-white font-bold flex items-center justify-center text-xs shadow-xs">
                    {user.profile?.full_name ? user.profile.full_name[0] : 'U'}
                  </div>
                  <span className="hidden xl:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
                    {user.profile?.full_name || user.phone}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition touch-manipulation active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Mobile hamburger menu (only when logged in) */}
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-700 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition touch-manipulation active:scale-95"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Only when user clicks menu) */}
      {user && mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1 shadow-xl animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition touch-manipulation active:scale-98 ${
                pathname === item.href
                  ? 'bg-orange-50 text-orange-600 font-bold'
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold bg-samaj-navy text-orange-400 mt-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
