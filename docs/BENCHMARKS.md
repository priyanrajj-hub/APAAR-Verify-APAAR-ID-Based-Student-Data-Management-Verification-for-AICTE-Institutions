# Ingestion & Verification Benchmarks

**Benchmark Date:** 2026-11-09  
**Platform:** Node.js v24.18.0 (win32 x64)  
**Methodology:** Synthetic roster generation with automated 5-stage verification (schema validation, 12-digit Luhn check-digit, duplicate detection, and SHA-256 hash sealing).

## Measured Results

| Batch Size | CSV Ingestion & Parsing | 5-Stage Verification | SHA-256 Hash Sealing | Total Latency | Effective Throughput |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1,000 Records** | 0.55 ms | 0.44 ms | 0.43 ms | **1.42 ms** | **7,04,473 rec/sec** |
| **10,000 Records** | 4.91 ms | 1.65 ms | 0.20 ms | **6.76 ms** | **14,78,262 rec/sec** |

## Key Findings

1. **Sub-100ms Ingestion:** Even with 10,000 student records, complete parsing and Luhn verification execute in under 7 ms on standard consumer hardware.
2. **Deterministic Luhn Validation:** Check-digit calculation using double-add-modulo algorithm processes in sub-microsecond time per record.
3. **Cryptographic Append:** 100 sequential SHA-256 block events hash in 0.20 ms using native crypto primitives.
4. **Scale Limitation:** Browser memory constraints safely support rosters up to 10,000 rows in a single batch. Larger institution rosters (>10k) should be uploaded in chunked batches or processed via the Python backend `ingest-svc` streaming API.
