'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { useAuth } from '../context/AuthContext';
import { ConsentGrant } from '@apaar/shared-types';
import {
  ShieldCheck,
  Lock,
  Plus,
  Trash2,
  Key,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Info,
} from 'lucide-react';

export function StudentConsentView() {
  const { t } = useI18n();
  const { user } = useAuth();

  const [grants, setGrants] = useState<ConsentGrant[]>([
    {
      id: 'CONSENT_001',
      studentApaarId: '987654321018',
      verifierName: 'Tata Consultancy Services (TCS) Campus Verification',
      purpose: 'employment',
      permittedFields: ['name', 'institution', 'programme', 'cgpa'],
      expiresAt: '2026-12-31',
      createdAt: '2026-11-01',
      revoked: false,
      accessToken: 'APAAR-TOKEN-TCS-78921',
    },
    {
      id: 'CONSENT_002',
      studentApaarId: '987654321018',
      verifierName: 'Indian Institute of Technology Madras (M.Tech Admissions)',
      purpose: 'higher_education',
      permittedFields: ['name', 'dob', 'institution', 'programme', 'cgpa', 'credits'],
      expiresAt: '2026-11-30',
      createdAt: '2026-10-15',
      revoked: false,
      accessToken: 'APAAR-TOKEN-IITM-44102',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVerifier, setNewVerifier] = useState('');
  const [newPurpose, setNewPurpose] = useState<'employment' | 'higher_education' | 'scholarship'>('employment');
  const [newFields, setNewFields] = useState<Record<string, boolean>>({
    name: true,
    dob: false,
    institution: true,
    programme: true,
    cgpa: true,
    credits: false,
  });

  const handleRevoke = (id: string) => {
    setGrants(grants.map((g) => (g.id === id ? { ...g, revoked: true } : g)));
  };

  const handleCreateGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVerifier.trim()) return;

    const permitted = Object.keys(newFields).filter((k) => newFields[k]) as any[];
    const randNum = Math.floor(10000 + Math.random() * 90000);
    const token = `APAAR-TOKEN-${newVerifier.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')}-${randNum}`;

    const newGrant: ConsentGrant = {
      id: `CONSENT_${Date.now()}`,
      studentApaarId: user.apaarId || '987654321018',
      verifierName: newVerifier.trim(),
      purpose: newPurpose,
      permittedFields: permitted,
      expiresAt: '2026-12-15',
      createdAt: new Date().toISOString().slice(0, 10),
      revoked: false,
      accessToken: token,
    };

    setGrants([newGrant, ...grants]);
    setNewVerifier('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Student Identity Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-xl shadow-md">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Verified Citizen Record
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              APAAR ID: <span className="font-bold text-gray-800 dark:text-gray-200">{user.apaarId || '987654321018'}</span> · {user.institutionName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          {t('consent.grant')}
        </button>
      </div>

      {/* DPDP Act Principle Card */}
      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-5 shadow-sm text-xs space-y-1">
        <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {t('consent.title')}
        </div>
        <p className="text-emerald-900/80 dark:text-emerald-400">
          Under India&apos;s Digital Personal Data Protection (DPDP) Act 2023, you hold sovereign control over your academic data. No employer, university, or third party can view your degree or grades without your explicit, revocable, and time-bound consent.
        </p>
      </div>

      {/* Active Consent Grants List */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-emerald-600" />
          Active Consent Grants &amp; Cryptographic Tokens
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grants.map((g) => (
            <div
              key={g.id}
              className={`p-5 rounded-2xl border transition ${
                g.revoked
                  ? 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 opacity-60'
                  : 'border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-gray-900 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    {g.purpose.replace('_', ' ')}
                  </span>
                  <h5 className="font-bold text-sm text-gray-900 dark:text-white mt-1">
                    {g.verifierName}
                  </h5>
                </div>
                {g.revoked ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                    Revoked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    Active
                  </span>
                )}
              </div>

              {/* Permitted Fields Chips */}
              <div className="mt-3">
                <span className="text-[11px] text-gray-400 block mb-1">Permitted Fields:</span>
                <div className="flex flex-wrap gap-1">
                  {g.permittedFields.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-mono text-gray-700 dark:text-gray-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Access Token Box */}
              <div className="mt-4 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 font-mono text-xs flex items-center justify-between">
                <span className="text-gray-500 text-[11px]">Token:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{g.accessToken}</span>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <span className="text-gray-400 text-[11px]">Expires: {g.expiresAt}</span>
                {!g.revoked && (
                  <button
                    onClick={() => handleRevoke(g.id)}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Revoke Consent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grant New Consent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base text-gray-900 dark:text-white">
                Grant New Student Consent
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGrant} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Verifier Name (Company / University):
                </label>
                <input
                  type="text"
                  required
                  value={newVerifier}
                  onChange={(e) => setNewVerifier(e.target.value)}
                  placeholder="e.g. Infosys Campus Recruitment 2026"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Purpose of Access:
                </label>
                <select
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                >
                  <option value="employment">Employment / Hiring Verification</option>
                  <option value="higher_education">Higher Education Admission</option>
                  <option value="scholarship">National Scholarship Eligibility</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                  Select Permitted Fields (Data Minimization):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(newFields).map((field) => (
                    <label key={field} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newFields[field]}
                        onChange={(e) =>
                          setNewFields({ ...newFields, [field]: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="capitalize text-gray-700 dark:text-gray-300">{field}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
