import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { I18nProvider } from '../context/I18nContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'Shree Rajgor Brahman Seva Samiti (RBSS) – Digital Community App',
  description: 'Official mobile application connecting Rajgor Brahmin (Kathigor) Samaj members worldwide. Member Directory, Matrimony, Events, Samaj Funds, and Cultural Heritage.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RBSS Samaj',
  },
  applicationName: 'RBSS Samaj',
  formatDetection: {
    telephone: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0b254e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen min-h-[100dvh] flex flex-col bg-[#fcfbf7] text-slate-900 antialiased">
        <AuthProvider>
          <I18nProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-full pb-24 md:pb-8">
              {children}
            </main>
            <Footer />
            <BottomNav />
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
