'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { StudentRecord, VerificationStatus } from '@apaar/shared-types';
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface PipelineTableProps {
  records: StudentRecord[];
  onManualOverride?: (recordId: string, newStatus: VerificationStatus) => void;
}

export function PipelineTable({ records, onManualOverride }: PipelineTableProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'review' | 'rejected' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

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
    const header = 'id,apaar_id,student_name,dob,institution_name,programme,status,risk_score,flags,reasons,suggested_fix\n';
    const rows = filteredRecords.map((r) =>
      [
        r.id,
        r.apaarId,
        `"${r.name}"`,
        r.dob,
        `"${r.institutionName}"`,
        `"${r.programme}"`,
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
    link.setAttribute('download', `aicte_verification_remediation_${filter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Needs Review
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 p-5">
      {/* Table Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            Verification Review Queue
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational roster review. Records flagged for checksum errors, Indic script transliteration, or cross-institution duplication.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Name or APAAR..."
              className="pl-8 pr-3 py-1.5 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 w-56"
            />
          </div>

          {/* Download Remediation Report */}
          <button
            onClick={handleExportRemediationReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Error Report</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded font-medium transition ${
            filter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Records ({counts.total})
        </button>

        <button
          onClick={() => {
            setFilter('review');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded font-medium transition ${
            filter === 'review'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
          }`}
        >
          Needs Review ({counts.review})
        </button>

        <button
          onClick={() => {
            setFilter('rejected');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded font-medium transition ${
            filter === 'rejected'
              ? 'bg-rose-600 text-white font-bold'
              : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
          }`}
        >
          Rejected ({counts.rejected})
        </button>

        <button
          onClick={() => {
            setFilter('verified');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded font-medium transition ${
            filter === 'verified'
              ? 'bg-emerald-700 text-white font-bold'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
          }`}
        >
          Verified ({counts.verified})
        </button>
      </div>

      {/* Dense Data Table (GIGW 3.0 / WCAG 2.2 AA) */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded">
        <table className="w-full text-left text-xs border-collapse" aria-label="Student verification review records">
          <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 sticky top-0">
            <tr>
              <th scope="col" className="py-2.5 px-3">#</th>
              <th scope="col" className="py-2.5 px-3">APAAR ID</th>
              <th scope="col" className="py-2.5 px-3">Student Name</th>
              <th scope="col" className="py-2.5 px-3">DOB</th>
              <th scope="col" className="py-2.5 px-3">Institution &amp; Course</th>
              <th scope="col" className="py-2.5 px-3">Decision</th>
              <th scope="col" className="py-2.5 px-3">Explanation &amp; Suggested Fix</th>
              <th scope="col" className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {pagedRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400">
                  No records matching the selected filter or query.
                </td>
              </tr>
            ) : (
              pagedRecords.map((r, idx) => {
                const rowNum = (page - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition text-slate-700 dark:text-slate-200"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{rowNum}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                      {r.apaarId || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <div>{r.name}</div>
                      <div className="text-[10px] text-slate-400">{r.email}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">{r.dob}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {r.programme || 'B.Tech'}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {r.institutionName}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">{getStatusBadge(r.status)}</td>
                    <td className="py-2.5 px-3 max-w-sm">
                      {r.reasons && r.reasons.length > 0 ? (
                        <div className="space-y-1">
                          <div className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                            {r.reasons[0]}
                          </div>
                          {r.suggestedFix && (
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-600 dark:text-slate-400">
                                Fix:
                              </span>{' '}
                              {r.suggestedFix}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          All identity and schema rules passed.
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {r.status === 'NEEDS_REVIEW' && (
                        <button
                          onClick={() => onManualOverride && onManualOverride(r.id, 'VERIFIED')}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition"
                          title="Override and mark verified"
                        >
                          Override
                        </button>
                      )}
                      {r.status === 'REJECTED' && (
                        <span className="text-[10px] text-rose-500 font-medium">Flagged</span>
                      )}
                      {r.status === 'VERIFIED' && (
                        <span className="text-[10px] text-slate-400">Archived</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
        <div>
          Showing {Math.min((page - 1) * pageSize + 1, filteredRecords.length)} to{' '}
          {Math.min(page * pageSize, filteredRecords.length)} of {filteredRecords.length} records
        </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="font-mono px-2">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
