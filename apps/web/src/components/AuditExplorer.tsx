'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { AuditEvent } from '@apaar/shared-types';
import { AuditLedger } from '../lib/pipeline';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  AlertOctagon,
  CheckCircle2,
  Copy,
  Check,
  Link as LinkIcon,
} from 'lucide-react';

interface AuditExplorerProps {
  auditLedger: AuditLedger;
}

export function AuditExplorer({ auditLedger }: AuditExplorerProps) {
  const { t } = useI18n();
  const [events, setEvents] = useState<AuditEvent[]>(auditLedger.getEvents());
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    brokenAtIndex?: number;
    reason?: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [savedOriginalDetails, setSavedOriginalDetails] = useState<{ idx: number; details: string } | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  React.useEffect(() => {
    setEvents(auditLedger.getEvents());
  }, [auditLedger]);

  const handleVerify = async () => {
    setIsVerifying(true);
    await new Promise((r) => setTimeout(r, 60));
    setEvents(auditLedger.getEvents());
    const res = await auditLedger.verifyIntegrity();
    setVerificationResult(res);
    setIsVerifying(false);
  };

  const handleTamper = async () => {
    const currentEvents = auditLedger.getEvents();
    const targetIdx = currentEvents.length > 1 ? 1 : 0;
    if (currentEvents.length > 0) {
      setSavedOriginalDetails({ idx: targetIdx, details: currentEvents[targetIdx].details });
      auditLedger.tamperEvent(targetIdx, currentEvents[targetIdx].details + ' [TAMPERED_PAYLOAD]');
      setIsTampered(true);
      setEvents(auditLedger.getEvents());
      const res = await auditLedger.verifyIntegrity();
      setVerificationResult(res);
    }
  };

  const handleRestore = async () => {
    if (savedOriginalDetails) {
      auditLedger.tamperEvent(savedOriginalDetails.idx, savedOriginalDetails.details);
      setIsTampered(false);
      setSavedOriginalDetails(null);
      setEvents(auditLedger.getEvents());
      const res = await auditLedger.verifyIntegrity();
      setVerificationResult(res);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            Cryptographic Audit Ledger (SHA-256 Hash Chain)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tamper-evident verification ledger. Every roster ingestion, validation error, and decision is cryptographically sealed in an append-only hash chain.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerify}
            disabled={isVerifying || events.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition disabled:opacity-40"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verify Chain Integrity</span>
          </button>

          <button
            onClick={handleTamper}
            disabled={events.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-40"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Simulate Tamper Attack</span>
          </button>

          {isTampered && (
            <button
              onClick={handleRestore}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Restore Chain</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-3.5 rounded border flex items-center gap-3 text-xs ${
            verificationResult.valid
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
          }`}
        >
          {verificationResult.valid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <div className="font-bold">
              {verificationResult.valid
                ? 'All Block Hashes Verified (Chain Intact)'
                : 'Cryptographic Integrity Breach Detected'}
            </div>
            <div className="text-[11px] mt-0.5 opacity-90">
              {verificationResult.valid
                ? `Successfully recalculated SHA-256 digests across all ${events.length} blocks. Zero tampering found.`
                : `Block #${(verificationResult.brokenAtIndex ?? 0) + 1} hash mismatch! Computed digest diverges from stored previous_hash.`}
            </div>
          </div>
        </div>
      )}

      {/* Hash Chain Blocks */}
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No audit events recorded yet. Ingest a roster to generate chain blocks.
          </div>
        ) : (
          events.map((evt, idx) => (
            <React.Fragment key={evt.index}>
              <div
                className={`border rounded-xl p-4 space-y-2.5 text-xs transition-all ${
                  isTampered && (verificationResult?.brokenAtIndex === idx || (!verificationResult?.valid && idx >= 1))
                    ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-500 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      Block #{idx + 1}
                    </span>
                    <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900">
                      {evt.action}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      by <strong className="text-slate-700 dark:text-slate-300">{evt.actorId}</strong> ({evt.actorRole})
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="text-slate-800 dark:text-slate-200 font-medium text-xs leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {evt.details}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-500 dark:text-slate-400">
                  <div className="truncate flex items-center gap-1.5">
                    <span className="font-bold text-slate-400">PREV:</span>
                    <span className="truncate">{evt.prevHash}</span>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 md:justify-end">
                    <div className="truncate flex items-center gap-1.5">
                      <span className="font-bold text-slate-400">HASH:</span>
                      <span className="truncate text-slate-700 dark:text-slate-300 font-bold">{evt.hash}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(evt.hash)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 p-1"
                      title="Copy SHA-256 hash"
                      aria-label="Copy hash"
                    >
                      {copiedHash === evt.hash ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {idx < events.length - 1 && (
                <div className="flex items-center justify-center -my-1 py-1">
                  <div className="flex flex-col items-center">
                    <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-700" />
                    <LinkIcon className="w-3 h-3 text-slate-400 my-0.5" />
                    <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-700" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}
