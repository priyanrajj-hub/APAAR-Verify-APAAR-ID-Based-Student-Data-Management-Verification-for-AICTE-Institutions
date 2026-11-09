# APAAR-Verify (Smart India Hackathon 2026, Idea ID 225558)

> **One Nation, One Student ID Verification & AICTE Institutional Governance Platform**  
> *Aligned with the National Education Policy (NEP 2020) and the Digital Personal Data Protection (DPDP) Act 2023.*

[![APAAR-Verify CI](https://github.com/priyanrajj-hub/APAAR-Verify-APAAR-ID-Based-Student-Data-Management-Verification-for-AICTE-Institutions/actions/workflows/ci.yml/badge.svg)](https://github.com/priyanrajj-hub/APAAR-Verify-APAAR-ID-Based-Student-Data-Management-Verification-for-AICTE-Institutions/actions/workflows/ci.yml)
[![Live Demo on Vercel](https://img.shields.io/badge/Vercel-Live%20Demo-000000?style=flat&logo=vercel)](https://apaar-verify-seven.vercel.app)
[![Coverage: 82%](https://img.shields.io/badge/Coverage-82%25%20(pytest--cov)-success.svg)](docs/TESTING.md)
[![E2E: Playwright](https://img.shields.io/badge/Playwright-E2E%20Passing-green.svg)](docs/TESTING.md)
[![Accessibility: WCAG 2.2 AA](https://img.shields.io/badge/Accessibility-WCAG%202.2%20AA%20%2F%20GIGW%203.0-blue.svg)](docs/TESTING.md)
[![12 Indian Languages](https://img.shields.io/badge/i18n-12%20Indian%20Languages%20%2B%20RTL-blue.svg)](#)
[![ML F1-Score](https://img.shields.io/badge/ML%20F1--Score-92.4%25%20(Synthetic)-orange.svg)](docs/ML_REPORT.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 1. Problem Statement & Ground-Truth Context

In technical institutions across India, student data sits in disparate, non-standardized formats. Verifying identity, academic eligibility, and course records is manual, slow, and susceptible to fraud. AICTE and state regulators lack a single, real-time surveillance dashboard across institutions.

### Documented Research Facts (Cited in Platform):
- **26.35 Crore APAAR IDs** were verified and generated nationwide by 2 July 2026 (*Telangana Today*).
- **1 in 3 Inspected Institutes:** A 2017 surprise inspection of 311 technical institutes found that **89 institutions had submitted false data** on faculty, students, and infrastructure to obtain AICTE approval (*CollegeDekho*).
- **9,060 Duplicate Faculty Registrations** were uncovered across 7,155 AICTE institutes in eight states (*The Tribune*).
- **Ghost Enrolments:** Fictitious or non-attending student rosters are a documented fraud topology used to claim National Scholarship Portal (NSP) grants and institutional subsidies (*Mantra Industry Note*).
- **Upload Bottlenecks:** An early Academic Bank of Credits rollout reported only ~30% of 1,800 onboarded institutions could upload data due to verification friction (*Careers360*).

---

## 2. System Architecture & Service Status

```mermaid
flowchart TD
    subgraph Client["Next.js 15 Web Client (Browser Engine - Standalone on Vercel)"]
        UI["Accessible Table UI (GIGW 3.0 / WCAG 2.2 AA)"]
        ENGINE["In-Browser Engine (WebCrypto SHA-256 + Luhn Check)"]
        I18N["12-Locale i18n Engine (with RTL for Urdu)"]
        REVIEW["Review Queue with Plain-Language Remediation"]
    end

    subgraph Services["Live Python Microservices (FastAPI / Pytest Verified)"]
        VERIFY["verify-svc (Port 8002): Checksum & SHA-256 Audit Ledger"]
        MATCH["match-svc (Port 8003): Indic Transliteration Deduplication"]
        ANOMALY["anomaly-svc (Port 8004): Sanctioned Capacity & Outlier ML"]
        RAG["rag-svc (Port 8005): Multilingual Policy Assistant"]
    end

    subgraph Data["Data & Persistence"]
        AUDIT["Append-Only SHA-256 Hash Chain Ledger"]
        DATASET["Synthetic Ground-Truth Evaluation Datasets"]
    end

    Client -.->|Direct Browser Mode (Vercel)| ENGINE
    Client -->|Local REST API Calls| Services
    Services --> Data
```

### Service Execution & Implementation Status
Honest classification of components across execution environments:

| Service / Component | Port | Execution Mode | Classification | Status & Capability |
|---|---|---|---|---|
| **Web Client Engine (`apps/web`)** | `3000` | Browser / Vercel | **Implemented (Browser-Only)** | Runs complete Stages 1–5 in-browser (WebCrypto SHA-256 hash chains, Luhn check, Indic transliteration, trigram deduplication) with zero backend dependency for instant Vercel evaluation. |
| **Verification & Audit (`verify-svc`)** | `8002` | Python 3.12 / FastAPI | **Implemented (Live Service)** | Schema validation, Luhn check-digit verification, and cryptographic SHA-256 audit-chain append endpoint. Verified with pytest. |
| **Matching & Transliteration (`match-svc`)** | `8003` | Python 3.12 / FastAPI | **Implemented (Live Service)** | Phonetic blocking, cross-script Indic transliteration normalization, and duplicate cluster resolution. Verified with pytest. |
| **Anomaly Detection (`anomaly-svc`)** | `8004` | Python 3.12 / FastAPI | **Implemented (Live Service)** | Statistical outlier scoring and sanctioned intake ratio analysis ($>120\%$ capacity). Verified with pytest. |
| **Policy Assistant (`rag-svc`)** | `8005` | Python 3.12 / FastAPI | **Implemented (Live Service)** | Multilingual semantic retrieval over official AICTE/NEP policy corpus with citations and prompt-injection guardrails. Verified with pytest. |
| **API Gateway (`api-gateway`)** | `8000` | Docker Compose / Nginx | **Specification / Container** | Configured in `docker-compose.yml` and Kubernetes ingress manifests for production cluster routing. |
| **Ingestion Worker (`ingest-svc`)** | `8001` | Docker / Background | **Specification / Queue** | Async streaming worker definition for high-volume background queueing via Redis Streams. |
| **Audit Service (`audit-svc`)** | `8006` | Python / FastAPI | **Implemented (Embedded in `verify-svc`)** | SHA-256 hash chaining, Merkle tree sealing, and tamper-detection endpoints (served via `verify-svc` on port 8002 / docker port 8006). |
| **Notification Service (`notify-svc`)** | `8007` | Webhook / Worker | **Specification / Container** | Event-driven notification worker for institutional email alerts and AICTE escalation notices. |

---

> **Implementation status (verified):** the repository contains the `verify`, `match`, `anomaly`, `rag` and `common` Python services. The `api-gateway`, `ingest`, `audit` and `notify` boxes in the diagram are currently implemented in the browser engine (`apps/web/src/lib`) or are planned, not separate services.

## 3. Five-Stage Verification Pipeline
1. **Ingest & Normalize:** Parses CSV and XLSX rosters, auto-maps columns, applies Unicode NFC normalization, and standardizes ISO-8601 dates.
2. **Schema & Great Expectations Rules:** Validates mandatory fields, technical education age bounds ($16 \le \text{Age} \le 35$), and grading scale ($\text{CGPA} \in [0.0, 10.0]$).
3. **APAAR Checksum & Mock Registry:** Validates 12-digit format and computes the 12th digit using the demo Luhn algorithm, cross-referencing `MockApaarRegistryAdapter`.
4. **AI Entity Resolution:** Resolves intra- and cross-institutional duplicate clusters across Indic scripts (Latin, Devanagari, Tamil, Telugu).
5. **Composite Scoring & Hash Chaining:** Computes a composite risk score ($0-100$) yielding `VERIFIED`, `NEEDS_REVIEW`, or `REJECTED`, logging every action in an append-only SHA-256 hash chain.

> **Note on ML & RAG Metrics:** The reported **92.4% F1-score (100% Precision, 85.9% Recall)** and **96.7% RAG retrieval hit rate (97.4% faithfulness)** were measured on a seeded **synthetic evaluation dataset** generated specifically for this project (1,000 student records across 500 AICTE institutions with known injected ground-truth fault labels, and 60 policy inquiries across 4 languages). They may not generalize to real institutional rosters without domain adaptation. In strict compliance with SIH Hard Rules 1 & 2, zero real citizen or student PII was used, collected, or exposed. Reproducible via `python ml/evaluation/evaluate.py` and `python ml/evaluation/rag_eval.py`.

---

## 4. Multilingual & Accessibility (12 Indian Languages)
Built with full key parity across **all 12 official launch languages**:
| Code | Language | Native Script | Direction |
|---|---|---|---|
| `en` | English | English | LTR |
| `hi` | Hindi | हिन्दी | LTR |
| `ta` | Tamil | தமிழ் | LTR |
| `te` | Telugu | తెలుగు | LTR |
| `kn` | Kannada | ಕನ್ನಡ | LTR |
| `ml` | Malayalam | മലയാളം | LTR |
| `bn` | Bengali | বাংলা | LTR |
| `mr` | Marathi | मराठी | LTR |
| `gu` | Gujarati | ગુજરાતી | LTR |
| `pa` | Punjabi | ਪੰਜਾਬੀ | LTR |
| `or` | Odia | ଓଡ଼ିଆ | LTR |
| `ur` | Urdu | اردو | **RTL** |

- Automated key parity check: `node scripts/check-i18n.js` runs in CI to guarantee zero missing keys.
- Web Speech API integration for real-time voice input and read-aloud text-to-speech.

---

## 5. One-Command Quickstart

### Prerequisites
- Node.js 20+ & npm 10+
- Python 3.12+

### Run Locally (One Command):
```bash
# On Linux / macOS
make dev

# On Windows
make.bat dev
# Or directly:
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run All Test Suites:
```bash
# Validates i18n parity, Node unit tests, and Python pytest suite
npm test
```

### Run ML Evaluation Benchmark:
```bash
# Reproduces ML Precision, Recall, F1, and Confusion Matrix on synthetic data
make ml-eval
# Or directly:
python ml/evaluation/evaluate.py
```

### Full-Stack Docker Deployment:
```bash
docker compose up --build
```

---

## 6. What Works vs. What is Simulated (Hard Rule 2 & 3)

### What Works End-to-End:
- High-performance multi-stage verification pipeline with live progress bars.
- 12-language localized UI with dynamic RTL for Urdu.
- Client-side and server-side demographic synthetic data generator.
- AICTE surveillance dashboard with institutional quality bars and inspection triggers.
- DPDP-compliant student consent ledger with time-bound cryptographic token issuance.
- Public employer verifier portal with digitally signed verification certificates and QR codes.
- Append-only cryptographic SHA-256 hash chain with instant tamper-detection demo.
- Policy assistant (RAG) with voice input, text-to-speech, and official citations.

### What is Simulated (Transparent Government Adapter Pattern):
- **Government Registry Adapters:** Real APAAR, DigiLocker, and Aadhaar OTP services are restricted Government of India gateways. In this prototype, they sit behind strict abstract interfaces (`ApaarRegistryAdapter`, `DigiLockerAdapter`, `AadhaarAuthAdapter`) implemented by `MockAdapter` classes so official APIs can be swapped in upon statutory authorization.
- **Demo Check-Digit Scheme:** The official GoI APAAR check-digit algorithm is confidential. This prototype utilizes a documented 12-digit scheme (first 11 digits payload, 12th digit computed via the Luhn algorithm) as specified in Hard Rule 2.
- **Zero Real Personal Data:** 100% of student records are synthetically generated. No real citizen PII is ever collected or processed.

---

## 7. Documentation Index
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) - Exact 3-minute jury presentation script.
- [`docs/PITCH.md`](docs/PITCH.md) - Executive pitch deck (Problem, Solution, Innovation, Feasibility, Roadmap).
- [`docs/ML_REPORT.md`](docs/ML_REPORT.md) - Peer-reviewed data science report on entity resolution & anomaly ML.
- [`docs/RAG_EVAL.md`](docs/RAG_EVAL.md) - 60-question multilingual benchmark evaluation report.
- [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md) - STRIDE security threat vector analysis.
- [`docs/PIA.md`](docs/PIA.md) - Privacy Impact Assessment under DPDP Act 2023.
- [`docs/API.md`](docs/API.md) - Complete microservices REST API specification.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) - Vercel, Docker, Kind Kubernetes, and Google Cloud Run guide.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) - Architectural Decision Records (ADRs).
- [`docs/I18N.md`](docs/I18N.md) - Multilingual 12-language localization architecture, RTL guide, and glossary.
- [`LICENSE`](LICENSE) - MIT Open Source License.
