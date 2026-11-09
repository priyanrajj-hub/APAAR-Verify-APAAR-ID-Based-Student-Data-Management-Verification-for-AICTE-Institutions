'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { PolicyAssistantView } from './PolicyAssistantView';
import { EntityResolutionView } from './EntityResolutionView';
import { calculateLuhn } from '../lib/synthetic';
import { getTrigrams, jaccardSimilarity } from '../lib/pipeline';
import {
  Sparkles,
  Bot,
  GitMerge,
  Calculator,
  Languages,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export function AiWorkspaceView() {
  const { t, locale } = useI18n();
  const [subTab, setSubTab] = useState<'rag' | 'indic' | 'calculator'>('rag');

  // Interactive Live Calculator Sandbox State
  const [testApaarBase, setTestApaarBase] = useState('98765432101');
  const [testNameA, setTestNameA] = useState('கார்த்திக் Raman');
  const [testNameB, setTestNameB] = useState('Karthik Raman');

  // Compute live Luhn check digit
  const validCheckDigit = calculateLuhn(testApaarBase.replace(/\D/g, '').slice(0, 11).padEnd(11, '0'));
  const fullCalculatedApaar = testApaarBase.replace(/\D/g, '').slice(0, 11).padEnd(11, '0') + validCheckDigit;

  // Compute live trigram similarity
  const trigramsA = getTrigrams(testNameA);
  const trigramsB = getTrigrams(testNameB);
  const similarityScore = (jaccardSimilarity(trigramsA, trigramsB) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* AI Workspace Executive Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-indigo-700/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-[11px] font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>AICTE &amp; NEP 2020 Cognitive Intelligence Suite</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              AI Copilot, Multilingual RAG &amp; Indic Entity Resolution
            </h2>
            <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
              Domain-specific machine learning models for cross-script Indic phonetics, automated regulatory policy retrieval, and zero-defect APAAR ID arithmetic verification.
            </p>
          </div>

          {/* Sub-tab Switcher */}
          <div className="bg-slate-950/60 p-1.5 rounded-xl border border-indigo-500/30 flex items-center gap-1 shrink-0 self-start lg:self-auto">
            <button
              onClick={() => setSubTab('rag')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                subTab === 'rag'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Policy Assistant (RAG)</span>
            </button>

            <button
              onClick={() => setSubTab('indic')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                subTab === 'indic'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Indic Entity Resolution</span>
            </button>

            <button
              onClick={() => setSubTab('calculator')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
                subTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Live Algorithm Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: RAG Multilingual Policy Assistant */}
      {subTab === 'rag' && <PolicyAssistantView />}

      {/* Sub-tab 2: Indic Entity Resolution Lab */}
      {subTab === 'indic' && <EntityResolutionView />}

      {/* Sub-tab 3: Live Algorithm Math & Transliteration Sandbox */}
      {subTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Luhn Check-Digit Arithmetic Engine */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                <Calculator className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  12-Digit Luhn Check-Digit Calculator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Step-by-step arithmetic verification of APAAR ID format
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Enter First 11 Digits of Candidate APAAR ID:
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={testApaarBase}
                  onChange={(e) => setTestApaarBase(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 98765432101"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-sm tracking-wider text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2.5 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Normalized 11-Digit Prefix:</span>
                  <span className="font-bold text-slate-900 dark:text-white tracking-widest">
                    {testApaarBase.slice(0, 11).padEnd(11, '0')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Computed Modulo 10 Check Digit:</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                    {validCheckDigit}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    Valid 12-Digit Canonical APAAR ID:
                  </span>
                  <span className="font-extrabold text-blue-700 dark:text-blue-300 tracking-wider text-sm">
                    {fullCalculatedApaar.slice(0, 4)}-{fullCalculatedApaar.slice(4, 8)}-{fullCalculatedApaar.slice(8, 12)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-blue-900 dark:text-blue-200 block mb-0.5">Verification Rule:</strong>
                Doubles every second digit from right to left. Subtracts 9 if product &gt; 9. Sum is multiplied by 9 and modulo 10 yields the check digit. Validated in &lt;0.001ms per record.
              </div>
            </div>
          </div>

          {/* Card 2: Indic Script Cross-Lingual Transliteration & Similarity */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                <Languages className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Indic Cross-Script Transliteration &amp; Similarity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Resolves student names across Tamil, Devanagari, and Roman scripts
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Student Name Variant A (Indic or Roman):
                </label>
                <input
                  type="text"
                  value={testNameA}
                  onChange={(e) => setTestNameA(e.target.value)}
                  placeholder="e.g. கார்த்திக் Raman or राहुल शर्मा"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Student Name Variant B (Standardized Record):
                </label>
                <input
                  type="text"
                  value={testNameB}
                  onChange={(e) => setTestNameB(e.target.value)}
                  placeholder="e.g. Karthik Raman or Rahul Sharma"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Jaccard Character Trigram Overlap:</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    {similarityScore}% Match
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">AI De-duplication Verdict:</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                      parseFloat(similarityScore) >= 60
                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {parseFloat(similarityScore) >= 60 ? 'Duplicate Identity Suspected' : 'Distinct Identities'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-indigo-900 dark:text-indigo-200 block mb-0.5">Indic Pipeline:</strong>
                Normalizes unicode diacritics via NFC, handles phonetic consonants (e.g. கார்த்திக் $\rightarrow$ Karthik, लक्ष्मी $\rightarrow$ Laxmi), preventing ghost registrations and multi-campus dual scholarships.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
