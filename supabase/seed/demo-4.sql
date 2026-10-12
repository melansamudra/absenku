-- BAGIAN 4 dari 4 — tugas, kegiatan, surat SP/SK, papan informasi.
do $$
declare
  v_biz uuid;
  v_start date := date_trunc('month', current_date - interval '1 month')::date;
  v_end date := (date_trunc('month', current_date) - interval '1 day')::date;
  v_d1 date;
  v_budi uuid; v_siti uuid; v_andi uuid; v_dewi uuid; v_rudi uuid;
begin
  select id into v_biz from public.businesses where name = 'Toko Demo Maju Jaya' order by created_at desc limit 1;
  if v_biz is null then raise exception 'Jalankan Bagian 1 dulu.'; end if;
  select id into v_budi from public.employees where business_id = v_biz and name = 'Budi Santoso';
  select id into v_siti from public.employees where business_id = v_biz and name = 'Siti Rahayu';
  select id into v_andi from public.employees where business_id = v_biz and name = 'Andi Pratama';
  select id into v_dewi from public.employees where business_id = v_biz and name = 'Dewi Lestari';
  select id into v_rudi from public.employees where business_id = v_biz and name = 'Rudi Hartono';
  insert into public.employee_tasks (business_id, employee_id, title, description, due_date, status, completed_at) values
    (v_biz, v_siti, 'Stok opname gudang', 'Hitung ulang barang rak A–D dan catat selisih.', current_date + 3, 'in_progress', null),
    (v_biz, v_andi, 'Rapikan display etalase', null, current_date - 1, 'todo', null),
    (v_biz, v_budi, 'Rekap penjualan mingguan', 'Kirim ke owner tiap Senin.', current_date + 5, 'todo', null),
    (v_biz, v_rudi, 'Evaluasi jadwal shift bulan depan', null, current_date - 5, 'done', now() - interval '4 days'),
    (v_biz, v_dewi, 'Cek kebersihan area kasir', null, current_date + 1, 'in_progress', null);

  insert into public.employee_activities (business_id, employee_id, date, title, description) values
    (v_biz, v_siti, v_start + 4, 'Terima barang supplier', 'Cek 12 koli, semua sesuai nota.'),
    (v_biz, v_rudi, v_start + 11, 'Rapat evaluasi tim', 'Bahas target penjualan akhir bulan.'),
    (v_biz, v_andi, v_start + 15, 'Bantu pindah rak gudang', null),
    (v_biz, v_dewi, current_date - 3, 'Training kasir pegawai baru', 'Mengajari pemakaian mesin kasir.');

  select date into v_d1 from public.attendance where employee_id = v_andi and status = 'alpa' limit 1;
  insert into public.employee_letters (business_id, employee_id, kind, letter_number, issued_date, subject, body) values
    (v_biz, v_andi, 'sp1', '001/SP1/' || to_char(v_start, 'MM/YYYY'), v_d1 + 2, 'Surat Peringatan 1',
     'Dengan ini Toko Demo Maju Jaya memberikan surat peringatan pertama kepada:' || E'\n\n' || 'Nama: Andi Pratama' || E'\n\n'
     || 'karena tidak masuk kerja tanpa keterangan pada tanggal ' || to_char(v_d1, 'DD-MM-YYYY') || '.' || E'\n\n'
     || 'Apabila pelanggaran terulang kembali, perusahaan akan memberikan surat peringatan berikutnya sampai dengan pemutusan hubungan kerja.'),
    (v_biz, v_siti, 'sk', '001/SK/' || to_char(v_start, 'MM/YYYY'), v_start + 20, 'Surat Keterangan Kerja',
     'Yang bertanda tangan di bawah ini, pimpinan Toko Demo Maju Jaya, menerangkan bahwa:' || E'\n\n' || 'Nama: Siti Rahayu' || E'\n\n'
     || 'benar merupakan karyawan di Toko Demo Maju Jaya. Surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.');

  insert into public.announcements (business_id, title, body, category, pinned, expires_at, created_by) values
    (v_biz, 'Jadwal stok opname akhir bulan', 'Stok opname dilakukan Sabtu sore setelah toko tutup. Mohon semua tim hadir.', 'penting', true, current_date + 14, 'Admin'),
    (v_biz, 'Libur perusahaan', 'Toko libur pada hari jadi. Gaji tetap dihitung normal.', 'libur', false, null, 'Admin'),
    (v_biz, 'Pelatihan pelayanan pelanggan', 'Pelatihan singkat 1 jam, Jumat pukul 16.00 di ruang belakang.', 'acara', false, current_date + 7, 'Admin');

  raise notice 'Bagian 4 selesai. Data demo lengkap.';
end
$$;
