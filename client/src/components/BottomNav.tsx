'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Heart, User } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { user } = useAuth();

  const tabs = [
    { href: '/', label: t('nav_home'), icon: Home },
    { href: '/members', label: t('nav_directory'), icon: Users },
    { href: '/events', label: t('nav_events'), icon: Calendar },
    { href: '/matrimony', label: t('nav_matrimony'), icon: Heart },
    { href: user ? '/profile' : '/login', label: t('nav_profile'), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 md:hidden pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
                isActive
                  ? 'text-samaj-gold-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-full transition-transform duration-150 ${
                  isActive ? 'scale-110 bg-amber-50 text-samaj-gold-600' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium leading-none tracking-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-samaj-gold rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
