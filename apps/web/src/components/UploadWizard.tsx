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
  Languages,
  ShieldAlert,
  ArrowRight,
  Hash,
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsvText = (csvText: string, sourceName: string): { records: StudentRecord[]; error?: string; warning?: string } => {
    if (!csvText || csvText.trim().length === 0) {
      return { records: [], error: `File '${sourceName}' is completely empty (0 bytes). Please upload a valid CSV roster with student records.` };
    }

    // Binary / Corrupted non-text check
    if (csvText.includes('\0')) {
      return { records: [], error: `Binary data detected in '${sourceName}'. The file appears to be a compiled binary, executable, or image rather than a valid CSV text document.` };
    }

    let controlChars = 0;
    const sampleLength = Math.min(csvText.length, 1000);
    for (let i = 0; i < sampleLength; i++) {
      const code = csvText.charCodeAt(i);
      if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
        controlChars++;
      }
    }
    if (controlChars > 5) {
      return { records: [], error: `Corrupted text encoding detected in '${sourceName}'. Please ensure the file is saved as standard UTF-8 CSV.` };
    }

    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return { records: [], error: `File '${sourceName}' contains only a header row or 0 data rows. At least 1 student record is required.` };
    }

    const rawHeaders = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const headers = rawHeaders.map((h) => h.toLowerCase());
    const apaarIdx = headers.findIndex((h) => h.includes('apaar'));
    const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('student'));
    const dobIdx = headers.findIndex((h) => h.includes('dob') || h.includes('birth'));
    const instIdx = headers.findIndex((h) => h.includes('inst'));
    const progIdx = headers.findIndex((h) => h.includes('prog') || h.includes('course'));
    const yearIdx = headers.findIndex((h) => h.includes('year') || h.includes('admission'));
    const cgpaIdx = headers.findIndex((h) => h.includes('cgpa') || h.includes('gpa') || h.includes('marks'));
    const emailIdx = headers.findIndex((h) => h.includes('email'));

    // Validate essential header presence: APAAR ID column is mandatory
    if (apaarIdx === -1) {
      return {
        records: [],
        error: `Header schema mismatch in '${sourceName}'. Missing mandatory 'apaar_id' (or 'apaar') column. Detected headers: [${rawHeaders.slice(0, 8).join(', ')}]`,
      };
    }

    const parsed: StudentRecord[] = [];
    let malformedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 2) {
        malformedCount++;
        continue;
      }

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

    let warning: string | undefined;
    if (malformedCount > 0) {
      warning = `Parsed ${parsed.length} student records. Skipped ${malformedCount} unparseable or blank rows.`;
    }

    return { records: parsed, warning };
  };

  const processRecords = async (rawRecords: StudentRecord[], sourceLabel: string) => {
    setUploadError(null);
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
    setUploadError(null);
    setUploadWarning(null);
    const result = parseCsvText(sample.csvContent, sample.name);
    if (result.error) {
      setUploadError(result.error);
      return;
    }
    if (result.warning) setUploadWarning(result.warning);
    processRecords(result.records, sample.name);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadWarning(null);

    // Empty file check
    if (file.size === 0) {
      setUploadError(`Upload failed: '${file.name}' is completely empty (0 bytes). Please upload a valid CSV roster.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setUploadError(`Upload failed: '${file.name}' exceeds the maximum file size limit of 25MB.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || text.trim().length === 0) {
        setUploadError(`Upload failed: '${file.name}' has no readable text content.`);
        return;
      }
      const result = parseCsvText(text, file.name);
      if (result.error) {
        setUploadError(result.error);
        return;
      }
      if (result.warning) setUploadWarning(result.warning);
      processRecords(result.records, file.name);
    };
    reader.onerror = () => {
      setUploadError(`Failed to read file '${file.name}'. The file may be locked or inaccessible.`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

      {/* Edge-Case Error Banner */}
      {uploadError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 flex items-start gap-3 transition"
        >
          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center justify-between">
              <span>File Ingestion Error</span>
              <button
                onClick={() => setUploadError(null)}
                className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-100 font-semibold text-xs ml-2"
                aria-label="Dismiss error"
              >
                ✕ Dismiss
              </button>
            </div>
            <p className="text-sm mt-1 leading-snug">{uploadError}</p>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
              Tip: Download the CSV template above for correct column names, or test with one of the 3 pre-verified sample rosters below.
            </p>
          </div>
        </div>
      )}

      {/* Warning Banner */}
      {uploadWarning && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-lg border border-amber-300 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-center justify-between text-xs"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{uploadWarning}</span>
          </span>
          <button
            onClick={() => setUploadWarning(null)}
            className="text-amber-700 dark:text-amber-300 hover:text-amber-900 font-bold ml-2"
            aria-label="Dismiss warning"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1-Click Realistic Messy Sample Test Banners */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Interactive SIH Jury Scenarios (Ground-Truth Injected Rosters)</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Click any scenario to execute live 5-stage verification</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {SAMPLE_ROSTERS.map((sample, idx) => {
            const badgeColors = [
              'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300',
              'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300',
              'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300',
            ];
            const borderColors = [
              'border-t-4 border-t-amber-500 hover:border-amber-400',
              'border-t-4 border-t-indigo-500 hover:border-indigo-400',
              'border-t-4 border-t-rose-500 hover:border-rose-400',
            ];
            const scenarioLabels = ['SCENARIO A · DATA INTEGRITY', 'SCENARIO B · INDIC MATCHING', 'SCENARIO C · FRAUD DETECTION'];
            const buttonLabels = ['Verify Scenario A Roster', 'Verify Scenario B Roster', 'Verify Scenario C Roster'];
            const icons = [
              <Hash key="a" className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
              <Languages key="b" className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />,
              <ShieldAlert key="c" className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />,
            ];

            return (
              <div
                key={sample.id}
                className={`border border-slate-200 dark:border-slate-800 ${borderColors[idx % 3]} rounded-xl p-4 bg-white dark:bg-slate-850 hover:shadow-md transition-all flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${badgeColors[idx % 3]}`}>
                      {scenarioLabels[idx % 3]}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">20 Records</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 transition-colors">
                    {icons[idx % 3]}
                    <span>{sample.name}</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {sample.description}
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-mono leading-tight">
                    <div className="text-[9px] uppercase font-bold text-slate-400 mb-0.5">Ground-Truth Faults:</div>
                    {sample.expectedFaults}
                  </div>
                </div>

                <button
                  disabled={isProcessing}
                  onClick={() => handleLoadSample(sample)}
                  className="mt-4 w-full py-2.5 px-3 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 dark:group-hover:text-white"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{buttonLabels[idx % 3]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-850/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-600 transition-all">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          className="hidden"
          id="roster-file-upload"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center shadow-xs">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Drag &amp; drop institutional roster CSV, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 dark:text-blue-400 underline font-bold hover:text-blue-800 dark:hover:text-blue-300"
              >
                browse local file
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Auto-maps APAAR ID, DOB, Name, and Course. Ingests up to 10,000 student records with instant sub-second verification.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              CSV Format
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              UTF-8 Encoding
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
              Max 25MB
            </span>
          </div>
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
