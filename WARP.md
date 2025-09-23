# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project type: Next.js 14 (App Router) + TypeScript + Tailwind CSS. Data is stored in Postgres and accessed via Supabase (PostgREST) using both anon and service-role clients. Prisma exists for schema definition, but runtime data access uses Supabase clients.

Common commands (PowerShell on Windows)
- Install deps: npm install
- Dev server: npm run dev
- Lint: npm run lint
- Build: npm run build
- Start (after build): npm start
- DB utilities (ensure environment is configured; see Env below):
  - Initialize default Settings row: node scripts/init-settings.js
  - Inspect DB contents (events/departments/winners): node scripts/check-events.js
  - Health check endpoint (local dev): Invoke-RestMethod http://localhost:3000/api/health/db | ConvertTo-Json -Depth 5

Notes
- No test script is defined in package.json. There is currently no configured unit/integration test runner.
- The DB utility scripts import "dotenv". If you see "Cannot find module 'dotenv'", install it: npm i -D dotenv
- next.config.mjs sets eslint.ignoreDuringBuilds = true, so production builds won’t fail on lint errors.

Environment
Define these variables for local development (use .env or .env.local; values are not included here):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- JWT_SECRET (for signing/verifying admin tokens used by middleware)
- DATABASE_URL and DIRECT_URL (used by Prisma tooling/schema; app code reads/writes via Supabase)

API surface and auth model
- API routes live under app/api/** and use the service-role Supabase client for mutations.
  - Examples: /api/events, /api/winners, /api/announcements, /api/departments, /api/settings, /api/health/db
- Middleware-based protection (middleware.js) requires a Bearer token for POST/DELETE on selected routes (winners, announcements, admin reset). Tokens are HS256 JWTs verified with JWT_SECRET via lib/edge-auth.js.
  - To exercise a protected route locally, generate a short-lived token using the provided helper:
    1) Set JWT_SECRET in your shell: $env:JWT_SECRET = "{{JWT_SECRET}}"
    2) Generate a token: node -e "import('./lib/edge-auth.js').then(async m=>{const t=await m.generateTokenEdge('local-admin'); console.log(t)})"
    3) Use it in Authorization: Bearer {{token}} when calling POST/DELETE endpoints (e.g., Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/winners -Headers @{ Authorization = 'Bearer {{token}}' } -Body (@{ eventId='...'; deptId='...'; position=1 } | ConvertTo-Json) -ContentType 'application/json')

High-level architecture
- App Router pages (app/**) render the public site (e.g., events, leaderboard, announcements, photo gallery). Server components fetch data directly via supabaseAdmin for SSR where needed; client components handle rich UI/animations.
- Data layer (lib/supabase.ts):
  - supabase (anon) for safe reads from the client.
  - supabaseAdmin (service role) for server/API mutations and privileged reads.
  - Centralized TABLES constant mirrors Prisma schema model names and is used by both pages and API routes.
- Schema (prisma/schema.prisma): authoritative data model for Postgres tables (Department, Event, Winner, Achievement, Announcement, Settings, Admin, enums, etc.). Prisma client is present but app code interacts through Supabase’s PostgREST.
- Business logic patterns:
  - Winners POST enforces division-specific constraints (e.g., OFFSTAGE vs ONSTAGE position rules) and updates Department.points; when 3 winners exist, Event.status flips to COMPLETED.
  - Settings.lockdown controls visibility of winners in the UI.
- AuthN/AuthZ:
  - Edge-compatible JWT utilities in lib/edge-auth.js; middleware.js guards admin-like POST/DELETE endpoints using Bearer tokens.
- Styling/build:
  - Tailwind configured via tailwind.config.ts and postcss.config.mjs; tsconfig.json sets strict mode and path alias @/* to the repo root.

Where to look first
- lib/supabase.ts: Supabase clients, table names, data helpers.
- app/api/**: Resource-oriented handlers; see winners and events for validation/mutation flows.
- prisma/schema.prisma: Full database schema mirrored in Supabase.
- middleware.js and lib/edge-auth.js: Bearer token verification boundary for protected operations.
