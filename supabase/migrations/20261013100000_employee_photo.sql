-- Foto profil karyawan. Bucket PRIVAT: karyawan (tanpa akun Supabase) upload
-- lewat server action Portal Karyawan memakai service-role client setelah sesi
-- PIN diverifikasi; admin melihat lewat signed URL (policy owns_business, path
-- diawali business_id — sama seperti bucket attendance-selfies).
alter table public.employees
  add column photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('employee-photos', 'employee-photos', false, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Owner reads employee photos of own business"
on storage.objects for select
to authenticated
using (
  bucket_id = 'employee-photos'
  and private.owns_business((string_to_array(name, '/'))[1]::uuid)
);

create policy "Owner deletes employee photos of own business"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'employee-photos'
  and private.owns_business((string_to_array(name, '/'))[1]::uuid)
);
