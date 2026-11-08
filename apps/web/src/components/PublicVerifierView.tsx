'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import {
  ShieldCheck,
  Search,
  Key,
  QrCode,
  Download,
  AlertCircle,
  CheckCircle2,
  Lock,
  Building,
  GraduationCap,
} from 'lucide-react';

export function PublicVerifierView() {
  const { t } = useI18n();

  const [apaarInput, setApaarInput] = useState('987654321018');
  const [tokenInput, setTokenInput] = useState('APAAR-TOKEN-TCS-78921');
  const [isVerifying, setIsVerifying] = useState(false);
  const [certificateData, setCertificateData] = useState<{
    apaarId: string;
    studentName: string;
    institution: string;
    programme: string;
    cgpa?: number;
    credits?: number;
    dob?: string;
    certId: string;
    signatureHash: string;
    issuedAt: string;
    permittedFields: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setErrorMsg(null);
    setCertificateData(null);

    await new Promise((r) => setTimeout(r, 200));

    // Demo Verification validation against seeded student and token
    if (apaarInput.trim() === '987654321018' && tokenInput.trim().toUpperCase() === 'APAAR-TOKEN-TCS-78921') {
      setCertificateData({
        apaarId: '987654321018',
        studentName: 'Aarav Sharma',
        institution: 'Delhi Technological University (DTU)',
        programme: 'B.Tech Computer Science and Engineering',
        cgpa: 8.94,
        certId: 'CERT-AICTE-2026-98124',
        signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        issuedAt: new Date().toISOString().slice(0, 10),
        permittedFields: ['name', 'institution', 'programme', 'cgpa'],
      });
    } else if (apaarInput.trim() === '987654321018' && tokenInput.trim().toUpperCase() === 'APAAR-TOKEN-IITM-44102') {
      setCertificateData({
        apaarId: '987654321018',
        studentName: 'Aarav Sharma',
        institution: 'Delhi Technological University (DTU)',
        programme: 'B.Tech Computer Science and Engineering',
        dob: '2003-04-12',
        cgpa: 8.94,
        credits: 172,
        certId: 'CERT-AICTE-2026-11029',
        signatureHash: 'a7c9f821d394b8e219fb0a24700c3e24704b58ec3949790aa83f619284ba921e',
        issuedAt: new Date().toISOString().slice(0, 10),
        permittedFields: ['name', 'dob', 'institution', 'programme', 'cgpa', 'credits'],
      });
    } else {
      setErrorMsg('Invalid APAAR ID or unconsented/expired access token. Please verify token with the candidate.');
    }
    setIsVerifying(false);
  };

  return (
    <div className="space-y-8">
      {/* Search & Verification Input Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Public Employer &amp; Academic Verification Portal
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Third-party employers, recruitment agencies, and universities can verify academic credentials using a student-consented token.
          </p>
        </div>

        <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Candidate 12-Digit APAAR ID:
            </label>
            <input
              type="text"
              required
              value={apaarInput}
              onChange={(e) => setApaarInput(e.target.value.replace(/\D/g, '').slice(0, 12))}
              placeholder="e.g. 987654321018"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
              Student Consent Access Token:
            </label>
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="e.g. APAAR-TOKEN-TCS-78921"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
            >
              {isVerifying ? 'Verifying with Registry...' : 'Verify Credential'}
            </button>
          </div>
        </form>

        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
          <Lock className="w-3.5 h-3.5" />
          <span>Demo Hint: Try APAAR `987654321018` with Token `APAAR-TOKEN-TCS-78921` or `APAAR-TOKEN-IITM-44102`</span>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Signed Verification Certificate */}
      {certificateData && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-indigo-200 dark:border-indigo-900/60 p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Top Tricolour Header Band */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-black text-gray-900 dark:text-white">
                    Official Academic Verification Certificate
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    VERIFIED &amp; SIGNED
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  All India Council for Technical Education (AICTE) · NEP 2020 Ecosystem
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-gray-400">
              <div>Certificate ID: {certificateData.certId}</div>
              <div>Issue Date: {certificateData.issuedAt}</div>
            </div>
          </div>

          {/* Student & Degree Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                  Student Name
                </span>
                <div className="text-base font-bold text-gray-900 dark:text-white">
                  {certificateData.studentName}
                </div>
              </div>

              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                  APAAR ID (Lifelong Academic ID)
                </span>
                <div className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {certificateData.apaarId}
                </div>
              </div>

              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                  Accredited Institution
                </span>
                <div className="font-medium text-gray-800 dark:text-gray-200">
                  {certificateData.institution}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                  Degree Programme
                </span>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {certificateData.programme}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Cumulative CGPA
                  </span>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {certificateData.cgpa ? `${certificateData.cgpa} / 10.0` : 'Not Consented'}
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    Date of Birth
                  </span>
                  <div className="font-mono text-gray-700 dark:text-gray-300">
                    {certificateData.dob || '🔒 Withheld (Student Consent)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Hash & QR Code Simulation */}
          <div className="bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 flex items-center justify-center shrink-0">
                <QrCode className="w-7 h-7 text-gray-700 dark:text-gray-300" />
              </div>
              <div className="overflow-hidden">
                <div className="text-gray-400 text-[10px]">Cryptographic Digital Seal:</div>
                <div className="text-[11px] text-gray-700 dark:text-gray-300 truncate max-w-[280px]">
                  {certificateData.signatureHash}
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-sans text-xs font-semibold hover:bg-blue-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Download Official Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
