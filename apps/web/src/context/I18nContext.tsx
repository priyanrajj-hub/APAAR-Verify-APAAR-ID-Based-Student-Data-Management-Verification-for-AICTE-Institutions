'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLocale, LOCALES, getTranslation, LocaleMeta } from '@apaar/i18n';

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (loc: SupportedLocale) => void;
  localeMeta: LocaleMeta;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>('en');

  useEffect(() => {
    // Restore from localStorage or detect from navigator
    const saved = localStorage.getItem('apaar_locale') as SupportedLocale;
    if (saved && LOCALES[saved]) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = LOCALES[saved].dir;
    } else if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language.split('-')[0] as SupportedLocale;
      if (LOCALES[browserLang]) {
        setLocaleState(browserLang);
        document.documentElement.lang = browserLang;
        document.documentElement.dir = LOCALES[browserLang].dir;
      }
    }
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    if (LOCALES[newLocale]) {
      setLocaleState(newLocale);
      localStorage.setItem('apaar_locale', newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = LOCALES[newLocale].dir;
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    return getTranslation(locale, key, params);
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        localeMeta: LOCALES[locale] || LOCALES.en,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
