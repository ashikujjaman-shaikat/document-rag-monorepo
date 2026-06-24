---
name: prisma-workflow
description: Use when working with Prisma schema, migrations, queries, or Prisma Client in this project.
---

## Project context
- ORM: Prisma 6.x with `@prisma/client`
- DB: MySQL 2 (`mysql2` driver)
- Schema: `apps/backend/prisma/schema.prisma`
- Generate: `npm run generate` (inside `apps/backend`)
- Migrate dev: `npm run migrate`
- Migrate prod: `npm run migrate:deploy`

## Rules
1. Never write raw SQL — use Prisma Client APIs only.
2. Schema changes must include a migration name: `prisma migrate dev --name <name>`.
3. Multi-step writes: `prisma.$transaction([...])`.
4. Use `select` / `include` — never return full models.
5. Pagination: `skip` + `take` always — no unbounded `findMany()`.
6. After schema edits, remind user: run `npm run generate` before `npm run build`.

## Output rules
- Show only the model block being added or changed — not the full schema.
- Do not include generated client types verbatim.
