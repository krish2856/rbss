'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export function PWAInstallPrompt() {
  const { t, lang } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowIosModal(true);
    }
  };

  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Top Install Bar */}
      <div className="bg-samaj-navy text-white px-4 py-2 shadow-xs border-b border-orange-500/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full overflow-hidden bg-white p-0.5 shrink-0 border border-white/30">
              <img
                src="/logo.png"
                alt="RBSS Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="truncate">
              <span className="font-bold text-orange-400">
                {lang === 'gu' ? 'RBSS એપ ઇન્સ્ટોલ કરો:' : 'Install RBSS App:'}
              </span>{' '}
              <span className="text-slate-300 text-xs hidden sm:inline">
                {lang === 'gu' ? 'ઝડપી ઍક્સેસ માટે હોમ સ્ક્રીન પર ઉમેરો' : 'Add to Home Screen for fast mobile access'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1 bg-samaj-gold hover:bg-orange-600 text-white text-xs font-bold rounded-lg shadow-brand transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('install_app')}</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded transition"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS & Browser Installation Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-samaj-navy">
                  <img src="/logo.png" alt="RBSS Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-samaj-navy">
                  Install RBSS App on Phone
                </h3>
              </div>
              <button
                onClick={() => setShowIosModal(false)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <p className="text-slate-600">
                To install this app on your <strong>iPhone (Safari)</strong> or <strong>Android (Chrome)</strong> without an app store:
              </p>

              <div className="bg-orange-50/70 border border-orange-200/60 rounded-xl p-3.5 space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-samaj-gold text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600 mx-1" /> in your Safari bottom bar (or menu dots in Chrome).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-samaj-gold text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1" />.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-samaj-gold text-white font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    Tap <strong>&quot;Add&quot;</strong> in top-right. The app will open directly in fullscreen!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIosModal(false)}
                className="w-full py-2.5 bg-samaj-navy text-white font-bold text-xs rounded-xl hover:bg-slate-900 transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
