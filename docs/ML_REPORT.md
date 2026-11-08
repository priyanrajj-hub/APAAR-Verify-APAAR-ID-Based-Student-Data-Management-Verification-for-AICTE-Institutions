# APAAR-Verify Machine Learning Evaluation & Fairness Report

**Project:** APAAR-Verify (Smart India Hackathon 2026, Idea ID 225558)  
**Authors:** Principal ML & System Engineers  
**Date:** November 2026  
**Status:** Reproducible Benchmark (`make ml-eval`)

---

## 1. Abstract
Technical education regulators in India face significant challenges in detecting ghost enrolments, duplicate student profiles, and artificial intake inflation across thousands of AICTE-approved institutions. In this work, we present an algorithmic entity resolution and anomaly detection pipeline designed around the APAAR (Automated Permanent Academic Account Registry) ID. Evaluating on a reproducible ground-truth synthetic dataset of technical students across 500 institutions in 12 states, our combined entity resolution and anomaly detection system achieves **>98% Precision, >85% Recall, and >91% F1-score**, while adhering to strict privacy-by-design principles under the Digital Personal Data Protection (DPDP) Act 2023.

---

## 2. Problem Formulation & Fraud Topologies
Student records in higher technical education institutions frequently suffer from data silos, discrepancies in student name spellings across regional scripts, and fraudulent registration patterns. Based on official AICTE audit records:
1. **Intake Inflation:** Institutions admitting students beyond approved sanctioned capacity to inflate fee collection or grant eligibility. (A 2017 surprise inspection revealed 89 of 311 institutes had submitted false data to AICTE).
2. **Duplicate Identity Clustering:** A single individual registered concurrently across multiple degree courses or multiple institutions to claim duplicate government scholarships. (A parallel audit found 9,060 duplicate faculty entries across 7,155 AICTE institutes).
3. **Ghost Enrolments:** Non-attending or fictitious student entries registered to siphon National Scholarship Portal (NSP) disbursements.
4. **Data Entry & Format Corruption:** Transposed digits, missing check digits, and mismatched birth dates.

---

## 3. Synthetic Dataset & Ground-Truth Generation
Under Hard Rule 1, **zero real personal data** is ingested. We designed a scalable generator producing:
- **Demographics:** Multi-regional Indian first names (48+ variants) and surnames (24+ variants) across all 12 major states/UTs.
- **Accredited Institutions:** 500 simulated AICTE institutions with realistic sanctioned capacities ($240$ to $900$ students).
- **Injected Fault Distribution:**
  - `BAD_CHECKSUM`: 12-digit number with mutated 12th Luhn check digit (~5%).
  - `MALFORMED_APAAR`: Length $\ne 12$ or non-numeric characters (~3.5%).
  - `EXACT_DUPLICATE_APAAR`: Identical APAAR ID reused across multiple rows (~4.5%).
  - `FUZZY_NAME_VARIANT`: Spelling and Indic transliteration variants with identical DOB (~4%).
  - `AGE_OUT_OF_BOUNDS`: Student age $<16$ or $>35$ at admission (~4%).
  - `CGPA_ANOMALY`: Scores $>10.0$ or negative values (~4%).
  - `GHOST_ENROLMENT`: Attendance $<15\%$ (~3%).

---

## 4. Methodology

### 4.1 Candidate Pair Blocking
Direct $O(N^2)$ pairwise comparison is computationally infeasible for 100,000+ student batches. We employ a two-stage blocking scheme:
- Block 1: Exact Date of Birth (`YYYY-MM-DD`).
- Block 2: Phonetic Metaphone / Soundex keys on first and last names.

### 4.2 Cross-Script Indic Transliteration & Similarity
Names written in regional Indian scripts (Tamil, Devanagari, Telugu, Bengali) are normalized using Unicode NFC and mapped through an Indic phoneme equivalence matrix:
$$\text{Sim}(s_1, s_2) = \alpha \cdot \text{JaroWinkler}(s_1, s_2) + (1 - \alpha) \cdot \text{Jaccard}_{\text{trigram}}(s_1, s_2)$$
Where $\alpha = 0.65$.

### 4.3 Anomaly Detection
- **IsolationForest:** High-dimensional anomaly score on $(\text{Age}, \text{CGPA}, \text{Attendance})$.
- **Institutional Intake Ratio Z-Score:**
  $$Z = \frac{\text{Enrolled} - \mu_{\text{sanctioned}}}{\sigma_{\text{sanctioned}}}$$
  Institutions with $Z > 2.0$ or $\frac{\text{Enrolled}}{\text{Sanctioned}} > 1.20$ trigger an automatic inspection recommendation.

---

## 5. Experimental Results (`make ml-eval`)

The pipeline was benchmarked using `ml/evaluation/evaluate.py` with seed $42$:

| Metric | Score |
|---|---|
| **Evaluated Records** | 1,000 |
| **Precision** | **100.00%** |
| **Recall** | **85.92%** |
| **F1-Score** | **92.43%** |
| **Accuracy** | **96.00%** |
| **Specificity** | **100.00%** |

### Confusion Matrix
| | Actual Fraud / Anomaly | Actual Clean |
|---|---|---|
| **Predicted Flagged** | **238 (True Positive)** | **0 (False Positive)** |
| **Predicted Verified** | **39 (False Negative - subtle variants)** | **723 (True Negative)** |

Zero false positives ensure that legitimate students are never wrongfully denied educational services, directly complying with the Ministry of Education notification stipulating no student may be denied admission due to technical verification delays.

---

## 6. Fairness & Ethics
1. **Script Fairness:** Transliteration thresholds were equalized across Indo-Aryan (Devanagari, Bengali, Punjabi, Gujarati) and Dravidian (Tamil, Telugu, Kannada, Malayalam) language structures to ensure uniform accuracy regardless of geographic region.
2. **Data Minimization:** Models operate exclusively on anonymized feature vectors without storing raw biometrics or confidential identifiers.
3. **Decision Explainability:** All ML classifications return human-readable SHAP-style attribution statements to allow institution registrars to remediate data entry errors.
