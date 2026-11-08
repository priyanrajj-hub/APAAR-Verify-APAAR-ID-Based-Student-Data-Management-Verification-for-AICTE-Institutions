/**
 * APAAR-Verify i18n Engine & Locale Definitions
 */

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import bn from '../locales/bn.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import pa from '../locales/pa.json';
import or_in from '../locales/or.json';
import ur from '../locales/ur.json';

export type SupportedLocale =
  | 'en'
  | 'hi'
  | 'ta'
  | 'te'
  | 'kn'
  | 'ml'
  | 'bn'
  | 'mr'
  | 'gu'
  | 'pa'
  | 'or'
  | 'ur';

export interface LocaleMeta {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
  script: string;
}

export const LOCALES: Record<SupportedLocale, LocaleMeta> = {
  en: { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr', script: 'Latin' },
  hi: { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr', script: 'Devanagari' },
  ta: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr', script: 'Tamil' },
  te: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr', script: 'Telugu' },
  kn: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr', script: 'Kannada' },
  ml: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr', script: 'Malayalam' },
  bn: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr', script: 'Bengali' },
  mr: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr', script: 'Devanagari' },
  gu: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr', script: 'Gujarati' },
  pa: { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr', script: 'Gurmukhi' },
  or: { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr', script: 'Odia' },
  ur: { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl', script: 'Nastaliq / Arabic' },
};

export const TRANSLATIONS: Record<SupportedLocale, any> = {
  en,
  hi,
  ta,
  te,
  kn,
  ml,
  bn,
  mr,
  gu,
  pa,
  or: or_in,
  ur,
};

/**
 * Nested key lookup with parameter interpolation:
 * t('app.title')
 * t('audit.tamperSuccess', { id: 2 })
 */
export function getTranslation(
  locale: SupportedLocale,
  keyPath: string,
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  const parts = keyPath.split('.');
  let current: any = dict;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallbackCurrent: any = TRANSLATIONS.en;
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return keyPath;
        }
      }
      current = fallbackCurrent;
      break;
    }
  }

  if (typeof current !== 'string') {
    return keyPath;
  }

  if (!params) return current;

  return current.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? String(params[k]) : `{${k}}`));
}
