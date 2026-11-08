'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { LOCALES, SupportedLocale } from '@apaar/i18n';
import { UserRole } from '@apaar/shared-types';
import { ROLE_LABELS } from '@apaar/ui';
import {
  Globe,
  UserCheck,
  Moon,
  Sun,
  ShieldCheck,
  ChevronDown,
  Info,
  Check,
} from 'lucide-react';

export function Header() {
  const { locale, setLocale, localeMeta, t } = useI18n();
  const { user, role, switchRole } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
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
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="tricolour-bar" />

      {/* Top Ministry / SIH announcement bar */}
      <div className="bg-slate-100 dark:bg-gray-800/60 px-4 py-1.5 text-xs text-slate-600 dark:text-gray-300 flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-orange-600 dark:text-orange-400">
            {t('app.sihBadge')}
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline">
            Ministry of Education &amp; AICTE Platform
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
          <Info className="w-3.5 h-3.5" />
          <span>{t('app.demoMode')}</span>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t('app.title')}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                NEP 2020
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector (12 Indian languages) */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
              <span className="font-semibold">{localeMeta.nativeName}</span>
              <span className="text-gray-400 text-[10px]">({localeMeta.code.toUpperCase()})</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {langMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-80 overflow-y-auto"
                onMouseLeave={() => setLangMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Language (12 Locales)
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
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-blue-50 dark:hover:bg-gray-700/60 transition ${
                        isSelected
                          ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-gray-700/40'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">{item.nativeName}</span>
                        <span className="text-[10px] text-gray-400">
                          {item.name} {item.dir === 'rtl' ? '(RTL)' : ''}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Persona / Role Switcher for SIH Evaluators */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition"
              aria-label="Switch User Role"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="max-w-[130px] truncate">{ROLE_LABELS[role].label}</span>
              <ChevronDown className="w-3 h-3 text-indigo-400" />
            </button>

            {roleMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50"
                onMouseLeave={() => setRoleMenuOpen(false)}
              >
                <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Switch Active Persona
                </div>
                {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
                  const profile = DEMO_USERS[r];
                  const isSelected = role === r;
                  return (
                    <button
                      key={r}
                      onClick={() => {
                        switchRole(r);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-gray-700/60 transition ${
                        isSelected
                          ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-gray-700/40'
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold">{ROLE_LABELS[r].label}</span>
                        <span className="text-[10px] text-gray-400">{profile.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}
