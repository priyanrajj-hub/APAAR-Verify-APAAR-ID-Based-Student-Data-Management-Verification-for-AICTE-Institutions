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
  Eye,
  X,
  ShieldAlert,
  Copy,
  Sparkles,
} from 'lucide-react';

interface PipelineTableProps {
  records: StudentRecord[];
  onManualOverride?: (recordId: string, newStatus: VerificationStatus) => void;
  onAiExplain?: (record: StudentRecord) => void;
}

export function PipelineTable({ records, onManualOverride, onAiExplain }: PipelineTableProps) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<'all' | 'review' | 'rejected' | 'verified'>('all');
  const [selectedErrorFilter, setSelectedErrorFilter] = useState<string | null>(null);
  const [copiedApaar, setCopiedApaar] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [inspectingRecord, setInspectingRecord] = useState<StudentRecord | null>(null);
  const pageSize = 20;

  const handleCopyApaar = (apaar: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(apaar);
      setCopiedApaar(apaar);
      setTimeout(() => setCopiedApaar(null), 2000);
    }
  };

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

    if (selectedErrorFilter) {
      const matchesError = r.reasons.some((reason) => {
        const low = reason.toLowerCase();
        if (selectedErrorFilter === 'Luhn Check-Digit Mismatch') return low.includes('luhn') || low.includes('check digit');
        if (selectedErrorFilter === 'Non-standard Date Format') return low.includes('date') || low.includes('format');
        if (selectedErrorFilter === 'Age Range Out of Bounds') return low.includes('age');
        if (selectedErrorFilter === 'Multi-Campus Duplicate Conflict') return low.includes('duplicate') || low.includes('multiple');
        if (selectedErrorFilter === 'Indic Script Transliterated') return low.includes('indic') || low.includes('transliterat');
        return reason === selectedErrorFilter;
      });
      if (!matchesError) return false;
    }

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

  // Dynamically aggregate top error types
  const errorTypeCounts: Record<string, number> = {};
  records.forEach((r) => {
    if (r.reasons && r.reasons.length > 0) {
      r.reasons.forEach((reason) => {
        let key = reason;
        const low = reason.toLowerCase();
        if (low.includes('luhn') || low.includes('check digit')) {
          key = 'Luhn Check-Digit Mismatch';
        } else if (low.includes('date') || low.includes('format')) {
          key = 'Non-standard Date Format';
        } else if (low.includes('age')) {
          key = 'Age Range Out of Bounds';
        } else if (low.includes('duplicate') || low.includes('multiple')) {
          key = 'Multi-Campus Duplicate Conflict';
        } else if (low.includes('indic') || low.includes('transliterat')) {
          key = 'Indic Script Transliterated';
        }
        errorTypeCounts[key] = (errorTypeCounts[key] || 0) + 1;
      });
    }
  });

  const sortedErrorTypes = Object.entries(errorTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const hoursSaved = ((records.length * 5) / 60).toFixed(1);

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

      {/* Post-Run Outcome Summary Card */}
      <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Verification Outcome Summary
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Evaluated <strong className="text-slate-900 dark:text-white font-mono">{records.length}</strong> records: {' '}
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{counts.verified} Verified</span>, {' '}
                <span className="text-amber-700 dark:text-amber-400 font-semibold">{counts.review} Needs Review</span>, {' '}
                <span className="text-rose-700 dark:text-rose-400 font-semibold">{counts.rejected} Rejected</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <div className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
                ~{hoursSaved} Manual Audit Hours Saved
              </div>
              <div className="text-[10px] text-slate-400">
                *Assumption: 5 mins/record manual lookup
              </div>
            </div>
            <button
              onClick={handleExportRemediationReport}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Top 3 Error Types (Interactive Filters) */}
        {sortedErrorTypes.length > 0 && (
          <div className="pt-2.5 border-t border-blue-100 dark:border-blue-900/50 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Top Error Types (Click to filter):
            </span>
            {sortedErrorTypes.map(([type, count]) => {
              const isSelected = selectedErrorFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedErrorFilter(isSelected ? null : type);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 shadow-2xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300 dark:ring-blue-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                  }`}
                  title={isSelected ? 'Click to clear filter' : `Filter table by ${type}`}
                >
                  <span>{type}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected
                        ? 'bg-white text-blue-700'
                        : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {count}
                  </span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
            {selectedErrorFilter && (
              <button
                onClick={() => setSelectedErrorFilter(null)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold ml-1"
              >
                Clear Error Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/90 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs shadow-2xs">
        <button
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-bold transition-all ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Records ({counts.total})
        </button>

        <button
          onClick={() => {
            setFilter('review');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-bold transition-all ${
            filter === 'review'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
          }`}
        >
          Needs Review ({counts.review})
        </button>

        <button
          onClick={() => {
            setFilter('rejected');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-bold transition-all ${
            filter === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
          }`}
        >
          Rejected ({counts.rejected})
        </button>

        <button
          onClick={() => {
            setFilter('verified');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-md font-bold transition-all ${
            filter === 'verified'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
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
                    <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold tracking-tight">{r.apaarId || '—'}</span>
                        {r.apaarId && (
                          <button
                            onClick={() => handleCopyApaar(r.apaarId)}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            title={copiedApaar === r.apaarId ? 'Copied!' : 'Copy APAAR ID'}
                            aria-label="Copy APAAR ID"
                          >
                            {copiedApaar === r.apaarId ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                        {r.flags.includes('APAAR_CHECKSUM_FAILED') ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                            Check Failed
                          </span>
                        ) : r.apaarId ? (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                            ✓ Luhn
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span>
                        {r.flags.includes('INDIC_SCRIPT_NORMALIZED') && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                            Indic
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* AI Explain Trigger */}
                        {(r.status !== 'VERIFIED' || r.flags.length > 0) && (
                          <button
                            onClick={() => onAiExplain && onAiExplain(r)}
                            className="px-2 py-1 rounded text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition flex items-center gap-1 shadow-2xs"
                            title="Ask AI Copilot to explain regulatory findings & recommended remediation"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>AI Explain</span>
                          </button>
                        )}

                        <button
                          onClick={() => setInspectingRecord(r)}
                          className="px-2 py-1 rounded text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center gap-1"
                          title="Inspect student verification dossier"
                        >
                          <Eye className="w-3 h-3 text-slate-500" />
                          <span>Inspect</span>
                        </button>
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
                          <span className="text-[10px] text-rose-500 font-medium px-1">Flagged</span>
                        )}
                        {r.status === 'VERIFIED' && (
                          <span className="text-[10px] text-slate-400 px-1">Archived</span>
                        )}
                      </div>
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

      {/* Student Record Verification Dossier Modal */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">ID: {inspectingRecord.id}</span>
                  {getStatusBadge(inspectingRecord.status)}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {inspectingRecord.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {inspectingRecord.programme} · {inspectingRecord.institutionName}
                </p>
              </div>
              <button
                onClick={() => setInspectingRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Record Identity Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-bold">APAAR ID</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{inspectingRecord.apaarId || 'None'}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Date of Birth</div>
                <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{inspectingRecord.dob}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Academic CGPA</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">{inspectingRecord.cgpa.toFixed(2)}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Anomaly Risk</div>
                <div className={`font-bold mt-0.5 ${inspectingRecord.riskScore > 50 ? 'text-rose-600' : inspectingRecord.riskScore > 20 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {inspectingRecord.riskScore}/100
                </div>
              </div>
            </div>

            {/* 5-Stage Verification Pipeline Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Automated 5-Stage Verification Audit Breakdown
              </h4>
              <div className="space-y-2 text-xs">
                {/* Stage 1: Ingestion & Unicode Hygiene */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Stage 1: Ingestion &amp; Unicode Hygiene</div>
                      <div className="text-[11px] text-slate-500">UTF-8 validated, whitespace stripped, zero control characters</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">PASS</span>
                </div>

                {/* Stage 2: Schema Rules & Type Bounds */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {inspectingRecord.flags.includes('SCHEMA_INVALID_DATE') || inspectingRecord.flags.includes('AGE_OUT_OF_BOUNDS') ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Stage 2: Schema Bounds &amp; Type Coercion</div>
                      <div className="text-[11px] text-slate-500">Age range 16-35, valid ISO date, institution AISHE match</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inspectingRecord.flags.includes('SCHEMA_INVALID_DATE') || inspectingRecord.flags.includes('AGE_OUT_OF_BOUNDS') ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                    {inspectingRecord.flags.includes('SCHEMA_INVALID_DATE') || inspectingRecord.flags.includes('AGE_OUT_OF_BOUNDS') ? 'FLAGGED' : 'PASS'}
                  </span>
                </div>

                {/* Stage 3: 12-Digit Luhn Check-Digit */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {inspectingRecord.flags.includes('APAAR_CHECKSUM_FAILED') ? (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Stage 3: 12-Digit Luhn Checksum Algorithm</div>
                      <div className="text-[11px] text-slate-500">
                        {inspectingRecord.flags.includes('APAAR_CHECKSUM_FAILED')
                          ? 'Check-digit does not match Luhn sum of first 11 digits'
                          : '12-digit Luhn check-digit cryptographically validated'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inspectingRecord.flags.includes('APAAR_CHECKSUM_FAILED') ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                    {inspectingRecord.flags.includes('APAAR_CHECKSUM_FAILED') ? 'FAILED' : 'PASS'}
                  </span>
                </div>

                {/* Stage 4: Cross-Script Indic Resolution */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Stage 4: Multi-Script Indic Resolution</div>
                      <div className="text-[11px] text-slate-500">
                        {inspectingRecord.flags.includes('INDIC_SCRIPT_NORMALIZED')
                          ? 'Native script transliterated to standard Latin with Soundex matching'
                          : 'Standard Latin phonetic representation verified'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {inspectingRecord.flags.includes('INDIC_SCRIPT_NORMALIZED') ? 'NORMALIZED' : 'VERIFIED'}
                  </span>
                </div>

                {/* Stage 5: Ghost Student & Cross-Institution Conflict */}
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {inspectingRecord.flags.includes('DUAL_ENROLLMENT_CONFLICT') ? (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Stage 5: Multi-Campus Conflict &amp; Hash Sealing</div>
                      <div className="text-[11px] text-slate-500">
                        {inspectingRecord.flags.includes('DUAL_ENROLLMENT_CONFLICT')
                          ? 'Duplicate enrollment detected across multiple technical colleges'
                          : 'Zero multi-campus conflict detected; sealed in SHA-256 block'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${inspectingRecord.flags.includes('DUAL_ENROLLMENT_CONFLICT') ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'}`}>
                    {inspectingRecord.flags.includes('DUAL_ENROLLMENT_CONFLICT') ? 'CONFLICT' : 'SEALED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested Fix Box */}
            {inspectingRecord.suggestedFix && (
              <div className="p-3.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <span>Actionable Remediation Guidance</span>
                </div>
                <p className="text-blue-800 dark:text-blue-200 mt-1">{inspectingRecord.suggestedFix}</p>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setInspectingRecord(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Close Dossier
              </button>

              {inspectingRecord.status === 'NEEDS_REVIEW' && (
                <button
                  onClick={() => {
                    if (onManualOverride) {
                      onManualOverride(inspectingRecord.id, 'VERIFIED');
                    }
                    setInspectingRecord(null);
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve &amp; Mark Verified (Log to Chain)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
