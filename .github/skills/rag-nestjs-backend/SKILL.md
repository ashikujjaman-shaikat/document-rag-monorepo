---
name: rag-nestjs-backend
description: Use when generating or editing NestJS modules, services, controllers, guards, pipes, DTOs, Prisma queries, Qdrant vector operations, BullMQ jobs, or Redis cache logic in the RAG chatbot backend.
---

## Project context
- Monorepo path: `apps/backend/`
- Shared types: `packages/shared/src/types` — always import from there, never redefine
- Runtime: Node >=20.x
- Language: TypeScript 5.x strict — never use `any`
- Framework: NestJS (modular architecture)
- ORM: Prisma 6.x → MySQL 2 driver
- Vector DB: Qdrant via `@qdrant/js-client-rest`
- Cache / Queue: ioredis + BullMQ
- Validation: class-validator + class-transformer DTOs — never manual `if` guards
- Auth: passport-jwt + JwtAuthGuard (global)
- File upload: Multer
- Config: `@nestjs/config` ConfigService — never `process.env.X` inline
- Logging: Winston via `nest-winston`
- API docs: Swagger (`@nestjs/swagger`) — decorate every DTO and endpoint

## Folder structure
```
apps/backend/src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   │   └── public.decorator.ts      # @Public() skips JwtAuthGuard
│   ├── filters/
│   │   └── http-exception.filter.ts # global error shape
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts # wrap all responses: { success, data }
│   └── pipes/
├── config/
│   └── configuration.ts             # typed env config factory
├── modules/
│   ├── auth/                        # login, register, JWT issue
│   ├── user/                        # CRUD, roles
│   ├── document/                    # upload, parse trigger, status
│   ├── embedding/                   # generate vectors (OpenAI / Ollama)
│   ├── chat/                        # RAG query pipeline + SSE stream
│   ├── queue/                       # BullMQ producers + processors
│   └── vector/                      # Qdrant client wrapper
├── prisma/
│   └── prisma.service.ts            # PrismaClient singleton (OnModuleInit)
```

## NestJS architecture rules
1. Every feature is a self-contained Module: `module → controller → service → repository`.
2. Controllers: parse/validate DTO, call service, return response — zero business logic.
3. Services: orchestrate business logic — call repository for DB, VectorService for Qdrant.
4. Repository pattern: all Prisma calls in `*.repository.ts` — never `prisma.*` inside a service.
5. Global `JwtAuthGuard` protects all routes; use `@Public()` decorator for open routes.
6. Global `TransformInterceptor` wraps every response: `{ success: true, data: T }`.
7. Global `HttpExceptionFilter` shapes all errors: `{ success: false, message, statusCode }`.
8. Never `try/catch` in controllers — let filters handle it.

## RAG pipeline (chat flow)
```
POST /chat
  → ChatController
  → ChatService.query(userId, message)
      1. EmbeddingService.embed(message)           → float[] query vector
      2. VectorService.search(vector, { userId })  → top-K chunk IDs
      3. DocumentRepository.getChunksByIds(ids)    → source text from MySQL
      4. LLM call (OpenAI / Ollama) with context  → stream tokens
  → SSE stream back: res.write(`data: ${token}\n\n`)
  → send `data: [DONE]\n\n` on finish
```

## Document ingestion (async via BullMQ)
```
POST /documents/upload (Multer)
  → DocumentController
  → DocumentService.create()     → save metadata to MySQL (status: PENDING)
  → QueueService.add('ingest', { documentId })
  → return { documentId, status: 'PENDING' }

IngestProcessor (@Processor('ingest'))
  1. Parse file: pdf-parse / mammoth
  2. Chunk: fixed 512 tokens, 64 overlap
  3. EmbeddingService.embedBatch(chunks)
  4. VectorService.upsert(vectors, { documentId, userId })
  5. DocumentRepository.updateStatus(documentId, 'READY')
  On fail: status → 'FAILED', log error
```

## Prisma rules
- Never call `prisma.*` in a service — always delegate to repository class.
- Use `select` / `include` — never return full models.
- Pagination: always `skip` + `take` — no unbounded `findMany()`.
- Multi-step writes: `prisma.$transaction([...])`.
- After schema change: run `npm run generate` before `npm run build`.

## Qdrant rules
- Single collection: `documents`.
- Payload on every point: `{ chunkId, documentId, userId, pageNumber, chunkIndex }`.
- Always filter by `userId` on search — never return other users' data.
- Use `upsert` (not insert) — re-ingestion must be idempotent.
- Vector size matches embedding model (e.g. OpenAI ada-002 = 1536).

## BullMQ rules
- Job payload types defined in `packages/shared/src/types/queue.types.ts`.
- Each processor in its own `*.processor.ts` decorated with `@Processor('queue-name')`.
- Retry config: `attempts: 3, backoff: { type: 'exponential', delay: 2000 }`.
- Never await a job inside a request cycle — fire and return `{ jobId }`.

## Redis / Cache rules
- Cache LLM responses keyed by `sha256(userId + message + topK)` — TTL 5 min.
- Rate-limit and session data in Redis — not MySQL.
- Use `@nestjs/cache-manager` with ioredis store.

## DTO rules
- Every request body has a DTO with `class-validator` decorators.
- DTOs live in `modules/<feature>/dto/`.
- Add `@ApiProperty()` on every DTO field for Swagger.
- Response DTOs use `@Expose()` from `class-transformer` — never return raw Prisma model.

## Auth rules
- `JwtAuthGuard` is global (registered in `AppModule`).
- Public routes use `@Public()` custom decorator.
- JWT payload type: `{ sub: userId, email: string, role: Role }` — from `packages/shared`.

## Output rules
- Show only the class/method that changed plus its decorator.
- Never paste full module files.
- For Prisma: show only the model block being added/changed, not full schema.
- For BullMQ: show producer call + processor handler together.
- Include import line only if new.
