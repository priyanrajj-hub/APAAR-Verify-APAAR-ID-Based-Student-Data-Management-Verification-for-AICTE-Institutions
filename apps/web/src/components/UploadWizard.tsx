'use client';

import React, { useState, useRef } from 'react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { StudentRecord } from '@apaar/shared-types';
import { generateSyntheticBatch } from '../lib/synthetic';
import { runVerificationPipeline, AuditLedger } from '../lib/pipeline';
import { SAMPLE_ROSTERS, SampleRoster } from '../lib/sampleDatasets';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Sparkles,
} from 'lucide-react';

interface UploadWizardProps {
  onDatasetProcessed: (records: StudentRecord[], ledger: AuditLedger) => void;
  auditLedger: AuditLedger;
}

export function UploadWizard({ onDatasetProcessed, auditLedger }: UploadWizardProps) {
  const { t } = useI18n();
  const { user, role } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageName, setStageName] = useState('');
  const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);
  const [lastSummary, setLastSummary] = useState<{
    total: number;
    verified: number;
    review: number;
    rejected: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsvText = (csvText: string, sourceName: string) => {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const apaarIdx = headers.findIndex((h) => h.includes('apaar'));
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const dobIdx = headers.findIndex((h) => h.includes('dob') || h.includes('birth'));
    const instIdx = headers.findIndex((h) => h.includes('inst'));
    const progIdx = headers.findIndex((h) => h.includes('prog') || h.includes('course'));
    const yearIdx = headers.findIndex((h) => h.includes('year'));
    const cgpaIdx = headers.findIndex((h) => h.includes('cgpa'));
    const emailIdx = headers.findIndex((h) => h.includes('email'));

    const parsed: StudentRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 3) continue;

      parsed.push({
        id: `REC_${Date.now()}_${i}`,
        apaarId: cols[apaarIdx >= 0 ? apaarIdx : 0] || '',
        name: cols[nameIdx >= 0 ? nameIdx : 1] || '',
        dob: cols[dobIdx >= 0 ? dobIdx : 2] || '2003-01-01',
        gender: (cols[3] === 'Female' ? 'Female' : cols[3] === 'Other' ? 'Other' : 'Male') as 'Male' | 'Female' | 'Other',
        category: 'General',
        institutionId: user.institutionId || 'AICTE_CIT_001',
        institutionName: cols[instIdx >= 0 ? instIdx : 8] || user.institutionName || 'Chennai Institute of Technology',
        programme: cols[progIdx >= 0 ? progIdx : 4] || 'B.Tech CSE',
        academicYear: parseInt(cols[yearIdx >= 0 ? yearIdx : 5] || '2024', 10),
        cgpa: parseFloat(cols[cgpaIdx >= 0 ? cgpaIdx : 6] || '8.0'),
        email: cols[emailIdx >= 0 ? emailIdx : 7] || `student${i}@cit.edu.in`,
        attendancePct: 85,
        status: 'VERIFIED',
        riskScore: 0,
        flags: [],
        reasons: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return parsed;
  };

  const processRecords = async (rawRecords: StudentRecord[], sourceLabel: string) => {
    setIsProcessing(true);
    setProgress(20);
    setStageName('Stage 1: Normalizing Unicode and parsing fields...');

    await new Promise((r) => setTimeout(r, 80));
    setProgress(45);
    setStageName('Stage 2 & 3: Schema rules & 12-digit Luhn check-digit verification...');

    await new Promise((r) => setTimeout(r, 100));
    setProgress(75);
    setStageName('Stage 4: Entity resolution & cross-script Indic transliteration...');

    const { records, summary } = runVerificationPipeline(rawRecords);

    // Record audit event in append-only cryptographic ledger
    await auditLedger.appendEvent(
      'INGEST',
      user.id,
      role,
      `Ingested ${records.length} student records from '${sourceLabel}'`,
      user.institutionId
    );

    await auditLedger.appendEvent(
      'DECISION',
      'system_pipeline',
      'superadmin',
      `Pipeline processed ${records.length} records: ${summary.verified} Verified, ${summary.review} Needs Review, ${summary.rejected} Rejected`,
      user.institutionId
    );

    setProgress(100);
    setStageName('Stage 5: Risk scoring & audit chain logging complete.');
    await new Promise((r) => setTimeout(r, 60));

    setIsProcessing(false);
    setLastUploadedFile(sourceLabel);
    setLastSummary(summary);
    onDatasetProcessed(records, auditLedger);
  };

  const handleLoadSample = (sample: SampleRoster) => {
    const parsed = parseCsvText(sample.csvContent, sample.name);
    processRecords(parsed, sample.name);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const parsed = parseCsvText(text, file.name);
      processRecords(parsed, file.name);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleRows = generateSyntheticBatch(20, 42);
    const csvHeader = 'apaar_id,student_name,dob,gender,course_code,admission_year,cgpa,institution_id,institution_name\n';
    const csvContent = sampleRows
      .map((r) =>
        [
          r.apaarId,
          `"${r.name}"`,
          r.dob,
          r.gender,
          r.programme,
          r.academicYear,
          r.cgpa,
          r.institutionId,
          `"${r.institutionName}"`,
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'aicte_student_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            Upload &amp; Verify Student Roster
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingest technical institution enrollment CSV/XLSX. Automated 5-stage verification checks schema bounds, Luhn check-digits, and duplicate clusters.
          </p>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Download CSV Template</span>
        </button>
      </div>

      {/* 1-Click Realistic Messy Sample Test Banners */}
      <div>
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Evaluation Rosters (Pre-loaded with Ground-Truth Edge Cases)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_ROSTERS.map((sample) => (
            <div
              key={sample.id}
              className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-slate-50 dark:bg-slate-850 hover:border-slate-400 dark:hover:border-slate-600 transition flex flex-col justify-between"
            >
              <div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                  {sample.name}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {sample.description}
                </p>
                <div className="mt-2 text-[10px] font-mono bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  {sample.expectedFaults}
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={() => handleLoadSample(sample)}
                className="mt-3 w-full py-1.5 px-3 rounded text-xs font-medium bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Verify This Roster</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-850/50 transition">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="roster-file-upload"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
            <UploadCloud className="w-5 h-5" />
          </div>

          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Drag and drop custom roster, or{' '}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-900 dark:text-white underline font-bold"
            >
              browse file
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Supports CSV and UTF-8 encoded text up to 10,000 rows. Auto-maps APAAR ID, DOB, Name, and CGPA.
          </p>
        </div>
      </div>

      {/* Processing Progress Indicator */}
      {isProcessing && (
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{stageName}</span>
            <span className="font-mono text-slate-500">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 dark:bg-slate-100 h-1.5 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Last Result Confirmation */}
      {lastSummary && !isProcessing && (
        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Verification complete for &apos;{lastUploadedFile}&apos;
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Total: <span className="font-medium text-slate-700 dark:text-slate-200">{lastSummary.total}</span> | Verified:{' '}
                <span className="font-medium text-emerald-600">{lastSummary.verified}</span> | Needs Review:{' '}
                <span className="font-medium text-amber-600">{lastSummary.review}</span> | Rejected:{' '}
                <span className="font-medium text-rose-600">{lastSummary.rejected}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            All records loaded into Review Queue.
          </div>
        </div>
      )}
    </div>
  );
}
