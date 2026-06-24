# RAG Chatbot Monorepo — Copilot Instructions

## Structure
```
rag-chatbot-monorepo/
├── apps/
│   ├── frontend/   → Next.js 15, App Router, TypeScript strict
│   └── backend/    → NestJS modular, TypeScript strict
└── packages/
    └── shared/     → shared types, Zod schemas, queue job types
```
Always import from `packages/shared` — never redefine shared types in apps.

## Stack
| Layer      | Tech                                          |
|------------|-----------------------------------------------|
| Frontend   | Next.js 15, Tailwind v4, Zustand, TanStack Query v5, shadcn/ui |
| Backend    | NestJS, Prisma 6.x → MySQL 2                 |
| Vector DB  | Qdrant                                        |
| Queue      | BullMQ + ioredis                              |
| Auth       | NextAuth v5 (FE) · passport-jwt (BE)          |
| Validation | Zod + RHF (FE) · class-validator DTOs (BE)    |

## Hard rules (both apps)
- Never use `any` — use `unknown` + type guards or shared types.
- Never access env vars inline — ConfigService (BE) / `NEXT_PUBLIC_*` via `lib/` (FE).
- No business logic in controllers (BE) or components (FE).
- All FE API calls go through `lib/api.ts` axios instance only.

## Output preferences
- Code first, no preamble or postamble.
- Diff-style edits — never paste full files.
- Terse inline comments only when behavior is non-obvious.
