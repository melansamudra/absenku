-- BAGIAN 1 dari 4 — bisnis demo, pengaturan, shift, jenis cuti, 10 karyawan.
-- Ganti email di bawah dengan email akun demo (tetap pakai tanda kutip).
do $$
declare
  v_email text := 'GANTI_DENGAN_EMAIL_AKUN_DEMO';
  v_user uuid;
  v_biz uuid;
  v_start date := date_trunc('month', current_date - interval '1 month')::date;
  v_end date := (date_trunc('month', current_date) - interval '1 day')::date;
  v_holiday date;
  v_reg uuid; v_siang uuid;
begin
  select id into v_user from auth.users where lower(email) = lower(v_email);
  if v_user is null then
    raise exception 'Akun % tidak ditemukan. Daftar dulu lewat /signup.', v_email;
  end if;
  v_holiday := v_start + 16;
  if extract(isodow from v_holiday) = 7 then v_holiday := v_holiday + 1; end if;

  delete from public.businesses where owner_id = v_user and name = 'Toko Demo Maju Jaya';

  insert into public.businesses (owner_id, name, address, phone, work_start_time, work_end_time,
    izin_deduction_mode, pph21_enabled, bpjs_enabled, overtime_rate_mode, work_days_per_week,
    overtime_approval_required, attendance_pin_required)
  values (v_user, 'Toko Demo Maju Jaya', 'Jl. Contoh No. 12, Jakarta Selatan', '021-5551234',
    '08:00', '17:00', 'full_day', true, true, 'pp35', 6, true, true)
  returning id into v_biz;

  insert into public.late_deduction_tiers (business_id, threshold_minutes, amount)
    values (v_biz, 15, 10000), (v_biz, 30, 25000), (v_biz, 60, 50000);
  insert into public.payroll_holidays (business_id, holiday_date, label)
    values (v_biz, v_holiday, 'Libur Perusahaan (Hari Jadi)');

  insert into public.shift_templates (business_id, name, start_time, end_time)
    values (v_biz, 'Reguler', '08:00', '17:00') returning id into v_reg;
  insert into public.shift_templates (business_id, name, start_time, end_time)
    values (v_biz, 'Siang', '12:00', '21:00') returning id into v_siang;

  insert into public.leave_types (business_id, name, default_days_per_year, paid) values
    (v_biz, 'Cuti Tahunan', 12, true),
    (v_biz, 'Cuti Sakit (surat dokter)', 14, true),
    (v_biz, 'Izin Tanpa Gaji', 5, false);

  -- PIN: Budi 1111, Siti 2222, Andi 3333, Dewi 4444, Rudi 5555,
  --      Agus 6666, Maya 7777, Hendra 8888, Nina 9999, Fajar 1212
  insert into public.employees (business_id, name, note, salary_type, daily_rate, monthly_rate,
    daily_meal_allowance, daily_attendance_allowance, ptkp_status, join_date, nik,
    bank_name, bank_account_number, bank_account_name, bpjs_kesehatan, bpjs_ketenagakerjaan,
    contract_end, attendance_pin_hash)
  values
    (v_biz, 'Budi Santoso', 'Kasir', 'bulanan', 0, 4500000, 15000, 10000, 'K/1', '2024-02-01',
      '3201010101900001', 'BCA', '1234567890', 'Budi Santoso', true, true, null, convert_from(decode('7363727970742463383736323939383636353337323330366435663261303263316636613137622465633330393537656331343638376464306661633031653661366364383036333532313262653466383632323134666265303966343161636634663737663165','hex'),'utf8')),
    (v_biz, 'Siti Rahayu', 'Admin & Gudang', 'bulanan', 0, 5200000, 15000, 10000, 'K/0', '2023-08-15',
      '3201010202920002', 'Mandiri', '9876543210', 'Siti Rahayu', true, true, null, convert_from(decode('7363727970742437363062646164393237336266666562616634633033346662383330393332352430383931356561656539336338623031636233393265366632303764323261623762393164613032326430333634613964656132333535383761396236383630','hex'),'utf8')),
    (v_biz, 'Andi Pratama', 'Pelayan', 'harian', 150000, 0, 15000, 0, 'TK/0', '2025-06-01',
      '3201010303980003', 'BRI', '5566778899', 'Andi Pratama', false, false, current_date + 20, convert_from(decode('7363727970742462636636376665386537643765636138313638623563666334336530666136322462636337633838363837653634313335376135643261336235633334373366613065666533636630303737646162383765316631396562393163393633316566','hex'),'utf8')),
    (v_biz, 'Dewi Lestari', 'Kasir shift siang', 'harian', 160000, 0, 15000, 5000, 'TK/1', '2025-01-10',
      '3201010404950004', 'DANA', '081234567890', 'Dewi Lestari', false, false, null, convert_from(decode('7363727970742464323732396437656635643564386562396433653933306231303431393961312462346635613831396437343336663932633238353533343232636161663164636635613233366165393435356431613339353234383563313861363435643930','hex'),'utf8')),
    (v_biz, 'Rudi Hartono', 'Supervisor', 'bulanan', 0, 7500000, 20000, 15000, 'K/2', '2022-03-01',
      '3201010505880005', 'BNI', '1122334455', 'Rudi Hartono', true, true, null, convert_from(decode('7363727970742461366563303835646335623965366164346537343336643963393762613639302463393066396232376264313864346539666531303833663632613336386563623362373836353737633466393637326338306466326665666261306331643264','hex'),'utf8')),
    (v_biz, 'Agus Setiawan', 'Pelayan', 'harian', 150000, 0, 15000, 0, 'TK/0', '2024-11-01',
      '3201010606990006', 'BCA', '2233445566', 'Agus Setiawan', false, false, null, convert_from(decode('7363727970742466626239616433616161353461666533313037393463356233616436396635382463316264656261393665383431643230353032666435396436366636666561353630333431626534626264343436623533383939653562633765336433343633','hex'),'utf8')),
    (v_biz, 'Maya Anggraini', 'Kasir', 'bulanan', 0, 4600000, 15000, 10000, 'K/0', '2023-05-01',
      '3201010707930007', 'Mandiri', '3344556677', 'Maya Anggraini', true, true, null, convert_from(decode('7363727970742439316362343864653862376230626661393931316431366538346137613863332463646331656465396238346337663239626232323835376535626636323664333638313065656539313239316137633437313439626533343563623238333266','hex'),'utf8')),
    (v_biz, 'Hendra Wijaya', 'Gudang & Stok', 'harian', 155000, 0, 15000, 0, 'TK/1', '2024-01-15',
      '3201010808970008', 'BRI', '4455667788', 'Hendra Wijaya', false, false, current_date + 45, convert_from(decode('7363727970742433383435306561346332383632363533306365333937316539343436646136612466383238613138663735303937643131383939636632623639343839613437323933356635663230373666613736626462643466316533663965353637336134','hex'),'utf8')),
    (v_biz, 'Nina Kartika', 'Kasir shift siang', 'harian', 160000, 0, 15000, 5000, 'TK/0', '2025-03-01',
      '3201010909960009', 'DANA', '082345678901', 'Nina Kartika', false, false, null, convert_from(decode('7363727970742439616431623734383935353666626664336231366532303635333333373137652465366266376236306334333837336635633533386662373964326639323865313037616531376532666134623334393531616665373636383566386133376534','hex'),'utf8')),
    (v_biz, 'Fajar Ramadhan', 'Office Boy', 'harian', 140000, 0, 10000, 0, 'TK/0', '2025-09-01',
      '3201011010000010', 'BNI', '5566778899', 'Fajar Ramadhan', false, false, null, convert_from(decode('7363727970742436383338353166323034373437623036653438613163643837303961326238322430343331313339393137613330653237393834303530326337303533636532653438346661396366633036323339373532393734653137386636346339326232','hex'),'utf8'));

  -- Jadwal shift Senin–Sabtu (Dewi & Nina shift siang, lainnya reguler)
  insert into public.employee_shift_assignments (business_id, employee_id, date, shift_template_id)
  select v_biz, e.id, d::date, case when e.name in ('Dewi Lestari', 'Nina Kartika') then v_siang else v_reg end
  from public.employees e cross join generate_series(v_start, v_end, interval '1 day') d
  where e.business_id = v_biz and extract(isodow from d) <> 7;

  insert into public.employee_recurring_allowances (business_id, employee_id, label, amount)
  select v_biz, id, 'Tunjangan Jabatan', case when name = 'Rudi Hartono' then 750000 else 300000 end
  from public.employees where business_id = v_biz and name in ('Budi Santoso', 'Rudi Hartono');

  raise notice 'Bagian 1 selesai. Lanjut Bagian 2.';
end
$$;
