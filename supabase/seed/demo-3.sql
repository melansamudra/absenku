-- BAGIAN 3 dari 4 — cuti, lembur, reimbursement, kasbon, pinjaman.
do $$
declare
  v_biz uuid;
  v_start date := date_trunc('month', current_date - interval '1 month')::date;
  v_end date := (date_trunc('month', current_date) - interval '1 day')::date;
  v_lr uuid; v_d1 date; v_d2 date; v_cuti uuid; v_unpaid uuid;
  v_budi uuid; v_siti uuid; v_andi uuid; v_dewi uuid; v_rudi uuid;
begin
  select id into v_biz from public.businesses where name = 'Toko Demo Maju Jaya' order by created_at desc limit 1;
  if v_biz is null then raise exception 'Jalankan Bagian 1 dulu.'; end if;
  select id into v_budi from public.employees where business_id = v_biz and name = 'Budi Santoso';
  select id into v_siti from public.employees where business_id = v_biz and name = 'Siti Rahayu';
  select id into v_andi from public.employees where business_id = v_biz and name = 'Andi Pratama';
  select id into v_dewi from public.employees where business_id = v_biz and name = 'Dewi Lestari';
  select id into v_rudi from public.employees where business_id = v_biz and name = 'Rudi Hartono';
  select id into v_cuti from public.leave_types where business_id = v_biz and name = 'Cuti Tahunan';
  select id into v_unpaid from public.leave_types where business_id = v_biz and name = 'Izin Tanpa Gaji';

  -- Cuti: Siti disetujui (sesuai absensi), Rudi menunggu, Budi ditolak
  select min(date), max(date) into v_d1, v_d2 from public.attendance where employee_id = v_siti and status = 'izin';
  insert into public.leave_requests (business_id, employee_id, leave_type_id, start_date, end_date, days_count, reason, status, reviewed_at, reviewed_note)
    values (v_biz, v_siti, v_cuti, v_d1, v_d2, 2, 'Acara keluarga di luar kota', 'approved', v_d1 - 3, 'Disetujui')
    returning id into v_lr;
  update public.attendance set leave_request_id = v_lr where employee_id = v_siti and status = 'izin';
  insert into public.leave_requests (business_id, employee_id, leave_type_id, start_date, end_date, days_count, reason, status)
    values (v_biz, v_rudi, v_cuti, current_date + 7, current_date + 8, 2, 'Liburan keluarga', 'pending');
  insert into public.leave_requests (business_id, employee_id, leave_type_id, start_date, end_date, days_count, reason, status, reviewed_at, reviewed_note)
    values (v_biz, v_budi, v_unpaid, v_start + 5, v_start + 5, 1, 'Ingin libur di hari sibuk', 'rejected', v_start + 3, 'Hari itu stok datang, mohon hadir');

  -- Lembur: 3 disetujui (sesuai absensi Rudi), 1 menunggu, 1 ditolak
  insert into public.overtime_requests (business_id, employee_id, date, hours, reason, status, reviewed_at, reviewed_note)
  select v_biz, employee_id, date, overtime_hours, 'Stok opname / closing', 'approved', date + 1, 'Disetujui'
  from public.attendance where employee_id = v_rudi and overtime_hours > 0 order by date limit 3;
  insert into public.overtime_requests (business_id, employee_id, date, hours, reason, status)
    values (v_biz, v_rudi, current_date - 1, 2, 'Persiapan promo akhir pekan', 'pending');
  insert into public.overtime_requests (business_id, employee_id, date, hours, reason, status, reviewed_at, reviewed_note)
    values (v_biz, v_budi, v_start + 10, 3, 'Membereskan toko', 'rejected', v_start + 11, 'Tidak ada persetujuan di muka');

  insert into public.reimbursements (business_id, employee_id, date, category, amount, description, status, reviewed_at, reviewed_note) values
    (v_biz, v_budi, v_start + 6, 'transport', 75000, 'Ojek ke supplier', 'approved', v_start + 7, 'Disetujui'),
    (v_biz, v_siti, current_date - 2, 'perlengkapan', 120000, 'Beli lakban dan plastik packing', 'pending', null, null),
    (v_biz, v_dewi, v_start + 8, 'makan', 45000, 'Makan siang lembur', 'rejected', v_start + 9, 'Sudah dapat uang makan');

  insert into public.employee_advances (business_id, employee_id, date, amount, note) values
    (v_biz, v_andi, v_start + 9, 300000, 'Kasbon darurat'),
    (v_biz, v_dewi, v_start + 14, 200000, 'Kasbon keperluan sekolah anak');
  insert into public.employee_personal_loans (business_id, employee_id, date, amount, note)
    values (v_biz, v_rudi, v_start + 2, 2000000, 'Pinjaman renovasi rumah');

  raise notice 'Bagian 3 selesai. Lanjut Bagian 4.';
end
$$;
