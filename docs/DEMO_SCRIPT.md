# APAAR-Verify 3-Minute Live Demonstration Script

**Event:** Smart India Hackathon 2026 (Idea ID 225558)  
**Target Duration:** Exactly 3 Minutes (180 Seconds)  
**Evaluator Personas:** Technical Jury, MoE / AICTE Officials, Industry Experts

---

### [0:00 - 0:30] Introduction & The Problem in Numbers
- **Presenter:** "Respected Jury members, in India's technical education ecosystem, over 26 crore APAAR IDs have been issued under NEP 2020. However, data between technical institutions remains siloed and vulnerable. In surprise government inspections, 89 out of 311 institutes were found to have submitted fabricated data for AICTE approval, and over 9,000 duplicate faculty and student records were detected across 8 states.
- **Action on Screen:** *Show Overview tab. Point to the verified stat cards: 26.35 Cr APAARs, 1 in 3 false data rate, and 9,060 duplicate entries.*
- **Key Message:** "We built APAAR-Verify: a production-shaped, privacy-preserving platform that ties every student record to their 12-digit APAAR ID with AI-driven entity resolution and cryptographic hash chaining."

---

### [0:30 - 1:15] Bulk Ingestion & 5-Stage Verification Pipeline
- **Presenter:** "Let's demonstrate institutional data onboarding. An institution registrar uploads thousands of enrolment rows via CSV or Excel."
- **Action on Screen:** *Switch to 'Data Ingestion' tab. Click 'Generate & Run 400 Records'. Show the animated progress bar running through Normalization, Schema Rules, Luhn Checksum, Deduplication, and Scoring.*
- **Presenter:** "Instantly, 400 records are analyzed through our 5-stage pipeline. In the Results Table, every single decision is transparently explained. Look at row #3: it caught a check-digit mutation and calculated the correct 12th digit. In row #12, an underage student was flagged. The registrar can download a plain-language error remediation report with a single click."
- **Action on Screen:** *Filter by 'Rejected Only'. Point to the suggested fix: 'Recalculate check digit'. Toggle view from 'Institution' to 'AICTE (Masked)' to demonstrate dynamic PII masking.*

---

### [1:15 - 1:50] AI Entity Resolution & AICTE Surveillance Dashboard
- **Presenter:** "Beyond simple format checks, how do we catch sophisticated fraud? Let's switch to 'Entity Resolution & ML'."
- **Action on Screen:** *Click 'Entity Resolution & ML' tab. Highlight the 92.4% F1-score and Confusion Matrix.*
- **Presenter:** "Our model achieves 100% precision with zero false positives. Notice our graph-based cluster viewer: it automatically resolves cross-script Indic transliterations, linking 'கார்த்திக் Raman' in Tamil script with 'Karthik Raman' in Latin script born on the exact same date across different universities."
- **Action on Screen:** *Click 'AICTE Dashboard' tab.*
- **Presenter:** "AICTE officers get a national surveillance radar. Look at Pune Polytechnic: their enrolment is at 137% of sanctioned capacity, automatically triggering an on-site regulatory inspection alert before approval renewal."

---

### [1:50 - 2:30] DPDP Consent Ledger & Public Verifier Portal
- **Presenter:** "Under the DPDP Act 2023, privacy by design is paramount. Let's switch personas to a student: Aarav Sharma."
- **Action on Screen:** *Use top-right Quick Persona Switcher to select 'Student'. Open 'Consent Ledger' tab.*
- **Presenter:** "Students hold sovereign control over their records. Aarav can generate a time-bound, cryptographically signed token for TCS Campus Hiring, selecting only Name and CGPA while withholding his DOB."
- **Action on Screen:** *Switch to 'Public Verifier' tab. Submit APAAR `987654321018` with token `APAAR-TOKEN-TCS-78921`.*
- **Presenter:** "The employer immediately receives an official, digitally signed verification certificate with a verifiable QR code, seeing only the consented fields."

---

### [2:30 - 3:00] Cryptographic Hash Chain & Multilingual Voice Assistant
- **Presenter:** "Every verification step is permanently anchored in an append-only SHA-256 hash chain."
- **Action on Screen:** *Click 'Audit Chain' tab. Click 'Simulate Malicious Tampering'.*
- **Presenter:** "If a rogue actor maliciously tampers with a record in the database, our cryptographic audit validator instantly detects the break in the chain. Finally, our NEP 2020 Policy Assistant answers queries in all 12 Indian languages with voice input and read-aloud support."
- **Action on Screen:** *Click 'Policy Assistant' tab. Click 'अपार चेक अंक कैसे काम करता है?' or sample chip. Point to the verified citations.*
- **Conclusion:** "APAAR-Verify is ready for nationwide deployment—one command to run locally, fully containerized on Kubernetes, and live on Vercel with zero downtime. Thank you!"
