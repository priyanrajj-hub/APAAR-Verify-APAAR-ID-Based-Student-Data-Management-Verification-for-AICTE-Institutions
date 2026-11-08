'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { UserRole } from '@apaar/shared-types';
import { ROLE_LABELS, maskName, maskApaarId } from '@apaar/ui';
import {
  ShieldAlert,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Link2,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  Layers,
  Search,
} from 'lucide-react';

export default function HomePage() {
  const { t, locale, localeMeta } = useI18n();
  const { user, role, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'roles' | 'pipeline' | 'architecture'>('overview');

  // Interactive Demo APAAR Luhn Check Digit tester
  const [demoApaarInput, setDemoApaarInput] = useState('98765432101');
  const [luhnResult, setLuhnResult] = useState<number | null>(null);

  const calculateDemoLuhn = (first11: string) => {
    const clean = first11.replace(/\D/g, '').slice(0, 11);
    if (clean.length < 11) return null;
    let sum = 0;
    for (let i = 0; i < clean.length; i++) {
      let n = parseInt(clean[clean.length - 1 - i], 10);
      if (i % 2 === 0) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit;
  };

  const checkDigit = calculateDemoLuhn(demoApaarInput);

  return (
    <div className="space-y-8 pb-12">
      {/* Active Persona Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-200">
                {ROLE_LABELS[role].label}
              </span>
              <span className="text-xs text-blue-300">
                • {user.institutionName || 'AICTE Central Authority'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              {user.name}
            </h2>
            <p className="text-sm text-blue-200">
              {user.email} · Role: <code className="bg-blue-950 px-2 py-0.5 rounded">{role}</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-blue-300 font-medium mr-1">Switch Persona:</span>
            {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  role === r
                    ? 'bg-white text-blue-900 shadow-md scale-105'
                    : 'bg-blue-800/60 hover:bg-blue-700/80 text-blue-100 border border-blue-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {[
          { id: 'overview', label: t('nav.overview'), icon: Layers },
          { id: 'roles', label: t('common.switchRole'), icon: Users },
          { id: 'pipeline', label: t('nav.pipeline'), icon: ShieldAlert },
          { id: 'architecture', label: t('nav.architecture'), icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Cited Facts Cards */}
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              The Problem in Numbers (Verified Research Facts)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                  {t('stats.apaarGenerated')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('stats.apaarGeneratedLabel')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">
                  {t('stats.falseDataRate')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('stats.falseDataLabel')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  {t('stats.duplicateFaculty')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('stats.duplicateFacultyLabel')}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {t('stats.uploadBottleneck')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {t('stats.uploadBottleneckLabel')}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Check Digit Demo Calculator */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-600" />
                  APAAR 12-Digit Demo Checksum Algorithm (Hard Rule 2)
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The official MoE/NeGD APAAR checksum is proprietary. For this SIH prototype, we employ a documented 12-digit scheme: 11 payload digits + 12th digit computed via the Luhn algorithm.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-auto flex-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  Enter First 11 Digits:
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={demoApaarInput}
                  onChange={(e) => setDemoApaarInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 98765432101"
                />
              </div>

              <div className="w-full sm:w-auto pt-5">
                <div className="px-5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Generated 12-Digit APAAR ID:</span>
                  <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">
                    {demoApaarInput.padEnd(11, '•')}
                    <span className="text-orange-600 dark:text-orange-400 underline font-extrabold ml-0.5">
                      {checkDigit !== null ? checkDigit : '?'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Role-Based Masking Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              DPDP Act Privacy By Design: Role-Based Masking Simulation
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When viewed by an AICTE Officer or external auditor, student PII is automatically masked at the query level to uphold data minimization.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Institution Registrar View (Full Scope)
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div><span className="text-gray-400">Student Name:</span> Priya Sharma</div>
                  <div><span className="text-gray-400">APAAR ID:</span> 987654321018</div>
                  <div><span className="text-gray-400">Date of Birth:</span> 2003-08-14</div>
                  <div><span className="text-gray-400">CGPA:</span> 8.92</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-orange-50/30 dark:bg-orange-950/20">
                <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">
                  AICTE / Public Officer View (Masked)
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div><span className="text-gray-400">Student Name:</span> {maskName('Priya Sharma')}</div>
                  <div><span className="text-gray-400">APAAR ID:</span> {maskApaarId('987654321018')}</div>
                  <div><span className="text-gray-400">Date of Birth:</span> 2003-••-••</div>
                  <div><span className="text-gray-400">CGPA:</span> 8.92</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ROLES */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              6 Production Role Personas (Firebase Custom Claims Enforcement)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select any role below to simulate the authenticated view and permissions matrix in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(DEMO_USERS) as UserRole[]).map((r) => {
              const u = DEMO_USERS[r];
              const isCurrent = role === r;
              return (
                <div
                  key={r}
                  className={`p-5 rounded-2xl border transition ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 shadow-md ring-2 ring-blue-500/20'
                      : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {r}
                    </span>
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{u.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {u.institutionName || 'National AICTE Regulatory Authority'}
                  </p>

                  <button
                    onClick={() => switchRole(r)}
                    disabled={isCurrent}
                    className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold transition ${
                      isCurrent
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {isCurrent ? 'Current Persona' : 'Switch to this Persona'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              5-Stage Multi-Engine Verification Pipeline
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Every student record is passed through rigorous algorithmic and statistical checks with full decision explainability.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                step: '01',
                title: t('pipeline.stage1'),
                desc: t('pipeline.stage1Desc'),
                tech: 'Pandas, Pydantic v2, Unicode NFC',
              },
              {
                step: '02',
                title: t('pipeline.stage2'),
                desc: t('pipeline.stage2Desc'),
                tech: 'Demo Luhn Checksum + Mock ApaarRegistryAdapter',
              },
              {
                step: '03',
                title: t('pipeline.stage3'),
                desc: t('pipeline.stage3Desc'),
                tech: 'RapidFuzz, Jaro-Winkler, Indic Transliteration Tri-gram',
              },
              {
                step: '04',
                title: t('pipeline.stage4'),
                desc: t('pipeline.stage4Desc'),
                tech: 'Scikit-Learn IsolationForest, Robust Z-Score, SHAP',
              },
              {
                step: '05',
                title: t('pipeline.stage5'),
                desc: t('pipeline.stage5Desc'),
                tech: 'Weighted Risk Model & SHA-256 Cryptographic Hash Chain',
              },
            ].map((st) => (
              <div
                key={st.step}
                className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-mono font-bold flex items-center justify-center shrink-0">
                    {st.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{st.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{st.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {st.tech}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Production Architecture &amp; Vercel Demo Mode Bridge
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Dual-mode design ensures instant execution in Vercel previews while containerized services orchestrate Kubernetes deployments.
            </p>
          </div>

          <div className="bg-gray-900 text-gray-100 p-6 rounded-2xl font-mono text-xs overflow-x-auto border border-gray-800 leading-relaxed">
            <pre>{`Client Layer (Next.js 15 App Router - Deployed to Vercel)
  ├── 12-Locale i18n System (en, hi, ta, te, kn, ml, bn, mr, gu, pa, or, ur-RTL)
  ├── Role-Based Auth Engine (Institution, AICTE, Auditor, Student, Verifier, Super Admin)
  └── Browser-Side Engine Fallback (SHA-256 WebCrypto, Luhn, Trigram dedupe, TF-IDF RAG)

Backend Services (Python 3.12 / FastAPI Microservices on Kubernetes)
  ├── api-gateway   : JWT validation, rate limiting, request tracing (Port 8000)
  ├── ingest-svc    : Multi-part CSV/XLSX async chunk processor (Port 8001)
  ├── verify-svc    : Schema rules, Luhn check, ApaarRegistryAdapter mock (Port 8002)
  ├── match-svc     : Rapidfuzz, cross-script Indic transliteration resolution (Port 8003)
  ├── anomaly-svc   : IsolationForest & intake ratio z-score outlier detection (Port 8004)
  ├── rag-svc       : Dense vector + BM25 hybrid policy retrieval with citations (Port 8005)
  ├── audit-svc     : Cryptographic SHA-256 append-only hash-chain verification (Port 8006)
  └── notify-svc    : Alert aggregator, simulated email & SMS dispatcher (Port 8007)

Infrastructure & Storage
  ├── Firebase Auth & Firestore with strict role-based security rules
  ├── Redis Streams (local async job queue)
  ├── Qdrant Vector Database (multilingual policy embeddings)
  └── Kubernetes manifests (Kustomize overlays: dev, prod) & Helm chart`}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
