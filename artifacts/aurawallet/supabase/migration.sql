-- Run this in Supabase Dashboard > SQL Editor.
-- Each finance area has its own table and every row is protected by auth.uid().

create table if not exists public.categories (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  icon text not null,
  is_default boolean not null default false,
  primary key (user_id, id)
);

create table if not exists public.wallet_transactions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('credit', 'debit')),
  amount numeric(14,2) not null check (amount > 0),
  note text not null,
  transaction_date timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table if not exists public.spending (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null check (amount > 0),
  category_id text not null,
  description text not null,
  spent_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, category_id) references public.categories(user_id, id) on delete restrict
);

create table if not exists public.money_owed (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  amount numeric(14,2) not null check (amount > 0),
  note text not null,
  owed_at timestamptz not null,
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.categories enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.spending enable row level security;
alter table public.money_owed enable row level security;

do $$
declare table_name text;
begin
  foreach table_name in array array['categories', 'wallet_transactions', 'spending', 'money_owed'] loop
    execute format('drop policy if exists "Users manage their own rows" on public.%I', table_name);
    execute format(
      'create policy "Users manage their own rows" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      table_name
    );
  end loop;
end $$;

create index if not exists spending_user_date_idx on public.spending(user_id, spent_at desc);
create index if not exists wallet_transactions_user_date_idx on public.wallet_transactions(user_id, transaction_date desc);
create index if not exists money_owed_user_date_idx on public.money_owed(user_id, owed_at desc);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile" on public.profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

drop policy if exists "Users read their own avatar" on storage.objects;
create policy "Users read their own avatar" on storage.objects for select to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users upload their own avatar" on storage.objects;
create policy "Users upload their own avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users update their own avatar" on storage.objects;
create policy "Users update their own avatar" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users delete their own avatar" on storage.objects;
create policy "Users delete their own avatar" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- The previous prototype used one JSON document. It is no longer used.
drop table if exists public.user_finance_data;
