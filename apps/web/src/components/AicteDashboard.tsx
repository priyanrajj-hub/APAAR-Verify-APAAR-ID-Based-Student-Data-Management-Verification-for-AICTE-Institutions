'use client';

import React, { useState } from 'react';
import { useI18n } from '../context/I18nContext';
import { InstitutionMetrics } from '@apaar/shared-types';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  BarChart3,
  MapPin,
  Filter,
} from 'lucide-react';

export function AicteDashboard() {
  const { t } = useI18n();

  // Simulated Institution compliance data across major states
  const [institutions] = useState<InstitutionMetrics[]>([
    {
      id: 'INST_001',
      name: 'Chennai Institute of Technology',
      state: 'Tamil Nadu',
      district: 'Chennai',
      sanctionedIntake: 600,
      totalEnrolled: 592,
      verifiedCount: 578,
      reviewCount: 12,
      rejectedCount: 2,
      qualityScore: 98.2,
      lastUploadAt: '2026-11-04',
      isFlaggedForInspection: false,
    },
    {
      id: 'INST_002',
      name: 'Delhi Technological University',
      state: 'Delhi',
      district: 'New Delhi',
      sanctionedIntake: 720,
      totalEnrolled: 710,
      verifiedCount: 695,
      reviewCount: 14,
      rejectedCount: 1,
      qualityScore: 98.9,
      lastUploadAt: '2026-11-06',
      isFlaggedForInspection: false,
    },
    {
      id: 'INST_003',
      name: 'Pune Polytechnic Institute',
      state: 'Maharashtra',
      district: 'Pune',
      sanctionedIntake: 360,
      totalEnrolled: 495, // Intake inflation!
      verifiedCount: 380,
      reviewCount: 45,
      rejectedCount: 70,
      qualityScore: 76.8,
      lastUploadAt: '2026-11-02',
      isFlaggedForInspection: true,
    },
    {
      id: 'INST_004',
      name: 'Hyderabad Business School',
      state: 'Telangana',
      district: 'Hyderabad',
      sanctionedIntake: 240,
      totalEnrolled: 235,
      verifiedCount: 220,
      reviewCount: 10,
      rejectedCount: 5,
      qualityScore: 93.6,
      lastUploadAt: '2026-11-05',
      isFlaggedForInspection: false,
    },
    {
      id: 'INST_005',
      name: 'Bengaluru Tech Campus',
      state: 'Karnataka',
      district: 'Bengaluru',
      sanctionedIntake: 480,
      totalEnrolled: 475,
      verifiedCount: 460,
      reviewCount: 11,
      rejectedCount: 4,
      qualityScore: 96.8,
      lastUploadAt: '2026-11-07',
      isFlaggedForInspection: false,
    },
    {
      id: 'INST_006',
      name: 'Jaipur Engineering College',
      state: 'Rajasthan',
      district: 'Jaipur',
      sanctionedIntake: 300,
      totalEnrolled: 340,
      verifiedCount: 250,
      reviewCount: 42,
      rejectedCount: 48,
      qualityScore: 73.5,
      lastUploadAt: '2026-10-29',
      isFlaggedForInspection: true,
    },
  ]);

  const [selectedState, setSelectedState] = useState<string>('all');

  const filteredInsts = selectedState === 'all'
    ? institutions
    : institutions.filter((i) => i.state.toLowerCase() === selectedState.toLowerCase());

  const totalSanctioned = institutions.reduce((s, i) => s + i.sanctionedIntake, 0);
  const totalEnrolled = institutions.reduce((s, i) => s + i.totalEnrolled, 0);
  const flaggedCount = institutions.filter((i) => i.isFlaggedForInspection).length;

  return (
    <div className="space-y-8">
      {/* Top AICTE Regulatory KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Institutions Monitored</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-2">7,155</div>
          <div className="text-[11px] text-gray-400 mt-1">Across 28 States &amp; 8 UTs</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Sanctioned vs Enrolled</span>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {((totalEnrolled / totalSanctioned) * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {totalEnrolled.toLocaleString()} enrolled / {totalSanctioned.toLocaleString()} approved
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">Inspection Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {flaggedCount} Institutes
          </div>
          <div className="text-[11px] text-rose-600/80 mt-1">Triggered by intake &gt;120% or high rejections</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">National Data Quality</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            94.8%
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
            +3.2% vs previous approval cycle
          </div>
        </div>
      </div>

      {/* Critical AICTE Regulatory Alerts Feed */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            AICTE Regulatory Surveillance Feed: Urgent Anomaly Triggers
          </h4>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
            2 Urgent Flags
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-rose-200 dark:border-rose-900/40">
            <div className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>Pune Polytechnic Institute (INST_003)</span>
              <span className="text-rose-600 font-mono font-bold">137.5% Capacity</span>
            </div>
            <p className="text-gray-500 mt-1">
              Enrolment (495) significantly exceeds AICTE sanctioned capacity (360). 70 invalid student APAAR records detected.
            </p>
            <div className="mt-2 text-[11px] text-rose-600 font-semibold">
              Action Required: Issue Show-Cause Notice &amp; Schedule Physical Inspection.
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-rose-200 dark:border-rose-900/40">
            <div className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>Jaipur Engineering College (INST_006)</span>
              <span className="text-rose-600 font-mono font-bold">High Rejection Rate</span>
            </div>
            <p className="text-gray-500 mt-1">
              48 rejected records (14.1% of cohort) with consecutive failed Luhn check digits and duplicate names.
            </p>
            <div className="mt-2 text-[11px] text-rose-600 font-semibold">
              Action Required: Temporary suspension of scholarship portal upload rights.
            </div>
          </div>
        </div>
      </div>

      {/* Institution-Wise Quality & Inspection Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              Institutional Quality &amp; Approval Compliance Table
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live breakdown of verified student cohorts, review queues, and inspection triggers across monitored campuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            >
              <option value="all">All States</option>
              <option value="tamil nadu">Tamil Nadu</option>
              <option value="delhi">Delhi</option>
              <option value="maharashtra">Maharashtra</option>
              <option value="telangana">Telangana</option>
              <option value="karnataka">Karnataka</option>
              <option value="rajasthan">Rajasthan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold">
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Sanctioned</th>
                <th className="py-3 px-4">Enrolled</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Review</th>
                <th className="py-3 px-4">Rejected</th>
                <th className="py-3 px-4">Quality Distribution</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredInsts.map((inst) => {
                const total = inst.totalEnrolled || 1;
                const vPct = (inst.verifiedCount / total) * 100;
                const revPct = (inst.reviewCount / total) * 100;
                const rjPct = (inst.rejectedCount / total) * 100;

                return (
                  <tr key={inst.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {inst.name}
                    </td>
                    <td className="py-3 px-4 text-gray-500">{inst.state}</td>
                    <td className="py-3 px-4 font-mono">{inst.sanctionedIntake}</td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={inst.totalEnrolled > inst.sanctionedIntake ? 'text-rose-600 font-extrabold' : ''}>
                        {inst.totalEnrolled}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-600 font-mono font-bold">{inst.verifiedCount}</td>
                    <td className="py-3 px-4 text-amber-600 font-mono font-bold">{inst.reviewCount}</td>
                    <td className="py-3 px-4 text-rose-600 font-mono font-bold">{inst.rejectedCount}</td>
                    <td className="py-3 px-4 min-w-[130px]">
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                        <div style={{ width: `${vPct}%` }} className="bg-emerald-500 h-full" title={`Verified: ${vPct.toFixed(1)}%`} />
                        <div style={{ width: `${revPct}%` }} className="bg-amber-500 h-full" title={`Review: ${revPct.toFixed(1)}%`} />
                        <div style={{ width: `${rjPct}%` }} className="bg-rose-500 h-full" title={`Rejected: ${rjPct.toFixed(1)}%`} />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {inst.isFlaggedForInspection ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          Inspection Flagged
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
