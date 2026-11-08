# APAAR-Verify Microservices & REST API Specification

**Base URL:** `http://localhost:8000` (Local) / `https://api.apaar-verify.gov.in` (Production)  
**Authentication:** Bearer JWT in `Authorization` header containing Firebase Auth custom claims (`role`, `institutionId`, `apaarId`).

---

## 1. Microservices Architecture & Port Mapping
| Service | Container Port | Primary Endpoint Prefix | Responsibility |
|---|---|---|---|
| `api-gateway` | 8000 | `/api/v1/*` | Reverse proxy, JWT validation, rate limiting |
| `ingest-svc` | 8001 | `/ingest/*` | Multi-part CSV/XLSX streaming parser & normalizer |
| `verify-svc` | 8002 | `/verify/*` | Great Expectations rules, Luhn check, registry adapter |
| `match-svc` | 8003 | `/match/*` | Phonetic deduplication, Indic transliteration clustering |
| `anomaly-svc` | 8004 | `/anomaly/*` | IsolationForest & intake ratio outlier detection |
| `rag-svc` | 8005 | `/rag/*` | Multilingual policy assistant with citations |
| `audit-svc` | 8006 | `/audit/*` | Cryptographic SHA-256 append-only hash chaining |
| `notify-svc` | 8007 | `/notify/*` | Real-time surveillance alert dispatcher |

---

## 2. API Endpoints Specification

### 2.1 Verification Service (`verify-svc`)

#### `POST /verify/record`
Verifies a single student record against schema rules and the APAAR registry mock.

**Request Body:**
```json
{
  "record": {
    "apaar_id": "987654321015",
    "name": "Aarav Sharma",
    "dob": "2003-04-12",
    "gender": "Male",
    "institution_id": "INST_DEMO_001",
    "institution_name": "Demo Institute of Technology",
    "programme": "B.Tech CSE",
    "academic_year": 2023,
    "cgpa": 8.94,
    "email": "aarav@dit.example.edu"
  },
  "actor_id": "registrar_01",
  "actor_role": "institution"
}
```

**Response (`200 OK`):**
```json
{
  "apaar_id": "987654321015",
  "status": "VERIFIED",
  "risk_score": 0.0,
  "flags": [],
  "reasons": [],
  "suggested_fix": null,
  "audit_hash": "a7c9f821d394b8e219fb0a24700c3e24704b58ec3949790aa83f619284ba921e",
  "processing_time_ms": 4.2
}
```

---

### 2.2 Entity Resolution Service (`match-svc`)

#### `POST /match/resolve`
Identifies exact and fuzzy duplicate student clusters across candidate records.

**Request Body:**
```json
{
  "records": [
    {
      "id": "REC_01",
      "apaar_id": "987654321015",
      "name": "Karthik Raman",
      "dob": "2002-09-18",
      "institution_id": "INST_01",
      "institution_name": "College A"
    },
    {
      "id": "REC_02",
      "apaar_id": "891234567018",
      "name": "கார்த்திக் Raman",
      "dob": "2002-09-18",
      "institution_id": "INST_02",
      "institution_name": "College B"
    }
  ],
  "similarity_threshold": 0.80
}
```

**Response (`200 OK`):**
```json
{
  "total_records_analyzed": 2,
  "clusters_found": 1,
  "clusters": [
    {
      "cluster_id": "CLUSTER_FUZZY_0001",
      "records": [
        { "id": "REC_01", "name": "Karthik Raman" },
        { "id": "REC_02", "name": "கார்த்திக் Raman" }
      ],
      "match_type": "fuzzy_indic_name",
      "confidence": 0.92,
      "evidence": "Cross-script Indic transliteration match (92.0%) with identical DOB 2002-09-18."
    }
  ]
}
```

---

### 2.3 Anomaly Detection Service (`anomaly-svc`)

#### `POST /anomaly/evaluate`
Runs statistical outlier checks on institutional cohorts and student trajectories.

**Request Body:**
```json
{
  "record_id": "REC_0003",
  "age_at_admission": 14.5,
  "cgpa": 8.2,
  "attendance_pct": 88.0,
  "institutional_enrolment": 495,
  "institutional_sanctioned_intake": 360
}
```

**Response (`200 OK`):**
```json
{
  "record_id": "REC_0003",
  "anomaly_score": 80.0,
  "is_anomaly": true,
  "attributions": [
    {
      "feature_name": "age_at_admission",
      "observed_value": 14.5,
      "baseline_expected": "17 - 24 years",
      "anomaly_contribution": 80.0,
      "narrative": "Underage admission: student is only 14.5 years old at enrollment."
    },
    {
      "feature_name": "intake_vs_sanctioned",
      "observed_value": "1.38x capacity",
      "baseline_expected": "<= 1.00x approved AICTE intake",
      "anomaly_contribution": 60.0,
      "narrative": "Sanctioned intake exceeded: enrolled 495 vs approved 360 (1.4x)."
    }
  ]
}
```

---

### 2.4 Multilingual Policy RAG Service (`rag-svc`)

#### `POST /rag/query`
Queries the policy knowledge base with prompt-injection guardrails and multi-script citations.

**Request Body:**
```json
{
  "query": "Is student consent mandatory under the DPDP Act 2023?",
  "target_locale": "en"
}
```

**Response (`200 OK`):**
```json
{
  "query": "Is student consent mandatory under the DPDP Act 2023?",
  "detected_locale": "en",
  "answer": "Under the Digital Personal Data Protection (DPDP) Act 2023, access to personal student academic records is strictly consent-driven and role-based. Students under 18 require parental or legal guardian consent.",
  "citations": [
    {
      "title": "DPDP Act 2023 Student Consent Framework",
      "source": "DPDP Act 2023 / Drishti IAS (2024)",
      "relevance_score": 0.95,
      "excerpt": "Under the DPDP Act 2023, access to personal student academic records is strictly consent-driven..."
    }
  ],
  "grounded": true
}
```

---

### 2.5 Cryptographic Audit Service (`audit-svc`)

#### `GET /verify/audit`
Cryptographically re-walks the append-only SHA-256 hash chain and validates block integrity.

**Response (`200 OK`):**
```json
{
  "valid": true,
  "total_events": 402,
  "head_hash": "9b12a84ef8192a0172834b9281a04781290bbfa7129038419203810294102938"
}
```
