'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, Heart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // On small mobile screens, do not show bottom navigation bar if user is not authenticated yet
  if (!user) {
    return null;
  }

  const tabs = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/members', label: 'Members', icon: Users },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/matrimony', label: 'Matrimony', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 transition-all relative py-1 touch-manipulation active:scale-95 ${
                isActive
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-orange-50 text-orange-600 scale-110 shadow-xs' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 bg-orange-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
