import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '../context/I18nContext';
import { AuthProvider } from '../context/AuthContext';
import { Header } from '../components/Header';

export const metadata: Metadata = {
  title: 'APAAR-Verify | AICTE Student Data Management & Verification',
  description:
    'One Nation, One Student ID verification platform for AICTE technical institutions under NEP 2020. SIH 2026 Idea ID 225558.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100">
        <I18nProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
            <footer className="border-t border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-6 text-center text-xs text-slate-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p>
                  © 2026 APAAR-Verify · Smart India Hackathon (Idea 225558) · NEP 2020 &amp; DPDP Act 2023 Aligned
                </p>
                <div className="flex items-center gap-4 text-slate-400">
                  <span>Simulated Environment</span>
                  <span>•</span>
                  <span>Zero Real PII</span>
                  <span>•</span>
                  <span>Luhn Check Demo</span>
                </div>
              </div>
            </footer>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
