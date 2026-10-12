-- BAGIAN 1 dari 4 — bisnis demo, pengaturan, shift, jenis cuti, 5 karyawan.
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

  -- PIN: Budi 1111, Siti 2222, Andi 3333, Dewi 4444, Rudi 5555
  insert into public.employees (business_id, name, note, salary_type, daily_rate, monthly_rate,
    daily_meal_allowance, daily_attendance_allowance, ptkp_status, join_date, nik,
    bank_name, bank_account_number, bank_account_name, bpjs_kesehatan, bpjs_ketenagakerjaan,
    contract_end, attendance_pin_hash)
  values
    (v_biz, 'Budi Santoso', 'Kasir', 'bulanan', 0, 4500000, 15000, 10000, 'K/1', '2024-02-01',
      '3201010101900001', 'BCA', '1234567890', 'Budi Santoso', true, true, null, convert_from(decode('7363727970742435613931356637333964356662313438313737303133396261656532303332642464313036303931386662323736306261323237383832373732376563663462653330306432393239366161616665386465306436663030663663376337356364','hex'),'utf8')),
    (v_biz, 'Siti Rahayu', 'Admin & Gudang', 'bulanan', 0, 5200000, 15000, 10000, 'K/0', '2023-08-15',
      '3201010202920002', 'Mandiri', '9876543210', 'Siti Rahayu', true, true, null, convert_from(decode('7363727970742464393865343631363836343536373939353733666464366239363233356532622438376431313536396236343138313434346664343466366461373564346434613865323833646135356133633731653166353562336664313861373061373132','hex'),'utf8')),
    (v_biz, 'Andi Pratama', 'Pelayan', 'harian', 150000, 0, 15000, 0, 'TK/0', '2025-06-01',
      '3201010303980003', 'BRI', '5566778899', 'Andi Pratama', false, false, current_date + 20, convert_from(decode('7363727970742438663634646361313436336238633762653365613730303436646361356662662431393034653863383139373838323036303562346338303034373366393233343764303961346534343164393934613633316130366230313461343735363766','hex'),'utf8')),
    (v_biz, 'Dewi Lestari', 'Kasir shift siang', 'harian', 160000, 0, 15000, 5000, 'TK/1', '2025-01-10',
      '3201010404950004', 'DANA', '081234567890', 'Dewi Lestari', false, false, null, convert_from(decode('7363727970742435356336656636333561373962623031633065313262656334626561313036382439316239653261313863636334313963666231376461623833646430373437323865396565633036633263663735316263643166623235666636383639393033','hex'),'utf8')),
    (v_biz, 'Rudi Hartono', 'Supervisor', 'bulanan', 0, 7500000, 20000, 15000, 'K/2', '2022-03-01',
      '3201010505880005', 'BNI', '1122334455', 'Rudi Hartono', true, true, null, convert_from(decode('7363727970742465303266333465636633393939383937383862366533366438663263643764342463393464313134643737373634356531333236613437383032666237343731306361623130656133383632623565393263383733353832626630393465303961','hex'),'utf8'));

  -- Jadwal shift Senin–Sabtu (Dewi shift siang, lainnya reguler)
  insert into public.employee_shift_assignments (business_id, employee_id, date, shift_template_id)
  select v_biz, e.id, d::date, case when e.name = 'Dewi Lestari' then v_siang else v_reg end
  from public.employees e cross join generate_series(v_start, v_end, interval '1 day') d
  where e.business_id = v_biz and extract(isodow from d) <> 7;

  insert into public.employee_recurring_allowances (business_id, employee_id, label, amount)
  select v_biz, id, 'Tunjangan Jabatan', case when name = 'Rudi Hartono' then 750000 else 300000 end
  from public.employees where business_id = v_biz and name in ('Budi Santoso', 'Rudi Hartono');

  raise notice 'Bagian 1 selesai. Lanjut Bagian 2.';
end
$$;
