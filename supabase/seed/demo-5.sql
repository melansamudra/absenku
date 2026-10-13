-- BAGIAN 5 dari 5 — modul KPI: 2 formulir contoh (template umum dari kami +
-- 1 custom), dan 1 jadwal penilaian bulan lalu dengan beberapa karyawan
-- sudah dinilai (buat lihat laporan KPI langsung terisi).
do $$
declare
  v_biz uuid;
  v_start date := date_trunc('month', current_date - interval '1 month')::date;
  v_end date := (date_trunc('month', current_date) - interval '1 day')::date;
  v_form_umum uuid; v_form_custom uuid; v_sched uuid;
  v_ind_disiplin uuid; v_ind_kualitas uuid; v_ind_produktif uuid; v_ind_kerjasama uuid; v_ind_inisiatif uuid;
  v_budi uuid; v_siti uuid; v_andi uuid; v_dewi uuid; v_rudi uuid; v_hendra uuid;
  v_review uuid;
begin
  select id into v_biz from public.businesses where name = 'Toko Demo Maju Jaya' order by created_at desc limit 1;
  if v_biz is null then raise exception 'Jalankan Bagian 1 dulu.'; end if;
  select id into v_budi from public.employees where business_id = v_biz and name = 'Budi Santoso';
  select id into v_siti from public.employees where business_id = v_biz and name = 'Siti Rahayu';
  select id into v_andi from public.employees where business_id = v_biz and name = 'Andi Pratama';
  select id into v_dewi from public.employees where business_id = v_biz and name = 'Dewi Lestari';
  select id into v_rudi from public.employees where business_id = v_biz and name = 'Rudi Hartono';
  select id into v_hendra from public.employees where business_id = v_biz and name = 'Hendra Wijaya';

  delete from public.kpi_forms where business_id = v_biz and name in
    ('Template Cashimpact: Evaluasi Kinerja Umum', 'Custom: Evaluasi Kasir & Pelayanan');

  -- Formulir 1: template umum dari kami, cocok untuk kebanyakan bisnis.
  insert into public.kpi_forms (business_id, name, description, status)
    values (v_biz, 'Template Cashimpact: Evaluasi Kinerja Umum',
      'Formulir bawaan — cocok dipakai langsung untuk evaluasi kinerja karyawan secara umum.', 'active')
    returning id into v_form_umum;
  insert into public.kpi_indicators (business_id, form_id, name, description, weight, sort_order) values
    (v_biz, v_form_umum, 'Kedisiplinan & Kehadiran', 'Ketepatan waktu datang/pulang, kepatuhan jadwal.', 25, 1),
    (v_biz, v_form_umum, 'Kualitas Kerja', 'Ketelitian dan hasil kerja sesuai standar.', 25, 2),
    (v_biz, v_form_umum, 'Produktivitas', 'Jumlah/kecepatan pekerjaan yang diselesaikan.', 20, 3),
    (v_biz, v_form_umum, 'Kerja Sama Tim', 'Komunikasi dan kolaborasi dengan rekan kerja.', 15, 4),
    (v_biz, v_form_umum, 'Inisiatif', 'Proaktif menyelesaikan masalah tanpa diminta.', 15, 5);
  select id into v_ind_disiplin from public.kpi_indicators where form_id = v_form_umum and name = 'Kedisiplinan & Kehadiran';
  select id into v_ind_kualitas from public.kpi_indicators where form_id = v_form_umum and name = 'Kualitas Kerja';
  select id into v_ind_produktif from public.kpi_indicators where form_id = v_form_umum and name = 'Produktivitas';
  select id into v_ind_kerjasama from public.kpi_indicators where form_id = v_form_umum and name = 'Kerja Sama Tim';
  select id into v_ind_inisiatif from public.kpi_indicators where form_id = v_form_umum and name = 'Inisiatif';

  -- Formulir 2: contoh custom, dibuat sendiri untuk peran spesifik (kasir/pelayanan).
  insert into public.kpi_forms (business_id, name, description, status)
    values (v_biz, 'Custom: Evaluasi Kasir & Pelayanan',
      'Contoh formulir yang disesuaikan sendiri — fokus ke peran kasir dan pelayanan pelanggan.', 'active')
    returning id into v_form_custom;
  insert into public.kpi_indicators (business_id, form_id, name, description, weight, sort_order) values
    (v_biz, v_form_custom, 'Kecepatan Layani Pelanggan', null, 30, 1),
    (v_biz, v_form_custom, 'Keakuratan Transaksi Kasir', null, 30, 2),
    (v_biz, v_form_custom, 'Kebersihan Area Kerja', null, 20, 3),
    (v_biz, v_form_custom, 'Keramahan ke Pelanggan', null, 20, 4);

  -- Jadwal penilaian bulan lalu pakai formulir template umum.
  insert into public.kpi_schedules (business_id, form_id, name, observe_start, observe_end, status)
    values (v_biz, v_form_umum, 'Evaluasi Bulanan — ' || to_char(v_start, 'TMMonth YYYY'), v_start, v_end, 'active')
    returning id into v_sched;

  -- 5 karyawan sudah dinilai (variasi skor), Andi masih menunggu (contoh antrean).
  insert into public.kpi_reviews (business_id, schedule_id, employee_id, status, total_score, notes, reviewed_at)
    values (v_biz, v_sched, v_budi, 'done', 86.85, 'Kinerja solid, konsisten tiap bulan.', v_end + 2)
    returning id into v_review;
  insert into public.kpi_review_scores (business_id, review_id, indicator_id, score) values
    (v_biz, v_review, v_ind_disiplin, 90), (v_biz, v_review, v_ind_kualitas, 85),
    (v_biz, v_review, v_ind_produktif, 88), (v_biz, v_review, v_ind_kerjasama, 90),
    (v_biz, v_review, v_ind_inisiatif, 80);

  insert into public.kpi_reviews (business_id, schedule_id, employee_id, status, total_score, notes, reviewed_at)
    values (v_biz, v_sched, v_siti, 'done', 86.25, 'Administrasi rapi, komunikasi baik.', v_end + 2)
    returning id into v_review;
  insert into public.kpi_review_scores (business_id, review_id, indicator_id, score) values
    (v_biz, v_review, v_ind_disiplin, 85), (v_biz, v_review, v_ind_kualitas, 90),
    (v_biz, v_review, v_ind_produktif, 85), (v_biz, v_review, v_ind_kerjasama, 85),
    (v_biz, v_review, v_ind_inisiatif, 85);

  insert into public.kpi_reviews (business_id, schedule_id, employee_id, status, total_score, notes, reviewed_at)
    values (v_biz, v_sched, v_rudi, 'done', 92.95, 'Memimpin tim dengan baik, inisiatif tinggi.', v_end + 3)
    returning id into v_review;
  insert into public.kpi_review_scores (business_id, review_id, indicator_id, score) values
    (v_biz, v_review, v_ind_disiplin, 95), (v_biz, v_review, v_ind_kualitas, 92),
    (v_biz, v_review, v_ind_produktif, 90), (v_biz, v_review, v_ind_kerjasama, 95),
    (v_biz, v_review, v_ind_inisiatif, 93);

  insert into public.kpi_reviews (business_id, schedule_id, employee_id, status, total_score, notes, reviewed_at)
    values (v_biz, v_sched, v_dewi, 'done', 79.15, 'Cukup baik, perlu tingkatkan ketelitian.', v_end + 2)
    returning id into v_review;
  insert into public.kpi_review_scores (business_id, review_id, indicator_id, score) values
    (v_biz, v_review, v_ind_disiplin, 80), (v_biz, v_review, v_ind_kualitas, 78),
    (v_biz, v_review, v_ind_produktif, 82), (v_biz, v_review, v_ind_kerjasama, 80),
    (v_biz, v_review, v_ind_inisiatif, 75);

  insert into public.kpi_reviews (business_id, schedule_id, employee_id, status, total_score, notes, reviewed_at)
    values (v_biz, v_sched, v_hendra, 'done', 71.20, 'Masih perlu bimbingan, baru beberapa bulan kerja.', v_end + 3)
    returning id into v_review;
  insert into public.kpi_review_scores (business_id, review_id, indicator_id, score) values
    (v_biz, v_review, v_ind_disiplin, 70), (v_biz, v_review, v_ind_kualitas, 72),
    (v_biz, v_review, v_ind_produktif, 75), (v_biz, v_review, v_ind_kerjasama, 70),
    (v_biz, v_review, v_ind_inisiatif, 68);

  -- Andi: belum dinilai (contoh antrean evaluasi yang masih pending).
  insert into public.kpi_reviews (business_id, schedule_id, employee_id, status)
    values (v_biz, v_sched, v_andi, 'pending');

  raise notice 'Bagian 5 selesai. Data demo KPI lengkap.';
end
$$;
