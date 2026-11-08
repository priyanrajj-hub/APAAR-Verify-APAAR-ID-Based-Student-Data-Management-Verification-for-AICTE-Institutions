# Architecture & Engineering Decisions Record (ADR)

This document tracks all significant architectural, technical, algorithmic, and design decisions made throughout the implementation of APAAR-Verify.

---

## ADR-001: Monorepo Architecture with npm Workspaces
- **Date:** 2026-11-08
- **Status:** Accepted
- **Context:** APAAR-Verify encompasses a Next.js 15 web client, reusable shared TypeScript packages (types, i18n, ui), Python FastAPI microservices, ML pipelines, and DevOps infrastructure.
- **Decision:** Use standard npm workspaces at the repository root linking `apps/*` and `packages/*`. Python services live under `services/*` managed with `pyproject.toml` / `requirements.txt` and unified Dockerfiles. This ensures smooth single-command developer onboarding without locking developers into proprietary monorepo cloud tooling.
- **Consequences:** Easy dependencies resolution, cross-package TypeScript references via project references or direct path exports, and seamless Vercel deployment by pointing root directory to `apps/web`.

---

## ADR-002: Dual-Mode Operation (Vercel Client-Side Demo Mode + Cloud Backend Mode)
- **Date:** 2026-11-08
- **Status:** Accepted
- **Context:** Hackathon judging and live demonstrations often occur on public Vercel previews where long-running containerized backend microservices (FastAPI, Redis, Qdrant) may not be reachable or could experience cold starts / networking limits.
- **Decision:** Design the web client with an intelligent adapter layer. When `NEXT_PUBLIC_API_URL` is set and reachable, it communicates with the FastAPI services; when absent, unreachable, or toggled to Demo Mode, it seamlessly falls back to a high-fidelity in-browser engine (utilizing WebCrypto SHA-256 for audit hash chains, client-side Luhn verification, in-memory duplicate blocking, and seeded TF-IDF semantic search).
- **Consequences:** Zero-downtime, instant-loading live demo for SIH evaluators on Vercel while preserving full microservice architecture for containerized Kubernetes/Cloud Run deployment.

---

## ADR-003: APAAR Check Digit Specification for Prototype
- **Date:** 2026-11-08
- **Status:** Accepted
- **Context:** The official Government of India APAAR check-digit algorithm is confidential / proprietary to the Ministry of Education & NeGD.
- **Decision:** As specified in Rule 2, implement a documented demo check-digit scheme: APAAR is 12 digits, where the 12th digit is a Luhn checksum computed over the first 11 digits. This algorithm is clearly stated in the UI, API documentation, and code comments.
- **Consequences:** Transparent, mathematically verifiable demo validation without misrepresenting private government specs.

---

## ADR-004: Multilingual i18n Architecture with 12 Indian Languages & RTL
- **Date:** 2026-11-08
- **Status:** Accepted
- **Context:** Section 3 requires launch support for English, Hindi, Tamil, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, Odia, and Urdu (RTL), with automated CI parity validation and zero hardcoded UI strings.
- **Decision:** Implement a lightweight, zero-overhead client-side and server-side i18n provider in `packages/i18n` with JSON translation tables. Dynamic `dir="rtl"` is applied for Urdu (`ur`), with CSS logical properties (`margin-inline-start`, etc.) and Noto Sans font families. An automated verification script (`scripts/check-i18n.js`) validates key parity in CI.
- **Consequences:** Fast rendering, zero hydration mismatch, easily extensible to any new Indian language by dropping a single JSON file.

---

## ADR-005: Cross-Platform Windows & Unix Developer Experience
- **Date:** 2026-11-08
- **Status:** Accepted
- **Context:** Windows PowerShell does not provide `make` natively. The platform must adhere to the single-command rule (`make dev`) while running cleanly on Windows and Unix environments.
- **Decision:** Provide both a POSIX `Makefile` (for Linux/macOS/CI/Docker) and a Windows batch script `make.bat`, alongside root npm scripts (`npm run dev`, `npm test`, `npm run build`).
- **Consequences:** Works out-of-the-box on Windows PowerShell, Command Prompt, WSL, Linux, and macOS without extra installs.
