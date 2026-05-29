# DividendWatch — Backend Setup (Supabase + Next.js 16)

This adds real authentication and a database to your existing frontend. Follow
the steps in order; it takes about 20–30 minutes the first time.

## What's in this bundle

```
lib/supabase/client.ts        Browser client (Client Components)
lib/supabase/server.ts        Server client (Server Components / Actions / Route Handlers)
lib/supabase/proxy.ts         Session-refresh helper
proxy.ts                      Next.js 16 request interceptor (goes at project ROOT)
app/auth/callback/route.ts    Handles OAuth + email-confirmation redirects
app/auth/signout/route.ts     POST here to log out
components/login-modal.tsx    Your modal, now wired to Supabase (REPLACES the old one)
supabase/schema.sql           Database tables + row-level security + signup trigger
.env.local.example            Template for your secrets
```

Copy each file to the matching path in your project (same folder layout). The
modal replaces your current `components/login-modal.tsx`.

## Step 1 — Create the Supabase project

1. Go to supabase.com, create a free project. Pick a region close to you.
2. Wait for it to finish provisioning (~2 min).

## Step 2 — Install packages

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

## Step 3 — Environment variables

1. In your project root, copy `.env.local.example` to `.env.local`.
2. In the Supabase dashboard open **Connect** (top bar) or **Settings -> API Keys**.
3. Copy the **Project URL** into `NEXT_PUBLIC_SUPABASE_URL`.
4. Copy the **Publishable key** (`sb_publishable_...`) into
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
5. Copy the **Secret key** (`sb_secret_...`) into `SUPABASE_SECRET_KEY` — you
   won't use it yet, but you will for the market-data cron job later.

(If your dashboard still shows the legacy `anon` / `service_role` keys, those
work through end of 2026, but prefer the new publishable/secret keys.)

## Step 4 — Create the database

1. In the dashboard, open **SQL Editor -> New query**.
2. Paste the entire contents of `supabase/schema.sql` and click **Run**.
3. Open **Table Editor** and confirm you see `profiles`, `portfolios`,
   `holdings`, `watchlist`, `alerts`, and `dividends_cache`.

## Step 5 — Configure auth providers

**Email/password** is on by default. For local testing you can speed things up:
in **Authentication -> Sign In / Providers -> Email**, you may temporarily turn
off "Confirm email" so signups log in immediately. Turn it back on before
launch.

**Google / GitHub OAuth** (the two buttons in your modal):

- In **Authentication -> Sign In / Providers**, enable Google and/or GitHub and
  paste the Client ID + Secret you get from each provider's developer console.
- Set the OAuth redirect URL in each provider to:
  `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`
- In **Authentication -> URL Configuration**, set **Site URL** to
  `http://localhost:3000` for now (add your production domain at launch), and
  add `http://localhost:3000/**` to **Redirect URLs**.

If you don't want OAuth yet, leave those providers off — the email/password flow
works on its own, and the buttons will simply error until enabled.

## Step 6 — Run it

```bash
pnpm dev
```

Open http://localhost:3000, click **Get Started / Login**, and create an
account. After login you'll be redirected to `/dashboard`. That route doesn't
exist yet (you'll build it next), so you'll get a 404 — that's expected and
confirms auth worked. Check **Authentication -> Users** and **Table Editor ->
profiles** in the dashboard; your new user should appear in both.

## How the pieces fit

- The **proxy** runs on every request, refreshes the session cookie, and (as
  written) redirects anonymous visitors away from `/dashboard`.
- **Client Components** (like the modal) use `lib/supabase/client.ts`.
- **Server code** uses `lib/supabase/server.ts`. Always verify the user there
  with `supabase.auth.getUser()` — never trust `getSession()` on the server.
- **Row-level security** means a logged-in user can only ever read/write their
  own portfolios, holdings, watchlist, and alerts. The `dividends_cache` table
  is shared read-only market data; only your server (secret key) writes to it.

## What to build next, in order

1. **`app/dashboard/page.tsx`** — a protected Server Component. Call
   `createClient()` from `lib/supabase/server.ts`, get the user, and read their
   portfolios. This proves the full auth + DB loop end to end.
2. **Holdings CRUD** — Route Handlers under `app/api/holdings/` to add/remove
   stocks. Enforce the Free-plan 10-stock cap here by counting rows before
   insert and checking `profiles.plan`.
3. **Market data provider** — sign up for a dividend data API (EOD Historical
   Data, Financial Modeling Prep, Polygon, or Finnhub), then a Route Handler +
   a daily **Vercel Cron** job that writes into `dividends_cache` using the
   secret key. This powers the calendar, real-time tracking, and forecasting.
4. **Stripe** — Checkout + a webhook Route Handler that flips
   `profiles.plan` between free/pro/enterprise. Gate Pro features off that
   column.
5. **Alerts + email** — a cron job that reads `alerts` + `dividends_cache` and
   sends notifications via Resend or Postmark.

Tackle step 1 first — once the dashboard reads real data for the logged-in user,
everything else is the same pattern repeated.
