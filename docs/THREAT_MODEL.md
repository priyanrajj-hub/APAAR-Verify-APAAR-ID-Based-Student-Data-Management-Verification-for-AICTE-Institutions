# APAAR-Verify Threat Model (STRIDE Methodology)

**Target System:** APAAR-Verify Platform (SIH 2026, Idea ID 225558)  
**Security Standard:** OWASP Application Security Verification Standard (ASVS) Level 2 & DPDP Act 2023  
**Analysis Framework:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

---

## 1. System Assets & Trust Boundaries
- **Trust Boundary 1:** Public Internet to Next.js Web Frontend & Public Verifier Portal.
- **Trust Boundary 2:** Frontend / External Clients to API Gateway (`api-gateway` port 8000).
- **Trust Boundary 3:** Internal Microservices Mesh (verify, match, anomaly, rag, audit).
- **Trust Boundary 4:** Persistent Storage (Firestore database, Redis queue, Qdrant vector store).

---

## 2. STRIDE Threat Vector Analysis & Mitigations

### 2.1 Spoofing (Identity Deception)
- **Threat Vector S1:** An unauthorized actor creates a fake account claiming to be an AICTE National Officer or an Institution Registrar.
  - *Mitigation:* Firebase Authentication custom claims (`role`, `institutionId`) cryptographically signed in JWT tokens, validated at the API Gateway reverse proxy and Firestore security rules.
- **Threat Vector S2:** An employer presents a counterfeit or forged student consent token to query academic grades.
  - *Mitigation:* Tokens follow high-entropy structured signatures (`APAAR-TOKEN-[VERIFIER]-[RANDOM]`), matched against active, unexpired, and unrevoked records in the student's consent ledger.

### 2.2 Tampering (Data Modification)
- **Threat Vector T1:** A compromised database administrator or malicious actor alters a student's verification status from `REJECTED` to `VERIFIED`.
  - *Mitigation:* Cryptographic append-only hash chains ($H_i = \text{SHA-256}(T_i \parallel A_i \parallel D_i \parallel H_{i-1})$). Any retroactive mutation alters the event hash, immediately breaking all downstream block pointers and alerting the `/audit/verify` integrity checker.
- **Threat Vector T2:** Man-in-the-Middle (MitM) modification of student CSV uploads in transit.
  - *Mitigation:* TLS 1.3 encryption across all public ingress endpoints; client-side payload hashing prior to transmission.

### 2.3 Repudiation (Denying Actions)
- **Threat Vector R1:** An institution registrar denies uploading fraudulent student enrolment rosters during an AICTE audit.
  - *Mitigation:* Every upload generates a digitally signed audit ledger entry recording the actor ID, IP address, timestamp, raw payload SHA-256 hash, and institutional code.
- **Threat Vector R2:** An employer denies accessing a student's academic transcript.
  - *Mitigation:* The student's private consent ledger records an immutable access event upon every token presentation.

### 2.4 Information Disclosure (Privacy Breaches)
- **Threat Vector I1:** Scraping or mass harvesting of student names and APAAR IDs by external crawlers.
  - *Mitigation:* Strict role-based PII masking. Public verifiers and AICTE officers observe masked names (`A*** S***`) and masked APAARs (`9876••••••••`). Full records are accessible only by the verified enrolled student or their accredited registrar.
- **Threat Vector I2:** Data leakage via AI Assistant prompt injection.
  - *Mitigation:* Strict RAG guardrail filters rejecting adversarial extraction queries (`dump database`, `leak student PII`).

### 2.5 Denial of Service (Availability Disruption)
- **Threat Vector D1:** Flooding the bulk upload endpoint with 1,000,000+ malformed CSV rows to exhaust server memory.
  - *Mitigation:* Streaming multi-part chunk parsers, request payload size limits (max 25MB), rate-limiting middleware, and asynchronous background processing via Redis Streams.
- **Threat Vector D2:** High-frequency automated queries on the public verifier portal.
  - *Mitigation:* Token bucket rate limiting (10 requests/min per IP address) and reCAPTCHA challenge integration.

### 2.6 Elevation of Privilege
- **Threat Vector E1:** A student account mutates request headers to gain registrar or superadmin administrative permissions.
  - *Mitigation:* Server-side authorization checks. Role claims are verified using server-side public keys, and Firestore security rules strictly reject requests where `request.auth.token.role != required_role`.

---

## 3. Summary Assessment
Through defense-in-depth architecture, cryptographic hash chaining, and role-based data minimization, APAAR-Verify achieves robust protection against unauthorized credential manipulation, systemic fraud, and data leakage.
