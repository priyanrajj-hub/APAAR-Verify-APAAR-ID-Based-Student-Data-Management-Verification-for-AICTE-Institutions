# APAAR-Verify Deployment Guide

This guide covers deployment instructions for the **Vercel Frontend (Demo Mode)**, **Docker Compose (Local)**, **Local Kubernetes (`kind`)**, and **Google Cloud Run / GKE**.

---

## 1. Vercel Frontend Deployment (Zero-Backend SIH Evaluator Mode)

🚀 **Live Production URL:** [https://apaar-verify-seven.vercel.app](https://apaar-verify-seven.vercel.app)

The Next.js 15 App Router frontend is engineered with an in-browser execution engine (ADR-002). Even if backend microservices are offline or undergoing cold starts, Vercel evaluators can test the complete end-to-end user journey:

### Zero-Config Monorepo Setup:
The repository includes root and package-level `vercel.json` configurations:
- **Root Directory:** `.` (Monorepo root)
- **Framework Preset:** Next.js
- **Build Command:** `npm run build --workspace=apps/web`
- **Output Directory:** `apps/web/.next`
- **Install Command:** `npm ci`
- **Node.js Version:** `22.x`

### Deploying via Vercel Dashboard:
1. Navigate to [vercel.com/new](https://vercel.com/new) and import `priyanrajj-hub/APAAR-Verify-APAAR-ID-Based-Student-Data-Management-Verification-for-AICTE-Institutions`.
2. All settings (`framework`, `buildCommand`, `outputDirectory`, `installCommand`) are automatically detected via `vercel.json`.
3. Click **Deploy**. The build completes in ~45 seconds.

### Deploying via Vercel CLI:
```bash
npx vercel --prod --yes
```
5. All 12 languages, Luhn check calculations, bulk upload parsing, entity resolution graphs, AICTE surveillance maps, student consent issuance, verifier certificate generation, and cryptographic hash-chain validations function out of the box in the browser.

---

## 2. Local Full-Stack Deployment (`docker-compose`)

To spin up all Python FastAPI microservices, Redis Streams, Qdrant vector store, and the Next.js web client:

```bash
# Using Makefile
make docker-up

# Or using Docker directly
docker compose up --build
```

### Exposed Endpoints:
- **Web Client:** `http://localhost:3000`
- **API Gateway:** `http://localhost:8000/docs`
- **Verification Service:** `http://localhost:8002/docs`
- **Entity Matching Service:** `http://localhost:8003/docs`
- **Anomaly Detection Service:** `http://localhost:8004/docs`
- **RAG Policy Service:** `http://localhost:8005/docs`
- **Qdrant Vector Dashboard:** `http://localhost:6333/dashboard`

---

## 3. Local Kubernetes Cluster (`kind`)

Run the microservices on a local Kubernetes cluster using Kustomize:

```bash
# 1. Create a local Kind cluster
kind create cluster --name apaar-verify

# 2. Deploy base and overlays
make k8s-up
# Or manually:
kubectl apply -k infra/k8s/overlays/dev

# 3. Verify rollout
kubectl get pods -n apaar-verify-dev
```

---

## 4. Production Google Cloud Run Deployment

For scalable serverless microservices on Google Cloud Platform:

```bash
# Build and submit container images to Google Artifact Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/apaar-api-gateway -f infra/docker/Dockerfile.python .

# Deploy API Gateway to Cloud Run
gcloud run deploy apaar-api-gateway \
  --image gcr.io/$PROJECT_ID/apaar-api-gateway \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="PORT=8000,LLM_PROVIDER=offline"
```
