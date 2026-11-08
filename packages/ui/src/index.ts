/**
 * Shared UI Primitives and Formatters for APAAR-Verify
 */

import { VerificationStatus, UserRole } from '@apaar/shared-types';

/**
 * Format Indian numbers with lakh/crore commas: 26,35,00,000
 */
export function formatIndianNumber(num: number): string {
  const str = Math.floor(num).toString();
  if (str.length <= 3) return str;
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  return formatted;
}

/**
 * Mask PII for non-privileged AICTE / public views
 * Name: "Karthik Sharma" -> "K*** S***"
 * APAAR: "123456789012" -> "1234••••••••"
 */
export function maskName(fullName: string): string {
  if (!fullName) return '';
  return fullName
    .split(' ')
    .map(part => (part.length > 0 ? part[0] + '***' : ''))
    .join(' ');
}

export function maskApaarId(apaarId: string): string {
  if (!apaarId || apaarId.length < 4) return '••••••••••••';
  return apaarId.substring(0, 4) + '••••••••';
}

/**
 * Standard status badge color classes
 */
export function getStatusStyle(status: VerificationStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    case 'VERIFIED':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'NEEDS_REVIEW':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };
    case 'REJECTED':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };
  }
}

/**
 * Standard role styling and human labels
 */
export const ROLE_LABELS: Record<UserRole, { label: string; badgeClass: string }> = {
  institution: {
    label: 'Institution Registrar',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200',
  },
  aicte: {
    label: 'AICTE Officer',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200',
  },
  auditor: {
    label: 'Compliance Auditor',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200',
  },
  student: {
    label: 'Student',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200',
  },
  verifier: {
    label: 'Third-Party Verifier',
    badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200',
  },
  superadmin: {
    label: 'Super Admin',
    badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200',
  },
};
