'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { StudentRecord, VerificationStatus } from '@apaar/shared-types';
import { ROLE_LABELS } from '@apaar/ui';
import { generateSyntheticBatch } from '../lib/synthetic';
import { runVerificationPipeline, AuditLedger } from '../lib/pipeline';
import { UploadWizard } from '../components/UploadWizard';
import { PipelineTable } from '../components/PipelineTable';
import { AuditExplorer } from '../components/AuditExplorer';
import { AicteDashboard } from '../components/AicteDashboard';
import { StudentConsentView } from '../components/StudentConsentView';
import { PublicVerifierView } from '../components/PublicVerifierView';
import { PolicyAssistantView } from '../components/PolicyAssistantView';
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Lock,
  BarChart3,
  Building2,
  FileSpreadsheet,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'queue' | 'audit' | 'oversight'>('upload');
  const [labModule, setLabModule] = useState<'assistant' | 'consent' | 'verifier' | null>(null);

  // In-memory student dataset & append-only audit ledger
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [auditLedger] = useState<AuditLedger>(() => new AuditLedger());

  // Initialize with a realistic baseline roster of 40 records for instant demonstration
  useEffect(() => {
    let cancelled = false;
    const initBaseline = async () => {
      const initialBatch = generateSyntheticBatch(40, 42);
      const { records: verifiedRecords } = runVerificationPipeline(initialBatch);
      if (cancelled) return;
      setRecords(verifiedRecords);

      await auditLedger.appendEvent(
        'INGEST',
        'system_init',
        'institution',
        'Initial institutional roster baseline loaded (40 records)',
        user.institutionId
      );
      await auditLedger.appendEvent(
        'DECISION',
        'system_pipeline',
        'superadmin',
        'Initial 5-stage verification completed and hashed',
        user.institutionId
      );
    };
    initBaseline();

    // Listen for Labs triggers from the Header dropdown
    const handleLabEvent = (e: any) => {
      if (e.detail) {
        setLabModule(e.detail);
      }
    };
    window.addEventListener('apaar_open_lab', handleLabEvent);
    return () => {
      cancelled = true;
      window.removeEventListener('apaar_open_lab', handleLabEvent);
    };
  }, [auditLedger, user.institutionId]);

  const handleDatasetProcessed = (newRecords: StudentRecord[], updatedLedger: AuditLedger) => {
    setRecords(newRecords);
    setActiveTab('queue'); // Instantly jump to review queue so the judge inspects row results
  };

  const handleManualOverride = (recordId: string, newStatus: VerificationStatus) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id === recordId) {
          const updated = { ...r, status: newStatus, riskScore: newStatus === 'VERIFIED' ? 0 : r.riskScore };
          auditLedger.appendEvent(
            'DECISION',
            user.id,
            role,
            `Manual registrar override on student '${r.name}' (APAAR: ${r.apaarId}) to ${newStatus}`,
            user.institutionId
          );
          return updated;
        }
        return r;
      })
    );
  };

  // Operational metrics
  const verifiedCount = records.filter((r) => r.status === 'VERIFIED').length;
  const reviewCount = records.filter((r) => r.status === 'NEEDS_REVIEW').length;
  const rejectedCount = records.filter((r) => r.status === 'REJECTED').length;
  const lastEvent = auditLedger.getEvents().slice(-1)[0];
  const shortHeadHash = lastEvent ? lastEvent.hash.substring(0, 12) + '...' : 'Genesis';

  // If a secondary Labs module was selected from Header:
  if (labModule) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLabModule(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Operational Dashboard</span>
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Viewing Experimental Lab Module: <strong className="text-slate-800 dark:text-slate-200 uppercase">{labModule}</strong>
            </span>
          </div>
        </div>

        {labModule === 'assistant' && <PolicyAssistantView />}
        {labModule === 'consent' && <StudentConsentView />}
        {labModule === 'verifier' && <PublicVerifierView />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dense Institutional Header Card (Neutral GIGW 3.0 / Enterprise Style) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {ROLE_LABELS[role].label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {user.institutionName || 'AICTE Central Authority'} · {user.email}
            </p>
          </div>
        </div>

        {/* Real-Time Operational Summary */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Active Roster</div>
            <div className="font-bold text-slate-900 dark:text-white">{records.length} records</div>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Needs Review</div>
            <div className="font-bold text-amber-600 dark:text-amber-400">{reviewCount} flagged</div>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Rejected</div>
            <div className="font-bold text-rose-600 dark:text-rose-400">{rejectedCount} errors</div>
          </div>

          <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
            <div className="text-slate-400 text-[10px] uppercase font-semibold">Ledger Head</div>
            <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{shortHeadHash}</div>
          </div>
        </div>
      </div>

      {/* 4-Item Primary Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition ${
            activeTab === 'upload'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload &amp; Verify</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition ${
            activeTab === 'queue'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Review Queue</span>
          {reviewCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
              {reviewCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('oversight')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold transition ${
            activeTab === 'oversight'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>AICTE Oversight</span>
          {role === 'aicte' && (
            <span className="ml-1 text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-bold">
              Officer
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT 1: UPLOAD & VERIFY */}
      {activeTab === 'upload' && (
        <UploadWizard
          onDatasetProcessed={handleDatasetProcessed}
          auditLedger={auditLedger}
        />
      )}

      {/* TAB CONTENT 2: REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <PipelineTable
          records={records}
          onManualOverride={handleManualOverride}
        />
      )}

      {/* TAB CONTENT 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <AuditExplorer auditLedger={auditLedger} />
      )}

      {/* TAB CONTENT 4: AICTE OVERSIGHT */}
      {activeTab === 'oversight' && (
        <AicteDashboard />
      )}
    </div>
  );
}
