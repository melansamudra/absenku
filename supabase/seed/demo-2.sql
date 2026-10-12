-- BAGIAN 2 dari 4 — absensi 1 bulan penuh bulan lalu (tanpa perlu ganti apa pun).
do $$
declare
  v_biz uuid;
  v_start date := date_trunc('month', current_date - interval '1 month')::date;
  v_end date := (date_trunc('month', current_date) - interval '1 day')::date;
  v_budi uuid; v_siti uuid; v_andi uuid; v_dewi uuid; v_rudi uuid;
begin
  select id into v_biz from public.businesses where name = 'Toko Demo Maju Jaya' order by created_at desc limit 1;
  if v_biz is null then raise exception 'Jalankan Bagian 1 dulu.'; end if;
  select id into v_budi from public.employees where business_id = v_biz and name = 'Budi Santoso';
  select id into v_siti from public.employees where business_id = v_biz and name = 'Siti Rahayu';
  select id into v_andi from public.employees where business_id = v_biz and name = 'Andi Pratama';
  select id into v_dewi from public.employees where business_id = v_biz and name = 'Dewi Lestari';
  select id into v_rudi from public.employees where business_id = v_biz and name = 'Rudi Hartono';

  insert into public.attendance (business_id, employee_id, date, status, note, late, late_minutes,
    check_in_at, check_out_at, overtime_hours, verified_by_admin, verified_at, shift_template_id)
  select v_biz, x.eid, x.dt, x.st, x.nt, (x.st = 'hadir' and x.lm > 0), x.lm,
    case when x.st = 'hadir' then (x.dt + x.s_in + make_interval(mins => x.lm)) at time zone 'Asia/Jakarta' end,
    case when x.st = 'hadir' then (x.dt + x.s_out + make_interval(mins => round(x.ot * 60)::int + x.r % 9)) at time zone 'Asia/Jakarta' end,
    case when x.st = 'hadir' then x.ot else 0 end,
    not (x.st = 'hadir' and x.eid in (v_andi, v_dewi) and x.wd_end <= 3),
    case when x.st = 'hadir' and x.eid in (v_andi, v_dewi) and x.wd_end <= 3 then null else now() end,
    x.shift_id
  from (
    select b.*,
      case
        when b.dt = (select holiday_date from public.payroll_holidays where business_id = v_biz limit 1) then 'off'
        when b.nm = 'Andi Pratama' and b.wd = 9 then 'alpa'
        when b.nm = 'Andi Pratama' and b.wd = 14 then 'izin'
        when b.nm = 'Dewi Lestari' and b.wd in (6, 7) then 'sakit'
        when b.nm = 'Siti Rahayu' and b.wd in (18, 19) then 'izin'
        when b.nm = 'Budi Santoso' and b.wd = 13 then 'izin'
        else 'hadir'
      end as st,
      case
        when b.dt = (select holiday_date from public.payroll_holidays where business_id = v_biz limit 1) then 'Libur perusahaan'
        when b.nm = 'Dewi Lestari' and b.wd in (6, 7) then 'Sakit demam, surat dokter menyusul'
        when b.nm = 'Siti Rahayu' and b.wd in (18, 19) then 'Cuti tahunan'
        when b.nm = 'Budi Santoso' and b.wd = 13 then 'Urusan keluarga'
      end as nt,
      case when b.r < 15 then 5 + (b.r * 3) % 40 else 0 end as lm,
      case
        when b.r < 15 then 0
        when b.nm = 'Rudi Hartono' and b.r % 3 = 0 then 1 + ((b.r / 3) % 4) * 0.5
        when b.nm in ('Budi Santoso', 'Andi Pratama') and b.r % 6 = 0 then 0.5 + ((b.r / 6) % 3) * 0.5
        else 0
      end::numeric as ot
    from (
      select e.id as eid, e.name as nm, d::date as dt,
        row_number() over (partition by e.id order by d) as wd,
        row_number() over (partition by e.id order by d desc) as wd_end,
        abs(hashtext(e.name || d::date::text)) % 100 as r,
        (select id from public.shift_templates where business_id = v_biz
           and name = case when e.name = 'Dewi Lestari' then 'Siang' else 'Reguler' end) as shift_id,
        case when e.name = 'Dewi Lestari' then time '12:00' else time '08:00' end as s_in,
        case when e.name = 'Dewi Lestari' then time '21:00' else time '17:00' end as s_out
      from public.employees e cross join generate_series(v_start, v_end, interval '1 day') d
      where e.business_id = v_biz and extract(isodow from d) <> 7
    ) b
  ) x;

  raise notice 'Bagian 2 selesai. Lanjut Bagian 3.';
end
$$;
