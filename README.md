# Document RAG Chatbot Monorepo

Production-ready monorepo scaffold for a document-based RAG chatbot platform.

## Tech Stack

- Frontend: Next.js 15 + TypeScript
- Backend: NestJS + TypeScript
- Database: MySQL + Prisma ORM
- Vector Database: Qdrant
- Queue/Cache: Redis + BullMQ
- Monorepo: npm workspaces

## Monorepo Structure

```text
.
├── apps
│   ├── backend
│   │   ├── prisma
│   │   │   └── schema.prisma
│   │   └── src
│   │       ├── chat
│   │       ├── common/config
│   │       ├── health
│   │       ├── prisma
│   │       ├── queue
│   │       ├── vector
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── frontend
│       └── src
│           ├── app
│           ├── components
│           └── lib
├── packages
│   └── shared
│       └── src
│           ├── types
│           └── utils
├── docker-compose.yml
├── .env.example
├── tsconfig.base.json
└── package.json
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker + Docker Compose

## Installation Commands

```bash
# 1) install dependencies at repo root
npm install

# 2) create env file
cp .env.example .env

# 3) start infrastructure
docker compose up -d

# 4) generate prisma client
npm run prisma:generate -w @rag/backend

# 5) create/apply migration
npm run prisma:migrate -w @rag/backend -- --name init

# 6) run backend + frontend in separate terminals
npm run dev:backend
npm run dev:frontend
```

## Docker Setup

The included `docker-compose.yml` runs:

- `mysql` on `3306`
- `redis` on `6379`
- `qdrant` on `6333` (HTTP) and `6334` (gRPC)

Commands:

```bash
# start all services
docker compose up -d

# view health/logs
docker compose ps
docker compose logs -f mysql redis qdrant

# stop services
docker compose down
```

## Environment Configuration

Root `.env.example` contains all required platform variables:

- MySQL: `DATABASE_URL`, `MYSQL_*`
- Redis/BullMQ: `REDIS_HOST`, `REDIS_PORT`, `REDIS_URL`
- Qdrant: `QDRANT_URL`, `QDRANT_COLLECTION`
- Backend: `BACKEND_PORT`, `CORS_ORIGIN`
- Frontend: `NEXT_PUBLIC_API_BASE_URL`

App-local `.env.example` files are included in:

- `apps/backend/.env.example`
- `apps/frontend/.env.example`

## Architecture Overview

### Backend (NestJS Modular)

- `AppModule` composes domain modules.
- `PrismaModule` provides a singleton Prisma client.
- `VectorModule` encapsulates Qdrant collection bootstrapping and search integration point.
- `QueueModule` encapsulates BullMQ and Redis connectivity.
- `ChatModule` handles chat endpoint orchestration (`POST /api/chat/ask`).
- `HealthModule` provides dependency readiness check (`GET /api/health`).

This structure supports horizontal scaling by keeping concerns isolated and stateless at the API layer.

### Data Design

- MySQL (Prisma) stores documents, chunks metadata, sessions, and messages.
- Qdrant stores dense vectors and similarity search index.
- Redis/BullMQ handles asynchronous ingestion and embedding pipelines.

### Frontend (Next.js 15)

- App Router architecture.
- Shared API contract types imported from `@rag/shared`.
- `ChatShell` component provides a baseline chat UX and retrieval metadata display.

### Shared Package

- `@rag/shared` centralizes cross-app contracts and reusable helpers.
- Prevents drift between frontend request/response types and backend DTO contracts.

## Production Readiness Notes

- Global validation with `class-validator` + strict DTOs.
- Security middleware: `helmet`, CORS, compression.
- Health endpoint validates MySQL/Redis/Qdrant dependencies.
- Queue retries with exponential backoff.
- Strong TypeScript strict mode across workspace.
- Centralized lint/format and base TS config.

## Next Steps for Full RAG Pipeline

1. Add ingestion worker(s) that parse documents, chunk text, create embeddings, store vectors in Qdrant, and persist metadata in MySQL.
2. Integrate LLM provider in `ChatService` for answer synthesis with retrieved context.
3. Add auth (JWT/OAuth), tenant isolation, and rate limiting.
4. Add observability (OpenTelemetry + structured logs + metrics).
5. Add CI pipeline for lint/typecheck/tests/build and container image publishing.
