-- Dipakai fitur "Tambah Staff" (settings/staff) — owner bisnis mengundang
-- staff dengan memasukkan email orang yang SUDAH punya akun HrCash (lewat
-- /signup). auth.users tidak diekspos lewat PostgREST ke role authenticated,
-- jadi perlu RPC security definer yang cuma mengembalikan id (bukan data
-- lain) supaya owner bisa insert ke business_staff lewat RLS yang sudah ada.
create or replace function public.find_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function public.find_user_id_by_email(text) from public;
grant execute on function public.find_user_id_by_email(text) to authenticated;
