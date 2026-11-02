import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { I18nProvider } from '../context/I18nContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { Footer } from '../components/Footer';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'Rajgor Brahmin Samaj – Complete Digital Community Platform & PWA',
  description: 'Official digital platform connecting Rajgor Brahmin Samaj members across Gujarat and worldwide. Member Directory, Matrimony, Events, Samaj Funds, and Cultural Heritage.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rajgor Samaj',
  },
  applicationName: 'Rajgor Samaj',
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="gu">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#fcfbf7] text-slate-900 antialiased selection:bg-amber-100 selection:text-amber-900">
        <AuthProvider>
          <I18nProvider>
            <PWAInstallPrompt />
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <BottomNav />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
