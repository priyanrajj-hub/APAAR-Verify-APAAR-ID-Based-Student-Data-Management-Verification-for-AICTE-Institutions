'use client';

import React, { useState, useRef } from 'react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { StudentRecord } from '@apaar/shared-types';
import { generateSyntheticBatch } from '../lib/synthetic';
import { runVerificationPipeline, AuditLedger } from '../lib/pipeline';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
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
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processRecords = async (rawRecords: StudentRecord[], sourceLabel: string) => {
    setIsProcessing(true);
    setProgress(15);
    setStageName(t('pipeline.stage1'));

    await new Promise((r) => setTimeout(r, 120));
    setProgress(40);
    setStageName(t('pipeline.stage2'));

    await new Promise((r) => setTimeout(r, 150));
    setProgress(70);
    setStageName(t('pipeline.stage3'));

    await new Promise((r) => setTimeout(r, 150));
    setProgress(90);
    setStageName(t('pipeline.stage4'));

    const { records, summary } = runVerificationPipeline(rawRecords);

    // Record audit event in append-only cryptographic ledger
    await auditLedger.appendEvent(
      'INGEST',
      user.id,
      role,
      `Ingested ${records.length} records from ${sourceLabel}`,
      user.institutionId
    );

    await auditLedger.appendEvent(
      'DECISION',
      'system_pipeline',
      'superadmin',
      `Pipeline evaluated ${records.length} records: ${summary.verified} Verified, ${summary.review} Review, ${summary.rejected} Rejected`,
      user.institutionId
    );

    setProgress(100);
    setStageName(t('pipeline.stage5'));
    await new Promise((r) => setTimeout(r, 100));

    setIsProcessing(false);
    onDatasetProcessed(records, auditLedger);
  };

  const handleGenerateSynthetic = () => {
    setFileName('synthetic_batch_400.csv');
    const records = generateSyntheticBatch(400, 42);
    processRecords(records, 'Synthetic Demo Generator (400 records)');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const apaarIdx = headers.findIndex((h) => h.includes('apaar'));
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const dobIdx = headers.findIndex((h) => h.includes('dob') || h.includes('birth'));
      const instIdx = headers.findIndex((h) => h.includes('inst'));
      const progIdx = headers.findIndex((h) => h.includes('prog'));
      const yearIdx = headers.findIndex((h) => h.includes('year'));
      const cgpaIdx = headers.findIndex((h) => h.includes('cgpa'));
      const emailIdx = headers.findIndex((h) => h.includes('email'));

      const parsed: StudentRecord[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim());
        if (cols.length < 3) continue;

        parsed.push({
          id: `REC_CSV_${i}`,
          apaarId: cols[apaarIdx >= 0 ? apaarIdx : 0] || '',
          name: cols[nameIdx >= 0 ? nameIdx : 1] || '',
          dob: cols[dobIdx >= 0 ? dobIdx : 2] || '2002-01-01',
          gender: 'Male',
          category: 'General',
          institutionId: user.institutionId || 'INST_01',
          institutionName: cols[instIdx >= 0 ? instIdx : 3] || user.institutionName || 'Demo Institute',
          programme: cols[progIdx >= 0 ? progIdx : 4] || 'B.Tech CSE',
          academicYear: parseInt(cols[yearIdx >= 0 ? yearIdx : 5] || '2024', 10),
          cgpa: parseFloat(cols[cgpaIdx >= 0 ? cgpaIdx : 6] || '7.5'),
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

      processRecords(parsed, `Uploaded file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleRows = generateSyntheticBatch(25, 99);
    const csvHeader = 'apaar,name,dob,gender,inst_id,institution,prog,year,cgpa,attendance,email\n';
    const csvContent = sampleRows
      .map((r) =>
        [
          r.apaarId,
          `"${r.name}"`,
          r.dob,
          r.gender,
          r.institutionId,
          `"${r.institutionName}"`,
          `"${r.programme}"`,
          r.academicYear,
          r.cgpa,
          r.attendancePct,
          r.email,
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_student_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-600" />
            Bulk Ingest &amp; Verification Wizard
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Upload institutional student enrolment lists (CSV / XLSX) or generate a pre-seeded synthetic dataset for instant SIH evaluation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            {t('common.downloadSample')}
          </button>

          <button
            onClick={handleGenerateSynthetic}
            disabled={isProcessing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate &amp; Run 400 Records
          </button>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-gray-50/50 dark:bg-gray-800/30"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          {fileName ? `Selected: ${fileName}` : 'Click or drag and drop institutional student records'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Supports CSV, XLSX, XLS with automatic column header mapping</p>
      </div>

      {/* Progress Bar during Pipeline Execution */}
      {isProcessing && (
        <div className="space-y-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              {stageName}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-900 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
