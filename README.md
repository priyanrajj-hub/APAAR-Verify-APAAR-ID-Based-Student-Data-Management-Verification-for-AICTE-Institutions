# APAAR-Verify (Smart India Hackathon 2026, Idea ID 225558)

> **One Nation, One Student ID Verification & AICTE Institutional Governance Platform**  
> *Aligned with the National Education Policy (NEP 2020) and the Digital Personal Data Protection (DPDP) Act 2023.*

[![APAAR-Verify CI](https://github.com/priyanrajj-hub/APAAR-Verify-APAAR-ID-Based-Student-Data-Management-Verification-for-AICTE-Institutions/actions/workflows/ci.yml/badge.svg)](https://github.com/priyanrajj-hub/APAAR-Verify-APAAR-ID-Based-Student-Data-Management-Verification-for-AICTE-Institutions/actions/workflows/ci.yml)
[![12 Indian Languages](https://img.shields.io/badge/i18n-12%20Indian%20Languages%20%2B%20RTL-blue.svg)](#)
[![Tests Passing](https://img.shields.io/badge/Tests-Passing%20(14%20Pytest%20%2B%20Node)-brightgreen.svg)](#)
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
    subgraph Client["Next.js 15 Web Client (Vercel Ready - Browser Engine)"]
        UI["Accessible UI & Design System"]
        I18N["12-Locale i18n Engine (with RTL)"]
        AUTH["Role Claims & Demo Persona Switcher"]
        FALLBACK["In-Browser Engine (WebCrypto SHA-256 + Luhn)"]
    end

    subgraph Gateway["API Gateway (FastAPI / Port 8000)"]
        PROXY["Reverse Proxy & Rate Limiter"]
        JWT["Custom Claims & Audit Logger"]
    end

    subgraph Services["Microservices Mesh (Python 3.12)"]
        INGEST["ingest-svc: CSV/XLSX Parser & Normalizer (8001)"]
        VERIFY["verify-svc: Schema Rules & Checksum Engine (8002)"]
        MATCH["match-svc: Indic Transliteration Deduplication (8003)"]
        ANOMALY["anomaly-svc: IsolationForest & Z-Score ML (8004)"]
        RAG["rag-svc: Multilingual Policy Assistant (8005)"]
        AUDIT["audit-svc: Cryptographic Hash-Chain Ledger (8006)"]
        NOTIFY["notify-svc: Surveillance Alert Feed (8007)"]
    end

    subgraph Data["Data & Infrastructure"]
        FS["Firebase Firestore / Emulators"]
        REDIS["Redis Streams Job Queue"]
        QDRANT["Qdrant Vector Database"]
    end

    Client -->|HTTP / REST| Gateway
    Gateway --> Services
    Services --> Data
```

### Service Execution & Implementation Status
To ensure transparency regarding what runs locally vs. in containers vs. in the browser:

| Service / Component | Implementation Location | Execution Mode | Status |
|---|---|---|---|
| **Web Client Engine (`apps/web`)** | `apps/web/src/lib/` | **Browser-Side / Vercel** | **Fully Functional:** Self-contained client engine; runs Stages 1–8 in-browser (WebCrypto SHA-256 hash chains, Luhn check, trigram duplicate detection, TF-IDF RAG) with zero backend dependency for instant Vercel evaluation. |
| **Verification Service (`verify-svc`)** | `services/verify/main.py` | **Python 3.12 / FastAPI (Port 8002)** | **Live Service:** Schema validation, Luhn check-digit verification, and SHA-256 hash-chain append endpoint. Tested with pytest. |
| **Matching & Entity Resolution (`match-svc`)** | `services/match/main.py` | **Python 3.12 / FastAPI (Port 8003)** | **Live Service:** Phonetic blocking, cross-script Indic transliteration normalization, and duplicate cluster resolution. Tested with pytest. |
| **Anomaly Detection (`anomaly-svc`)** | `services/anomaly/main.py` | **Python 3.12 / FastAPI (Port 8004)** | **Live Service:** Statistical outlier scoring and sanctioned intake ratio analysis ($>120\%$ capacity). Tested with pytest. |
| **Policy Assistant (`rag-svc`)** | `services/rag/main.py` | **Python 3.12 / FastAPI (Port 8005)** | **Live Service:** Multilingual semantic retrieval over official AICTE/NEP policy corpus with citations and prompt-injection guardrails. Tested with pytest. |
| **API Gateway (`api-gateway`)** | Docker / Compose | **Reverse Proxy / Routing** | Configured in `docker-compose.yml` and Kubernetes to route incoming traffic to services. |
| **Ingestion Worker (`ingest-svc`)** | Docker / Compose | **Async Job Worker** | Streaming multi-part upload handler definition for high-volume background queueing via Redis. |
| **Audit Service (`audit-svc`)** | `services/verify/main.py` | **Integrated Microservice** | Implemented directly inside `verify-svc` (and mirrored client-side) to provide atomic append-only hash chains. |
| **Notification Service (`notify-svc`)** | `apps/web/src/components/` | **Simulated In-App Feed** | In-app regulatory alert feed highlighting high-risk and flagged institutions. |

---

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
