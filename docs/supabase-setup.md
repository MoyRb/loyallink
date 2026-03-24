# Supabase setup (LoyalLink MVP)

## 1) Environment variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Set values from your Supabase project:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2) Install dependencies

```bash
npm install
```

The project now uses:

- `@supabase/supabase-js`
- `@supabase/ssr`

## 3) Apply schema and RLS migration

Using Supabase CLI:

```bash
supabase db push
```

Migration included:

- `supabase/migrations/202603240001_init_loyallink.sql`

## 4) Storage bucket conventions

Bucket: `business-logos`.

Upload path format:

```text
<owner_id>/<filename>
```

Example:

```text
6f07...-owner/profile-logo.png
```

This folder convention is required by storage RLS policies.

## 5) Auth + profile bootstrap

A trigger creates/updates `public.profiles` from `auth.users` on signup.

Recommended `user_metadata` during signup:

```json
{
  "full_name": "Jane Doe",
  "role": "business_owner"
}
```

If `role` is omitted, it defaults to `customer`.

## 6) Current app integration

- `/wallet` loads real cards/wallets/transactions for authenticated `customer` users.
- `/business` loads real businesses for authenticated `business_owner` users.
- If no valid session exists, pages display mock data (wallet) or informational state (business).

## 7) Service role usage

`SUPABASE_SERVICE_ROLE_KEY` is available through `getSupabaseAdminClient()` for trusted server-only workflows (future QR claim/redeem route handlers). Never expose this key client-side.
