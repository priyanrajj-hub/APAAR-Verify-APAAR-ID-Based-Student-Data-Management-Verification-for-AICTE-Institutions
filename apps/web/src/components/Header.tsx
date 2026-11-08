'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { LOCALES, SupportedLocale } from '@apaar/i18n';
import { UserRole } from '@apaar/shared-types';
import { ROLE_LABELS } from '@apaar/ui';
import {
  Globe,
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  Info,
  Check,
  FlaskConical,
  MessageSquare,
  KeyRound,
  QrCode,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onOpenLab?: (tool: 'assistant' | 'consent' | 'verifier') => void;
}

export function Header({ onOpenLab }: HeaderProps) {
  const { locale, setLocale, localeMeta, t } = useI18n();
  const { user, role, switchRole } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Tricolour Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 dark:from-orange-600 dark:via-slate-800 dark:to-emerald-700" />

      {/* Institutional Honest Disclaimer Bar */}
      <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            Smart India Hackathon 2026 · Idea ID 225558
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">
            Prototype: not affiliated with MoE/AICTE. All data synthetic.
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>Demo Mode Active</span>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                APAAR-Verify
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                SIH Prototype
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Selector (12 Indian languages) */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold">{localeMeta.nativeName}</span>
              <span className="text-slate-400 text-[10px]">({localeMeta.code.toUpperCase()})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-56 rounded-md bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 py-1.5 z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Supported Languages (12)
                </div>
                {(Object.keys(LOCALES) as SupportedLocale[]).map((loc) => {
                  const item = LOCALES[loc];
                  const isSelected = locale === loc;
                  return (
                    <button
                      key={loc}
                      onClick={() => {
                        setLocale(loc);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition ${
                        isSelected
                          ? 'font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700/50'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{item.nativeName}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.name} {item.dir === 'rtl' ? '(RTL)' : ''}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Labs & Demo Switcher Menu (Single Unified Demo Dropdown) */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition"
              aria-label="Open Labs and Demo Tools"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Labs &amp; Persona</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-1 w-72 rounded-md bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-slate-800 dark:text-slate-100"
                onMouseLeave={() => setDemoMenuOpen(false)}
              >
                {/* Active Persona Switcher */}
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Active Demo Persona
                </div>
                {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
                  const profile = DEMO_USERS[r];
                  const isSelected = role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setDemoMenuOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition ${
                        isSelected
                          ? 'font-bold text-emerald-700 dark:text-emerald-400 bg-slate-50 dark:bg-slate-700/50'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{ROLE_LABELS[r].label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {profile.name} · {profile.institutionName || 'Central'}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}

                <div className="my-2 border-t border-slate-200 dark:border-slate-700" />

                {/* Secondary Labs Modules */}
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Labs Modules
                </div>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('apaar_open_lab', { detail: 'assistant' }));
                    }
                    if (onOpenLab) onOpenLab('assistant');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                  <span>Multilingual Policy Assistant (RAG)</span>
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('apaar_open_lab', { detail: 'consent' }));
                    }
                    if (onOpenLab) onOpenLab('consent');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>DPDP Student Consent Ledger</span>
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('apaar_open_lab', { detail: 'verifier' }));
                    }
                    if (onOpenLab) onOpenLab('verifier');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <QrCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Public Verifier Portal &amp; QR</span>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
