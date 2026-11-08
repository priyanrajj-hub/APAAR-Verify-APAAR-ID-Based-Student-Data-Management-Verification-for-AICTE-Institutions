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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      {/* Tricolour National Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-600 dark:from-amber-600 dark:via-slate-800 dark:to-emerald-600" />

      {/* Institutional Honest Disclaimer & Meta Bar */}
      <div className="bg-slate-50 dark:bg-slate-850 px-4 sm:px-6 py-1.5 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between border-b border-slate-200/80 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 inline-block" />
            SIH 2026 · Idea ID 225558
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">
            Prototype: not affiliated with MoE/AICTE. All data synthetic.
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">|</span>
          <span className="text-blue-700 dark:text-blue-300 font-medium text-[11px] hidden lg:inline">
            Demo mode: verification runs in-browser; production architecture is in docs/ARCHITECTURE.md
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-medium">
          <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
            Designed around DPDP Act principles
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            In-Browser Sandbox Active
          </span>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-white flex items-center justify-center shadow-sm ring-1 ring-blue-600/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white font-sans">
                APAAR<span className="text-blue-600 dark:text-blue-400">-Verify</span>
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 tracking-wide">
                SIH Prototype
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block mt-0.5">
              One Nation, One Student ID Verification &amp; Institutional Governance
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector (12 Indian languages) */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 transition shadow-2xs"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold">{localeMeta.nativeName}</span>
              <span className="text-slate-400 text-[10px]">({localeMeta.code.toUpperCase()})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-60 rounded-lg bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 max-h-80 overflow-y-auto ring-1 ring-black/5"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 mb-1">
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
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-700/70 transition ${
                        isSelected
                          ? 'font-bold text-blue-700 dark:text-blue-300 bg-blue-50/60 dark:bg-slate-700/50'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{item.nativeName}</span>
                        <span className="text-[10px] text-slate-400">
                          {item.name} {item.dir === 'rtl' ? '(RTL)' : ''}
                        </span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Labs & Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 transition shadow-2xs"
              aria-label="Open Labs and Demo Tools"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Labs &amp; Persona</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-1.5 w-76 rounded-lg bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-slate-800 dark:text-slate-100 ring-1 ring-black/5"
                onMouseLeave={() => setDemoMenuOpen(false)}
              >
                {/* Active Persona Switcher */}
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select User Persona
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
                      className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/60 transition ${
                        isSelected
                          ? 'font-bold text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-slate-700/40'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{ROLE_LABELS[r].label}</span>
                          {isSelected && <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Active</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {profile.name} · {profile.institutionName || 'Central Regulatory'}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}

                <div className="my-2 border-t border-slate-100 dark:border-slate-700" />

                {/* Secondary Labs Modules */}
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Supplementary SIH Modules
                </div>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('apaar_open_lab', { detail: 'assistant' }));
                    }
                    if (onOpenLab) onOpenLab('assistant');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Multilingual Policy Assistant (RAG)</div>
                    <div className="text-[10px] text-slate-400">Ask official AICTE, NEP 2020 &amp; APAAR regulations in 12 languages</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('apaar_open_lab', { detail: 'consent' }));
                    }
                    if (onOpenLab) onOpenLab('consent');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <KeyRound className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">DPDP Student Consent Ledger</div>
                    <div className="text-[10px] text-slate-400">Revocable student consent tokens under DPDP Act 2023</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('apaar_open_lab', { detail: 'verifier' }));
                    }
                    if (onOpenLab) onOpenLab('verifier');
                    setDemoMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                >
                  <QrCode className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Public Verifier Portal &amp; QR</div>
                    <div className="text-[10px] text-slate-400">Employer &amp; university zero-knowledge credential verification</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}
