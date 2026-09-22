-- Extensions
create extension if not exists pgcrypto with schema extensions;

-- Private schema for internal helpers (not exposed via PostgREST).
create schema if not exists private;

-- Reusable trigger to keep `updated_at` current on row changes.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
