-- ============================================================================
-- DividendWatch schema
-- Run this in the Supabase Dashboard -> SQL Editor (paste & Run).
-- Safe to re-run: uses "if not exists" / "or replace" where possible.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, auto-created on signup (see trigger below)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  email              text,
  full_name          text,
  plan               text not null default 'free'
                       check (plan in ('free', 'pro', 'enterprise')),
  stripe_customer_id text,
  created_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- portfolios: a user can have several (multi-portfolio is a Pro feature; the
-- limit is enforced in app code, not here)
-- ----------------------------------------------------------------------------
create table if not exists public.portfolios (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null default 'My Portfolio',
  created_at timestamptz not null default now()
);
create index if not exists portfolios_user_id_idx on public.portfolios (user_id);

-- ----------------------------------------------------------------------------
-- holdings: stocks inside a portfolio. The Free-plan "10 stocks" cap is
-- enforced in your Route Handler before insert, not at the DB level.
-- ----------------------------------------------------------------------------
create table if not exists public.holdings (
  id           uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios (id) on delete cascade,
  ticker       text not null,
  shares       numeric not null default 0,
  cost_basis   numeric,
  added_at     timestamptz not null default now()
);
create index if not exists holdings_portfolio_id_idx on public.holdings (portfolio_id);

-- ----------------------------------------------------------------------------
-- watchlist: tickers a user follows without holding
-- ----------------------------------------------------------------------------
create table if not exists public.watchlist (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users (id) on delete cascade,
  ticker   text not null,
  added_at timestamptz not null default now(),
  unique (user_id, ticker)
);

-- ----------------------------------------------------------------------------
-- alerts: per-user notification rules
-- ----------------------------------------------------------------------------
create table if not exists public.alerts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  ticker     text not null,
  type       text not null check (type in ('ex_date', 'cut', 'increase', 'payment')),
  enabled    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists alerts_user_id_idx on public.alerts (user_id);

-- ----------------------------------------------------------------------------
-- dividends_cache: SHARED market data pulled from your data provider.
-- Not user-specific. Readable by any signed-in user; written only by the
-- service role (your cron job), never by clients.
-- ----------------------------------------------------------------------------
create table if not exists public.dividends_cache (
  ticker     text not null,
  ex_date    date,
  pay_date   date,
  amount     numeric,
  frequency  text,
  currency   text default 'USD',
  fetched_at timestamptz not null default now(),
  primary key (ticker, ex_date)
);

-- ============================================================================
-- Row Level Security (RLS) — the core of Supabase data isolation.
-- With RLS on, every query is filtered by these policies automatically.
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.portfolios     enable row level security;
alter table public.holdings       enable row level security;
alter table public.watchlist      enable row level security;
alter table public.alerts         enable row level security;
alter table public.dividends_cache enable row level security;

-- profiles: a user reads/updates only their own row
drop policy if exists "own profile read"  on public.profiles;
drop policy if exists "own profile write" on public.profiles;
create policy "own profile read"  on public.profiles for select using (auth.uid() = id);
create policy "own profile write" on public.profiles for update using (auth.uid() = id);

-- portfolios: full CRUD on your own rows
drop policy if exists "own portfolios" on public.portfolios;
create policy "own portfolios" on public.portfolios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- holdings: access allowed only if you own the parent portfolio
drop policy if exists "own holdings" on public.holdings;
create policy "own holdings" on public.holdings
  for all
  using (exists (
    select 1 from public.portfolios p
    where p.id = holdings.portfolio_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.portfolios p
    where p.id = holdings.portfolio_id and p.user_id = auth.uid()
  ));

-- watchlist + alerts: own rows only
drop policy if exists "own watchlist" on public.watchlist;
create policy "own watchlist" on public.watchlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own alerts" on public.alerts;
create policy "own alerts" on public.alerts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- dividends_cache: any signed-in user can read; no client write policy exists,
-- so only the service_role key (server-side cron) can insert/update it.
drop policy if exists "read dividends" on public.dividends_cache;
create policy "read dividends" on public.dividends_cache
  for select using (auth.role() = 'authenticated');

-- ============================================================================
-- Auto-create a profile row whenever a new auth user signs up.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
