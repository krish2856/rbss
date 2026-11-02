'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export function Footer() {
  const { t, lang } = useI18n();

  return (
    <footer className="bg-samaj-navy-950 text-slate-300 pt-12 pb-24 md:pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80 text-xs sm:text-sm">
          {/* Col 1: Identity & Logo */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/20 bg-white p-0.5 shadow-sm">
                <img
                  src="/logo.png"
                  alt="Shree Rajgor Brahman Seva Samiti Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
                  {lang === 'gu'
                    ? 'શ્રી રાજગોર બ્રાહ્મણ સેવા સમિતિ'
                    : 'Shree Rajgor Brahman Seva Samiti'}
                </h3>
                <p className="text-[11px] text-samaj-gold font-bold tracking-wider uppercase">
                  RBSS Ahmedabad (Kathigor)
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {lang === 'gu'
                ? 'સમસ્ત જ્ઞાતિજનોને એકતાના તાંતણે બાંધતું સત્તાવાર પ્લેટફોર્મ – સંસ્કૃતિ, શિક્ષણ અને સામાજિક કલ્યાણ.'
                : 'Connecting community members with verified member directory, matrimonial parichay, and emergency services.'}
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'gu' ? 'ઝડપી લિંક્સ' : 'Quick Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/members" className="hover:text-samaj-gold transition">
                  {t('nav_directory')} (Member Directory)
                </Link>
              </li>
              <li>
                <Link href="/matrimony" className="hover:text-samaj-gold transition">
                  {t('nav_matrimony')} (Marriage Biodata)
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-samaj-gold transition">
                  {t('nav_events')} (Events & Sneh Milan)
                </Link>
              </li>
              <li>
                <Link href="/donations" className="hover:text-samaj-gold transition">
                  {t('nav_donations')} (80G Tax Receipts)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Services */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'gu' ? 'સમાજ સેવાઓ' : 'Community Support'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/blood-donors" className="hover:text-samaj-gold transition">
                  {t('nav_blood')} (Emergency Blood Donors)
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-samaj-gold transition">
                  {lang === 'gu' ? 'કાર્યકારી સમિતિ' : 'Executive Committee'}
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-samaj-gold transition">
                  {t('nav_announcements')} (Official Circulars)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'gu' ? 'મુખ્ય કાર્યાલય' : 'Central Office'}
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-samaj-gold shrink-0 mt-0.5" />
                <span>Shree Rajgor Brahman Seva Samiti Bhavan, SG Highway, Ahmedabad, Gujarat - 382481</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-samaj-gold shrink-0" />
                <span>+91 98980 00001 / 98980 00002</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Shree Rajgor Brahman (Kathigor) Seva Samiti Ahmedabad. All rights reserved.
          </p>
          <div className="flex items-center gap-3 text-slate-400 font-semibold">
            <span>PWA Enabled</span>
            <span>•</span>
            <span className="text-samaj-gold">Jay Parshuram</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
