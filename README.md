# LoyalLink

Production-ready MVP foundation for a multi-business loyalty platform.

> This repository now includes a complete **Next.js + TypeScript + Tailwind** app scaffold with mobile-first UI, App Router structure, and Supabase-ready boundaries (without Supabase logic implemented yet).

## Tech Stack

- Next.js (latest stable, App Router)
- TypeScript
- Tailwind CSS
- ESLint
- Supabase-ready project structure (auth/db/storage to be wired next)

## MVP Coverage in This Step

✅ Included:
- Project initialization and base tooling
- Clean, scalable folder structure
- Mobile-first responsive UI foundation
- Placeholder flows and screens for:
  - Customer wallet
  - Business profile + logo upload UI
  - QR earn flow
  - QR redeem flow
- Transaction history UI scaffold
- PWA-prep manifest + metadata setup
- Environment variable template

🚫 Intentionally not implemented yet:
- Supabase auth/database/storage logic
- QR generation/signing/verification backend
- Real transaction writes/reads
- Stripe
- Analytics
- Multi-branch business logic

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure env vars

```bash
cp .env.example .env.local
```

Fill in Supabase values later (next implementation step).

### 3) Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4) Quality checks

```bash
npm run lint
npm run build
```

## Folder Structure

```text
src/
  app/
    (dashboard)/
      business/page.tsx      # business profile setup scaffold
      wallet/page.tsx        # customer wallet + transaction history scaffold
      scan/page.tsx          # earn-points QR claim flow scaffold
      redeem/page.tsx        # redeem-points QR verify flow scaffold
      layout.tsx             # shared dashboard layout + nav
    api/                     # reserved for route handlers
    globals.css              # global Tailwind styles and theme tokens
    layout.tsx               # root layout + metadata + manifest
    page.tsx                 # landing / MVP overview
  components/
    layout/
      top-nav.tsx            # app navigation
      app-shell.tsx          # shared shell helper component
    ui/
      badge.tsx              # reusable status badge
      button.tsx             # reusable button primitive
      card.tsx               # reusable card primitive
  features/
    auth/                    # reserved auth feature area
    business/                # reserved business feature area
    loyalty/
      mock-data.ts           # temporary mock cards + transactions
    wallet/                  # reserved wallet feature area
  lib/
    config/site.ts           # site config and nav metadata
    supabase/
      client.ts              # placeholder browser client factory
      server.ts              # placeholder server client factory
    types/domain.ts          # core domain types
    utils/cn.ts              # className helper
```

## Architecture Notes for Next Step

When implementing Supabase, keep these rules:

1. **Points isolated per business** (no cross-business balances).
2. **Never trust QR payload on client** (server-issued, short-lived tokens only).
3. **Every points mutation audited** (append-only transactions + actor metadata).
4. **Atomic updates** for redemption and earn operations.

## Suggested Next Prompt

Use this as your next prompt:

> Implement Supabase end-to-end for LoyalLink MVP: add auth (business owner + customer roles), database schema + RLS policies, storage for business logos, short-lived server-side QR token issuance/verification endpoints for earn and redeem flows, and wire all current placeholder pages to real data with auditable transaction history.
