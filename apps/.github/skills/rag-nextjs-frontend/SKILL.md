---
name: rag-nextjs-frontend
description: Use when generating or editing Next.js pages, components, server actions, API calls, chat UI, document upload UI, auth flows, hooks, or state management in the RAG chatbot frontend.
---

## Project context
- Monorepo path: `apps/frontend/`
- Shared types: `packages/shared/src/types` — always import from there, never redefine locally
- Framework: Next.js 15 (App Router) + TypeScript 5.x strict — never use `any`
- Styling: Tailwind CSS v4
- State: Zustand (global UI state) + TanStack Query v5 (server state)
- Forms: React Hook Form + Zod resolver
- HTTP: axios instance at `lib/api.ts` — never call `fetch()` directly in components
- Auth: NextAuth.js v5 (JWT, synced with NestJS backend JWT)
- File upload: react-dropzone → multipart POST to backend
- Streaming: `ReadableStream` for SSE chat responses
- Icons: lucide-react
- UI primitives: shadcn/ui (Radix-based)

## Folder structure
```
apps/frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # sidebar + topbar shell
│   │   ├── chat/page.tsx           # chat list
│   │   └── documents/
│   │       ├── page.tsx            # document list
│   │       └── upload/page.tsx
│   ├── api/auth/[...nextauth]/route.ts
│   ├── layout.tsx                  # root layout + providers
│   └── globals.css
├── components/
│   ├── ui/                         # shadcn primitives
│   ├── chat/
│   │   ├── ChatWindow.tsx          # message list + auto-scroll
│   │   ├── ChatInput.tsx           # textarea + send
│   │   ├── MessageBubble.tsx       # user / assistant bubble
│   │   └── StreamingText.tsx       # token-by-token SSE render
│   ├── document/
│   │   ├── DocumentList.tsx
│   │   ├── DocumentCard.tsx
│   │   └── UploadDropzone.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       └── Topbar.tsx
├── lib/
│   ├── api.ts                      # axios instance with auth interceptor
│   ├── auth.ts                     # NextAuth config
│   └── utils.ts                    # cn(), formatDate()
├── hooks/
│   ├── useChat.ts                  # send message + SSE stream
│   ├── useDocuments.ts             # TanStack Query document CRUD
│   └── useUpload.ts                # upload progress + status polling
├── store/
│   └── chatStore.ts                # Zustand: active chatId, messages
├── types/                          # UI-only types (shared types from packages/shared)
└── middleware.ts                   # NextAuth route protection
```

## Architecture rules
1. App Router only — no `pages/` directory.
2. Server Components by default — add `'use client'` only for event handlers, hooks, or browser APIs.
3. No business logic in components — components call hooks; hooks call `lib/api.ts`.
4. Route Handlers (`app/api/`) are thin proxies only — no DB or business logic.
5. TanStack Query for all server state — never `useEffect + fetch`.
6. Zustand only for pure client UI state (active chat, sidebar toggle, etc.).

## Server vs Client rules
| Need | Use |
|---|---|
| Data fetch + SEO | Server Component (async) |
| onClick / onChange / hooks | `'use client'` |
| Auth in layout | `getServerSession()` → Server |
| Auth in component | `useSession()` → Client |
| Form with validation | `'use client'` + React Hook Form |
| Static content | Server Component |

## Chat / SSE streaming rules
- Backend streams tokens via `text/event-stream`.
- `useChat` hook reads `ReadableStream` — never use `EventSource` in components.
- Append tokens to Zustand store as they arrive.
- Show blinking cursor while streaming; remove on `[DONE]` event.
- Mid-stream error: show inline inside message bubble — no toast.

## API rules
- All calls through `lib/api.ts` axios instance.
- Interceptor: attach `Authorization: Bearer <token>` from NextAuth session.
- Interceptor: 401 → `signOut()` + redirect `/login`.
- Never hardcode URLs — use `NEXT_PUBLIC_API_URL` env var.
- TanStack Query key pattern: `['resource', id?, filters?]`

## Form rules
- React Hook Form + Zod resolver for all forms.
- Zod schemas from `packages/shared/src/schemas` where available.
- Field-level errors inline below input — no alert dialogs for validation.
- Disable submit while `isSubmitting`.

## Upload rules
- react-dropzone: accept `.pdf`, `.docx`, `.txt` only.
- Max 10 MB — validate client-side before POST.
- Multipart POST → `NEXT_PUBLIC_API_URL/documents/upload`.
- Poll `GET /documents/:id` every 3s until `READY` or `FAILED`.
- Progress bar via axios `onUploadProgress`.
- All logic in `useUpload` hook — never inline in component.

## Styling rules
- Tailwind utility classes only — no inline `style={{}}` except dynamic values.
- `cn()` from `lib/utils.ts` for conditional class merging.
- Dark mode via Tailwind `class` strategy toggled in Zustand.
- Mobile-first: `sm:` / `md:` / `lg:` breakpoints.
- shadcn/ui as base — extend via `className`, never modify component source.

## Output rules
- Show only the component or hook that changed.
- Never paste full page files — show relevant section + 2 lines of context.
- Include import line only if new.
- For hooks, always show the return type explicitly.
- For Server Components, note `async` at the top of the snippet.
