'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { AuditEvent } from '@apaar/shared-types';
import { AuditLedger } from '../lib/pipeline';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface AuditExplorerProps {
  auditLedger: AuditLedger;
}

export function AuditExplorer({ auditLedger }: AuditExplorerProps) {
  const { t } = useI18n();
  const [events, setEvents] = useState<AuditEvent[]>(auditLedger.getEvents());
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    brokenAtIndex?: number;
    reason?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 150));
    const res = await auditLedger.verifyIntegrity();
    setVerificationResult(res);
    setIsVerifying(false);
  };

  const handleTamper = async () => {
    // Deliberately tamper with the details of block 1 or 2
    if (events.length > 1) {
      auditLedger.tamperEvent(1, events[1].details + ' [TAMPERED_MALICIOUS_INJECTION]');
    } else if (events.length > 0) {
      auditLedger.tamperEvent(0, events[0].details + ' [TAMPERED_MALICIOUS_INJECTION]');
    }
    setEvents(auditLedger.getEvents());
    // Auto re-verify to show live failure
    const res = await auditLedger.verifyIntegrity();
    setVerificationResult(res);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            {t('audit.title')}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('audit.description')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            disabled={isVerifying || events.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-40"
          >
            <ShieldCheck className="w-4 h-4" />
            {t('audit.verifyChain')}
          </button>

          <button
            onClick={handleTamper}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-40"
          >
            <AlertOctagon className="w-4 h-4" />
            {t('audit.tamperDemo')}
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            verificationResult.valid
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {verificationResult.valid ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <div className="text-xs">
            <div className="font-bold">
              {verificationResult.valid ? t('audit.validChain') : t('common.tamperDetected')}
            </div>
            {!verificationResult.valid && (
              <div className="mt-0.5 opacity-90">
                {verificationResult.reason} (Discovered at event #{verificationResult.brokenAtIndex})
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hash Chain Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold">
                <th className="py-3 px-4"># Index</th>
                <th className="py-3 px-4">{t('common.timestamp')}</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Previous Block Hash</th>
                <th className="py-3 px-4">Current Block SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-mono">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 font-sans">
                    No pipeline actions recorded in audit ledger yet. Ingest or generate records above.
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr
                    key={e.index}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition"
                  >
                    <td className="py-3 px-4 font-bold text-blue-600">#{e.index}</td>
                    <td className="py-3 px-4 text-gray-500 font-sans">{e.timestamp.slice(11, 19)}</td>
                    <td className="py-3 px-4 font-bold text-gray-800 dark:text-gray-200">{e.action}</td>
                    <td className="py-3 px-4 font-sans text-gray-600 dark:text-gray-400">
                      {e.actorRole} ({e.actorId})
                    </td>
                    <td className="py-3 px-4 font-sans text-gray-700 dark:text-gray-300 max-w-[220px] truncate" title={e.details}>
                      {e.details}
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-[10px]">
                      {e.prevHash.substring(0, 16)}…
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      {e.hash.substring(0, 16)}…
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
