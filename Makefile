.PHONY: dev build test lint typecheck check-i18n docker-up docker-down k8s-up ml-eval clean

# Start Next.js frontend and services locally
dev:
	npm run dev

# Build all packages and the Next.js app
build:
	npm run build

# Run test suites and i18n key consistency checks
test:
	node scripts/check-i18n.js
	npm test

# Verify all 12 Indian language translation keys have parity
check-i18n:
	node scripts/check-i18n.js

# Lint the codebase
lint:
	npm run lint

# TypeScript type check
typecheck:
	npm run typecheck

# Start local Docker Compose environment
docker-up:
	docker compose up --build

docker-down:
	docker compose down

# Kubernetes local cluster setup (kind)
k8s-up:
	kubectl apply -k infra/k8s/overlays/dev

# Run ML synthetic data evaluation
ml-eval:
	python ml/evaluation/evaluate.py

clean:
	rm -rf node_modules apps/web/.next dist
