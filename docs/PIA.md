# Privacy Impact Assessment (PIA) - DPDP Act 2023 Compliance

**Platform:** APAAR-Verify (Smart India Hackathon 2026, Idea ID 225558)  
**Governing Statute:** Digital Personal Data Protection (DPDP) Act 2023, Section 4-10  
**Data Fiduciary:** All India Council for Technical Education (AICTE) & Enrolling Higher Education Institutions  
**Data Principals:** Students enrolled in AICTE-approved technical institutions

---

## 1. Context & Scope
The DPDP Act 2023 establishes statutory mandates for processing digital personal data. Given historical concerns over Aadhaar and educational data breaches, APAAR-Verify adheres to privacy-by-design from the architectural foundation. Under Hard Rule 1, this prototype uses **100% synthetic, non-real personal data**.

---

## 2. Seven Core DPDP Principles & Implementation

### 2.1 Consent-Driven Processing (Section 6)
- **Granular Consent:** Students select specifically which fields third parties may view (`CGPA`, `Programme`, `Institution`, while withholding `DOB` or personal emails).
- **Time-Bound Tokens:** Consent grants default to 30 days and automatically expire unless renewed.
- **Revocability:** Students can revoke an issued access token with a single click, instantly invalidating third-party access.
- **Minor Protections:** For students under 18 years of age at admission, verified parental/guardian consent is flagged as legally required before profile publication.

### 2.2 Purpose Limitation (Section 4)
Student data collected for academic record management and AICTE approval renewal is strictly partitioned:
- It may NOT be utilized for commercial marketing, targeted advertising, or unauthorized data broker syndication.
- Third-party verifiers are restricted strictly to verifying consented academic credentials for hiring or higher education admissions.

### 2.3 Data Minimization (Section 4.2)
- Regulators (AICTE Officers) view aggregated institution-level metrics and masked student PII (`A*** S***`, `9876••••••••`). Full raw records are never displayed by default.
- No biometric data (fingerprints, iris scans) is stored by the platform; verification relies on federated tokens.

### 2.4 Data Quality & Accuracy (Section 8.3)
- The 5-stage verification pipeline flags format errors, transposed digits, and misspellings immediately, returning plain-language fix suggestions to the institution registrar to ensure student records are accurate prior to final sealing.

### 2.5 Storage Limitation & Retention Policy (Section 8.7)
- Raw batch upload files (CSV/XLSX) in staging storage are deleted after 90 days.
- Derived verification results and hash-chain audit proofs are retained for the statutory accreditation lifecycle (5 years).

### 2.6 Rights of Data Principals (Sections 11 - 14)
1. **Right to Access Information:** Students can log in to view their complete verified profile, active consent tokens, and the access log of all entities that inspected their credentials.
2. **Right to Correction & Erasure:** Institutions and students can file rectification requests for misrecorded CGPA or academic milestones.
3. **Right to Grievance Redressal:** An embedded policy assistant and contact workflow route disputes to the institutional Data Protection Officer (DPO).

---

## 3. Data Breach Incident Response Runbook
In the event of a suspected security anomaly:
1. **Containment (T+1 hour):** Automated revocation of compromised service account tokens and isolation of affected containers.
2. **Forensic Audit (T+4 hours):** Re-walking the append-only cryptographic hash chain via `/audit/verify` to pinpoint the exact block and timestamp of the anomaly.
3. **Regulatory Notification (T+6 hours):** Submission of mandatory breach report to CERT-In and the Data Protection Board of India (DPBI) as prescribed by law.
4. **Data Principal Notification:** In-app notification to affected students specifying the nature of the breach and remediation actions taken.
