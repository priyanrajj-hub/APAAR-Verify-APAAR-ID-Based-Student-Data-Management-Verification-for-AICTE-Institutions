'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { StudentRecord, VerificationStatus } from '@apaar/shared-types';
import { maskName, maskApaarId, getStatusStyle } from '@apaar/ui';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface PipelineTableProps {
  records: StudentRecord[];
}

export function PipelineTable({ records }: PipelineTableProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all_flagged' | 'review' | 'rejected' | 'verified'>('all_flagged');
  const [viewRole, setViewRole] = useState<'inst' | 'aicte'>('inst');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Counts
  const counts = records.reduce(
    (acc, r) => {
      acc.total++;
      if (r.status === 'VERIFIED') acc.verified++;
      else if (r.status === 'NEEDS_REVIEW') acc.review++;
      else if (r.status === 'REJECTED') acc.rejected++;
      return acc;
    },
    { total: 0, verified: 0, review: 0, rejected: 0 }
  );

  // Filter & Search
  const filteredRecords = records.filter((r) => {
    if (filter === 'all_flagged' && r.status === 'VERIFIED') return false;
    if (filter === 'review' && r.status !== 'NEEDS_REVIEW') return false;
    if (filter === 'rejected' && r.status !== 'REJECTED') return false;
    if (filter === 'verified' && r.status !== 'VERIFIED') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchApaar = r.apaarId.includes(q);
      const matchInst = r.institutionName.toLowerCase().includes(q);
      return matchName || matchApaar || matchInst;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const pagedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  const handleExportRemediationReport = () => {
    const header = 'id,apaar_id,name,dob,institution,status,risk_score,flags,reasons,suggested_fix\n';
    const rows = filteredRecords.map((r) =>
      [
        r.id,
        r.apaarId,
        `"${r.name}"`,
        r.dob,
        `"${r.institutionName}"`,
        r.status,
        r.riskScore,
        `"${r.flags.join('; ')}"`,
        `"${r.reasons.join('; ')}"`,
        `"${r.suggestedFix || ''}"`,
      ].join(',')
    );

    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `remediation_report_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="text-2xl font-black text-gray-900 dark:text-white">{counts.total}</div>
          <div className="text-xs text-gray-500 mt-1">{t('common.records')} Evaluated</div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            {counts.verified}
          </div>
          <div className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">{t('common.verified')}</div>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-900 shadow-sm">
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5" />
            {counts.review}
          </div>
          <div className="text-xs text-amber-800 dark:text-amber-300 mt-1">{t('common.review')}</div>
        </div>

        <div className="bg-rose-50/50 dark:bg-rose-950/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-900 shadow-sm">
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-5 h-5" />
            {counts.rejected}
          </div>
          <div className="text-xs text-rose-800 dark:text-rose-300 mt-1">{t('common.rejected')}</div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'all_flagged', label: 'Review + Rejected' },
              { id: 'review', label: 'Review Only' },
              { id: 'rejected', label: 'Rejected Only' },
              { id: 'verified', label: 'Verified Only' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filter === f.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Perspective Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
            <span className="text-gray-400">View as:</span>
            <button
              onClick={() => setViewRole('inst')}
              className={`font-semibold ${viewRole === 'inst' ? 'text-blue-600' : 'text-gray-500'}`}
            >
              Institution (Full)
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={() => setViewRole('aicte')}
              className={`font-semibold ${viewRole === 'aicte' ? 'text-orange-600' : 'text-gray-500'}`}
            >
              AICTE (Masked)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={t('common.search')}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
            />
          </div>

          {/* Export Report */}
          <button
            onClick={handleExportRemediationReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            {t('common.exportCsv')}
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">APAAR ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">DOB</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Programme</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">{t('common.status')}</th>
                <th className="py-3 px-4">Flags &amp; Plain-Language Reasons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-800 dark:text-gray-200">
              {pagedRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400">
                    No records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                pagedRecords.map((r, idx) => {
                  const style = getStatusStyle(r.status);
                  const isAicte = viewRole === 'aicte';
                  const displayApaar = isAicte ? maskApaarId(r.apaarId) : r.apaarId;
                  const displayName = isAicte ? maskName(r.name) : r.name;
                  const displayDob = isAicte ? r.dob.substring(0, 4) + '-••-••' : r.dob;

                  return (
                    <tr
                      key={r.id || idx}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition"
                    >
                      <td className="py-3 px-4 font-mono text-gray-400">{(page - 1) * pageSize + idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-medium">
                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                          {displayApaar}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{displayName}</td>
                      <td className="py-3 px-4 font-mono text-gray-500">{displayDob}</td>
                      <td className="py-3 px-4 max-w-[160px] truncate" title={r.institutionName}>
                        {r.institutionName}
                      </td>
                      <td className="py-3 px-4">{r.programme}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold ${
                              r.riskScore >= 60
                                ? 'text-rose-600'
                                : r.riskScore >= 20
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {r.riskScore}
                          </span>
                          <div className="w-12 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                r.riskScore >= 60
                                  ? 'bg-rose-500'
                                  : r.riskScore >= 20
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${r.riskScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-[280px]">
                        {r.reasons.length > 0 ? (
                          <div className="space-y-1">
                            <div className="text-gray-700 dark:text-gray-300 font-medium">
                              {r.reasons.join(' · ')}
                            </div>
                            {r.suggestedFix && (
                              <div className="text-[11px] text-blue-600 dark:text-blue-400">
                                💡 Fix: {r.suggestedFix}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <div>
              Showing {(page - 1) * pageSize + 1} to{' '}
              {Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
