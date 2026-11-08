/**
 * APAAR-Verify Client-Side High Performance Pipeline Engine
 * Runs Stages 1-8 in-browser for Vercel demo mode & local environments
 */

import { StudentRecord, VerificationStatus, AuditEvent } from '@apaar/shared-types';
import { calculateLuhn } from './synthetic';

export interface PipelineProgress {
  total: number;
  processed: number;
  verified: number;
  review: number;
  rejected: number;
  currentStage: string;
  isComplete: boolean;
}

// Trigram helper for client-side fuzzy matching
export function getTrigrams(str: string): Set<string> {
  const clean = ' ' + str.toLowerCase().replace(/[^a-z0-9]/g, '') + ' ';
  const set = new Set<string>();
  for (let i = 0; i < clean.length - 2; i++) {
    set.add(clean.substring(i, i + 3));
  }
  return set;
}

export function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  let intersection = 0;
  setA.forEach((item) => {
    if (setB.has(item)) intersection++;
  });
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Execute the 5-Stage Verification Pipeline on an array of raw student records
 */
export function runVerificationPipeline(
  records: StudentRecord[],
  onProgress?: (progress: PipelineProgress) => void
): { records: StudentRecord[]; summary: { total: number; verified: number; review: number; rejected: number } } {
  const seenApaar = new Map<string, number>();
  const byDob = new Map<string, { index: number; trigrams: Set<string>; name: string }[]>();

  const total = records.length;
  let verified = 0;
  let review = 0;
  let rejected = 0;

  // Stage 1 & 2: Normalization & Schema Validation
  records.forEach((r, idx) => {
    r.flags = [];
    r.reasons = [];
    let risk = 0;

    // Normalization
    r.name = r.name?.trim() || '';
    r.apaarId = r.apaarId?.trim().replace(/\s+/g, '') || '';
    r.dob = r.dob?.trim() || '';
    r.email = r.email?.trim() || '';

    // Required Fields Check
    if (!r.apaarId || !r.name || !r.dob || !r.institutionName || !r.email) {
      r.flags.push('MISSING_REQUIRED_FIELDS');
      r.reasons.push('Record has blank mandatory fields (name, APAAR, DOB, or email).');
      r.suggestedFix = 'Provide all mandatory identity attributes.';
      risk += 25;
    }

    // Stage 3: APAAR Checksum & Format
    if (!/^\d{12}$/.test(r.apaarId)) {
      r.flags.push('INVALID_APAAR_FORMAT');
      r.reasons.push('APAAR ID must contain exactly 12 numeric digits.');
      r.suggestedFix = 'Ensure 12 numeric digits without hyphens or letters.';
      risk += 60;
    } else {
      const payload11 = r.apaarId.substring(0, 11);
      const expectedCheck = calculateLuhn(payload11);
      if (parseInt(r.apaarId[11], 10) !== expectedCheck) {
        r.flags.push('APAAR_CHECKSUM_FAILED');
        r.reasons.push(`12th check digit failed verification (expected ${expectedCheck}, got ${r.apaarId[11]}).`);
        r.suggestedFix = `Correct check digit to '${expectedCheck}'.`;
        risk += 65;
      }
    }

    // Age bounds check
    const birthYear = parseInt(r.dob.substring(0, 4) || '0', 10);
    const age = 2026 - birthYear;
    if (age < 16 || age > 35) {
      r.flags.push('AGE_OUT_OF_BOUNDS');
      r.reasons.push(`Student age (${age} years) is outside standard technical education range (16-35).`);
      r.suggestedFix = 'Verify date of birth against Aadhaar / 10th marksheet.';
      risk += 35;
    }

    // CGPA bounds check
    if (r.cgpa < 0.0 || r.cgpa > 10.0) {
      r.flags.push('CGPA_OUT_OF_RANGE');
      r.reasons.push(`Reported CGPA (${r.cgpa}) exceeds maximum scale of 10.0.`);
      r.suggestedFix = 'Normalize grading scale to 10.0 maximum.';
      risk += 40;
    }

    // Attendance anomaly check
    if (r.attendancePct !== undefined && r.attendancePct < 15.0) {
      r.flags.push('POTENTIAL_GHOST_ENROLMENT');
      r.reasons.push(`Critically low attendance (${r.attendancePct}%) matches ghost enrolment patterns.`);
      r.suggestedFix = 'Confirm physical attendance before claiming scholarship grant.';
      risk += 45;
    }

    // Duplicate APAAR Check
    if (r.apaarId && /^\d{12}$/.test(r.apaarId)) {
      if (seenApaar.has(r.apaarId)) {
        const firstIdx = seenApaar.get(r.apaarId)!;
        r.flags.push('EXACT_DUPLICATE_APAAR');
        r.reasons.push(`Duplicate APAAR ID already present in row #${firstIdx + 1}.`);
        r.suggestedFix = 'Each student must have a globally unique APAAR ID.';
        risk += 75;
      } else {
        seenApaar.set(r.apaarId, idx);
      }
    }

    // Prepare fuzzy index for deduplication
    const trigrams = getTrigrams(r.name);
    const existing = byDob.get(r.dob) || [];
    existing.push({ index: idx, trigrams, name: r.name });
    byDob.set(r.dob, existing);

    r.riskScore = Math.min(100, risk);
  });

  // Stage 4: Entity Resolution & Fuzzy Indic Deduplication
  records.forEach((r, idx) => {
    if (r.flags.includes('EXACT_DUPLICATE_APAAR')) return;
    const sameDobGroup = byDob.get(r.dob) || [];
    const rTrigrams = getTrigrams(r.name);

    for (const other of sameDobGroup) {
      if (other.index >= idx) break;
      const otherRec = records[other.index];
      if (otherRec.apaarId !== r.apaarId) {
        const similarity = jaccardSimilarity(rTrigrams, other.trigrams);
        if (similarity >= 0.6) {
          r.flags.push('FUZZY_IDENTITY_MATCH');
          r.reasons.push(
            `High phonetic/name similarity (${(similarity * 100).toFixed(0)}%) with student #${other.index + 1} (${other.name}) born on ${r.dob}.`
          );
          r.suggestedFix = 'Review for cross-institution duplicate identity or misspelling.';
          r.riskScore = Math.min(100, r.riskScore + 50);
          break;
        }
      }
    }
  });

  // Stage 5: Final Composite Scoring & Status Decisions
  records.forEach((r) => {
    if (r.riskScore >= 60) {
      r.status = 'REJECTED';
      rejected++;
    } else if (r.riskScore >= 20) {
      r.status = 'NEEDS_REVIEW';
      review++;
    } else {
      r.status = 'VERIFIED';
      verified++;
    }
  });

  return {
    records,
    summary: { total, verified, review, rejected },
  };
}

/**
 * SHA-256 WebCrypto Hash calculation for append-only audit trail
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Audit Ledger Manager
 */
export class AuditLedger {
  private events: AuditEvent[] = [];

  constructor(initialEvents: AuditEvent[] = []) {
    this.events = [...initialEvents];
  }

  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  async appendEvent(
    action: AuditEvent['action'],
    actorId: string,
    actorRole: AuditEvent['actorRole'],
    details: string,
    institutionId?: string
  ): Promise<AuditEvent> {
    const prevHash = this.events.length > 0 ? this.events[this.events.length - 1].hash : '0'.repeat(64);
    const timestamp = new Date().toISOString();
    const payload = `${timestamp}|${action}|${actorId}|${actorRole}|${details}|${prevHash}`;
    const hash = await sha256(payload);

    const event: AuditEvent = {
      index: this.events.length + 1,
      timestamp,
      action,
      actorId,
      actorRole,
      institutionId,
      details,
      payloadHash: await sha256(details),
      prevHash,
      hash,
    };

    this.events.push(event);
    return event;
  }

  async verifyIntegrity(): Promise<{ valid: boolean; brokenAtIndex?: number; reason?: string }> {
    let prev = '0'.repeat(64);
    for (let i = 0; i < this.events.length; i++) {
      const e = this.events[i];
      if (e.prevHash !== prev) {
        return {
          valid: false,
          brokenAtIndex: i + 1,
          reason: `Previous hash pointer mismatch at event #${i + 1}`,
        };
      }
      const recalculated = await sha256(
        `${e.timestamp}|${e.action}|${e.actorId}|${e.actorRole}|${e.details}|${e.prevHash}`
      );
      if (recalculated !== e.hash) {
        return {
          valid: false,
          brokenAtIndex: i + 1,
          reason: `Cryptographic SHA-256 payload tampering detected at event #${i + 1}`,
        };
      }
      prev = e.hash;
    }
    return { valid: true };
  }

  tamperEvent(index: number, newDetail: string): void {
    if (this.events[index]) {
      this.events[index].details = newDetail;
    }
  }
}
