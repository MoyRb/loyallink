# LoyalLink

MVP de fidelización multi-negocio con Next.js + Supabase (auth, base de datos, RLS y storage).

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + Storage)

## Variables de entorno

Crea `.env.local`:

```bash
cp .env.example .env.local
```

Variables requeridas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Supabase

- Helpers cliente/server/admin en `src/lib/supabase/*`.
- Migración inicial con tablas, enums, trigger y RLS en `supabase/migrations/202603240001_init_loyallink.sql`.
- Setup paso a paso en `docs/supabase-setup.md`.

## Modelo de datos (MVP)

- `profiles` (rol `business_owner` o `customer`)
- `businesses`
- `loyalty_cards`
- `point_wallets`
- `point_transactions`
- `qr_operations`

## Seguridad (RLS)

- Owners solo gestionan recursos de sus negocios.
- Customers solo leen sus tarjetas, wallets y transacciones.
- Policies para storage en bucket `business-logos` con convención `<owner_id>/<filename>`.

## Estado de integración UI

- `/wallet`: consulta datos reales de Supabase para usuarios `customer` autenticados.
- `/business`: consulta negocios reales para usuarios `business_owner` autenticados.
- Fallback a estado informativo/mock cuando no hay sesión.

## Siguiente prompt sugerido

> Implementa auth + onboarding visual completo para LoyalLink: pantallas de registro/login con Supabase Auth, selector de rol inicial (business_owner/customer), creación guiada de perfil/negocio post-registro, y protección de rutas por rol en App Router con feedback de estados de carga/error.
