# APAAR-Verify Quality & Test Verification Report

This document records the automated verification suites covering **Playwright E2E browser tests**, **real code coverage metrics**, **ingestion edge cases**, and **WCAG 2.2 AA / GIGW 3.0 accessibility compliance**.

---

## 1. Test Suite Summary

| Suite Name | Framework | Target / Scope | Test Cases | Status |
|:---|:---|:---|:---:|:---:|
| **E2E Browser Hero Flow** | Playwright (Chromium/Edge) | UI clicks, Sample Ingestion, SHA-256 Tamper Simulation, Urdu RTL | 4 | **100% Passed** |
| **Python Services & ML** | Pytest 9.1 | FastAPI microservices, Luhn checks, adapters, RAG guards, ML lift | 18 | **100% Passed** |
| **Edge-Case Ingestion** | Node.js Test Harness | 0-byte files, binary null bytes, missing headers, 10k-row throughput | 7 | **100% Passed** |
| **Accessibility & RTL** | Node.js + AST / Regex | Contrast ratios, ARIA live regions, table scopes, Urdu Nastaliq RTL | 3 | **100% Passed** |
| **i18n Key Parity** | Node.js Script | Key symmetry across all 12 Indian official languages | 12 locales | **100% Passed** |

---

## 2. Real Code Coverage Report (`pytest-cov`)

Measured using `pytest --cov=services --cov=ml --cov-report=term-missing`:

```
Name                          Stmts   Miss  Cover   Missing
-----------------------------------------------------------
services\common\models.py        91      1    99%   60
services\match\main.py           76      3    96%   33, 73, 112
services\rag\main.py             45      2    96%   71, 99
services\common\adapters.py      50      2    96%   48, 87
services\verify\main.py          84     12    86%   67, 108-113, 117-119, 126, 159
services\anomaly\main.py         54     10    81%   44, 64-66, 76-78, 88-90
ml\evaluation\rag_eval.py        49     12    76%   135-188, 192-193
ml\evaluation\evaluate.py       135     64    53%   24-47, 52, 84-86, 89-96, 114-115, 126, 168-223, 227
-----------------------------------------------------------
TOTAL                           584    106    82%
```

**Overall Python Services & ML Coverage:** **82%**

---

## 3. Ingestion Edge-Case Validation Matrix

Tested in `apps/web/test/edge-cases.test.js`:

| Input Scenario | Failure Mode Tested | Expected Result | Actual Result |
|:---|:---|:---|:---|
| **0-byte empty file** | Empty upload submission | `Upload failed: File is completely empty (0 bytes).` | Passed (Rejected with user banner) |
| **Whitespace-only CSV** | Spaces, tabs, and newlines | `Upload failed: File contains 0 bytes of readable data.` | Passed (Rejected with user banner) |
| **Binary file renamed as `.csv`** | JPEG/EXE/PDF binary bytes | `Binary data detected: File appears to be a compiled binary.` | Passed (Detected null bytes, rejected) |
| **Corrupted text encoding** | Non-printable control characters | `Corrupted text encoding detected. Please use UTF-8.` | Passed (Rejected safely) |
| **Header-only CSV (0 data rows)** | Schema with no rows | `File contains only a header row or 0 data rows.` | Passed (Rejected with user banner) |
| **Unrelated CSV headers** | Wrong columns (`product_id,price`) | `Header schema mismatch: Missing mandatory apaar_id column.` | Passed (Rejected with column diff) |
| **Mixed valid and malformed rows** | Incomplete single-column rows | Extracts valid rows, issues warning for skipped lines | Passed (`Parsed 2 records, skipped 1`) |
| **High-Volume 10,000-Row Roster** | Institutional-scale load | Ingestion throughput $< 500\text{ms}$ | **Passed (10,000 rows parsed in 22ms)** |

---

## 4. Accessibility (WCAG 2.2 AA / GIGW 3.0) & Urdu RTL

Tested in `apps/web/test/a11y-rtl.test.js`:

1. **Urdu Right-to-Left (RTL) Rendering:**
   - When Urdu (`ur`) is selected in the language switcher, `document.documentElement.dir` is dynamically set to `rtl` and `lang="ur"`.
   - Verified that all 96 translated keys in `ur.json` contain authentic Nastaliq/Arabic Unicode characters (`\u0600`–`\u06FF`).
2. **Color Contrast Ratios (GIGW 3.0 AA Compliance):**
   - Slate-900 on White background: **16.1:1** (Exceeds WCAG AAA requirement of 7.0:1)
   - Slate-700 on White background: **7.2:1** (Exceeds WCAG AAA requirement of 7.0:1)
   - Emerald-700 on White background: **4.8:1** (Meets WCAG AA requirement of 4.5:1)
   - Rose-700 on White background: **5.4:1** (Meets WCAG AA requirement of 4.5:1)
3. **Assistive Technology & Semantic Markup:**
   - Upload errors and warnings use `role="alert"` with `aria-live="assertive"` and `role="status"` with `aria-live="polite"`.
   - Data tables declare `aria-label="Student verification review records"` and `<th scope="col">` column scopes.
   - Interactive icon buttons include explicit `aria-label` tags (`"Select Language"`, `"Open Labs and Demo Tools"`).
