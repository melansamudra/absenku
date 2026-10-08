-- Pengetatan absen selfie publik (/absen/[slug]) — tiga celah sekaligus:
--
-- (1) Geofence: sebelumnya GPS cuma dicatat, tidak pernah dicek. Sekarang
--     bisnis bisa mengisi titik lokasi kantor + radius; kalau ketiganya
--     terisi, API absen menolak absen yang lokasinya di luar radius (atau
--     tanpa lokasi sama sekali). Kosong = perilaku lama (tidak dibatasi).
-- (2) PIN absen per karyawan: link absen menampilkan daftar semua nama, jadi
--     siapa pun yang pegang link bisa "titip absen" atas nama orang lain.
--     Admin bisa memasang PIN 4–6 digit per karyawan (disimpan sebagai hash
--     scrypt, dihitung di server app — lihat src/lib/attendance/pin.ts). Kalau
--     karyawan punya PIN, PIN wajib diisi saat absen; kalau
--     businesses.attendance_pin_required = true, karyawan TANPA PIN tidak bisa
--     absen selfie sama sekali sampai admin memasangkan PIN.
-- (3) Bucket foto selfie jadi privat: sebelumnya publik-baca, jadi siapa pun
--     yang tahu URL bisa membuka foto wajah karyawan. Sekarang hanya owner/
--     staff bisnis (lewat signed URL berumur pendek) yang bisa membukanya.

alter table public.businesses
  add column office_lat numeric(9, 6) check (office_lat between -90 and 90),
  add column office_lng numeric(9, 6) check (office_lng between -180 and 180),
  add column attendance_radius_m int check (attendance_radius_m between 10 and 10000),
  add column attendance_pin_required boolean not null default false;

alter table public.employees
  add column attendance_pin_hash text;

-- Gagal PIN dicatat di log yang sama dengan cooldown absen/cuti, supaya API
-- bisa mengunci sementara karyawan setelah beberapa kali salah PIN (mencegah
-- tebak PIN 4 digit lewat brute force).
alter table public.public_submission_log
  drop constraint public_submission_log_kind_check;
alter table public.public_submission_log
  add constraint public_submission_log_kind_check
  check (kind in ('absen', 'cuti', 'absen_pin_gagal'));

-- RPC halaman absen publik perlu tahu apakah PIN/lokasi dibutuhkan (supaya
-- UI bisa menampilkan input PIN & minta izin lokasi). Return type berubah,
-- jadi harus drop + create (create or replace tidak boleh ubah kolom hasil).
-- Hash PIN-nya sendiri TIDAK pernah dikembalikan — cuma flag ada/tidaknya.
drop function public.get_attendance_checkin_info(text);

create function public.get_attendance_checkin_info(p_slug text)
returns table (
  business_id uuid,
  business_name text,
  work_start_time time,
  work_end_time time,
  geofence_enabled boolean,
  pin_required boolean,
  employee_id uuid,
  employee_name text,
  employee_note text,
  employee_has_pin boolean
)
language sql
security definer
set search_path = ''
as $$
  select
    b.id, b.name, b.work_start_time, b.work_end_time,
    (b.office_lat is not null and b.office_lng is not null and b.attendance_radius_m is not null),
    b.attendance_pin_required,
    e.id, e.name, e.note,
    e.attendance_pin_hash is not null
  from public.businesses b
  join public.employees e on e.business_id = b.id
    and e.active = true
    and e.deleted_at is null
  where b.attendance_qr_slug = p_slug
  order by e.created_at asc;
$$;

grant execute on function public.get_attendance_checkin_info(text) to anon, authenticated;

-- (3) Bucket privat + baca hanya untuk owner/staff bisnis pemilik foto
-- (prefix path = business_id, sama seperti policy delete yang sudah ada).
update storage.buckets set public = false where id = 'attendance-selfies';

drop policy "Public read attendance selfies" on storage.objects;

create policy "Owner reads attendance selfies of own business"
on storage.objects for select
to authenticated
using (
  bucket_id = 'attendance-selfies'
  and private.owns_business((string_to_array(name, '/'))[1]::uuid)
);

-- Kolom *_photo_url sekarang menyimpan PATH objek di bucket (bukan public
-- URL lagi) — dashboard membuat signed URL dari path ini saat ditampilkan.
-- Konversi baris lama yang masih berisi public URL penuh.
update public.attendance
set check_in_photo_url = regexp_replace(
  check_in_photo_url, '^.*/storage/v1/object/public/attendance-selfies/', ''
)
where check_in_photo_url like '%/storage/v1/object/public/attendance-selfies/%';

update public.attendance
set check_out_photo_url = regexp_replace(
  check_out_photo_url, '^.*/storage/v1/object/public/attendance-selfies/', ''
)
where check_out_photo_url like '%/storage/v1/object/public/attendance-selfies/%';
