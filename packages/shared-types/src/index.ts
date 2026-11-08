/**
 * APAAR-Verify Shared TypeScript Types & Contracts
 */

export type UserRole =
  | 'institution'
  | 'aicte'
  | 'auditor'
  | 'student'
  | 'verifier'
  | 'superadmin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string;
  institutionName?: string;
  apaarId?: string; // For student role
  verified: boolean;
  avatarUrl?: string;
}

export type VerificationStatus = 'VERIFIED' | 'NEEDS_REVIEW' | 'REJECTED';

export interface StudentRecord {
  id: string;
  apaarId: string;
  name: string;
  dob: string; // YYYY-MM-DD
  gender: 'Male' | 'Female' | 'Other';
  category?: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  institutionId: string;
  institutionName: string;
  programme: string; // e.g., B.Tech CSE
  academicYear: number; // e.g., 2024
  cgpa: number;
  creditsEarned?: number;
  email: string;
  phone?: string;
  attendancePct?: number;
  status: VerificationStatus;
  riskScore: number; // 0-100
  flags: string[];
  reasons: string[];
  suggestedFix?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationExplanation {
  stage: 'schema' | 'apaar_registry' | 'entity_resolution' | 'anomaly_detection' | 'final_decision';
  status: 'passed' | 'warning' | 'failed';
  scoreImpact: number;
  ruleTitle: string;
  detail: string;
  timestamp: string;
}

export interface DetailedVerificationResult {
  recordId: string;
  apaarId: string;
  status: VerificationStatus;
  riskScore: number;
  flags: string[];
  explanations: VerificationExplanation[];
  duplicateClusterId?: string;
  anomalyScore?: number;
}

export interface DuplicateCluster {
  clusterId: string;
  records: Array<{
    recordId: string;
    apaarId: string;
    name: string;
    dob: string;
    institution: string;
  }>;
  matchType: 'exact_apaar' | 'fuzzy_indic_name' | 'embedding_similarity';
  confidence: number; // 0.0 - 1.0
  evidence: string;
}

export interface AnomalyExplanation {
  feature: string;
  observedValue: number | string;
  expectedRange: string;
  shapScore: number;
  narrative: string;
}

export interface AuditEvent {
  index: number;
  timestamp: string;
  action: 'INGEST' | 'SCHEMA_CHECK' | 'REGISTRY_VERIFY' | 'DEDUPE' | 'ANOMALY_RUN' | 'DECISION' | 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'RECORD_ACCESSED';
  actorId: string;
  actorRole: UserRole;
  institutionId?: string;
  recordId?: string;
  details: string;
  payloadHash: string;
  prevHash: string;
  hash: string;
}

export interface ConsentGrant {
  id: string;
  studentApaarId: string;
  verifierName: string;
  purpose: 'employment' | 'higher_education' | 'scholarship' | 'credit_transfer';
  permittedFields: Array<'name' | 'dob' | 'gender' | 'institution' | 'programme' | 'cgpa' | 'credits'>;
  expiresAt: string;
  createdAt: string;
  revoked: boolean;
  accessToken: string;
}

export interface AlertNotification {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  institutionId?: string;
  institutionName?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface RAGCitation {
  title: string;
  source: string;
  date?: string;
  relevanceScore: number;
  excerpt: string;
}

export interface RAGAnswer {
  query: string;
  detectedLanguage: string;
  answer: string;
  citations: RAGCitation[];
  grounded: boolean;
}

export interface InstitutionMetrics {
  id: string;
  name: string;
  state: string;
  district: string;
  sanctionedIntake: number;
  totalEnrolled: number;
  verifiedCount: number;
  reviewCount: number;
  rejectedCount: number;
  qualityScore: number; // 0 - 100
  lastUploadAt: string;
  isFlaggedForInspection: boolean;
}

/**
 * Adapter Interface for APAAR Registry (Simulated behind interface per Hard Rule 2)
 */
export interface ApaarRegistryRecord {
  apaarId: string;
  fullName: string;
  dob: string;
  gender: string;
  registeredInstitutionId: string;
  isActive: boolean;
}

export interface ApaarRegistryAdapter {
  lookup(apaarId: string): Promise<ApaarRegistryRecord | null>;
  verifyCheckDigit(apaarId: string): boolean;
}

export interface DigiLockerAdapter {
  fetchIssuedDocument(docType: string, token: string): Promise<{ docId: string; status: string; content: unknown }>;
}

export interface AadhaarAuthAdapter {
  authenticateOtp(maskedAadhaar: string, otp: string): Promise<{ success: boolean; txnId: string }>;
}
