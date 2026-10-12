import { describe, expect, it } from "vitest";
import { bpjsWageBase, calculateBpjs } from "./bpjs";

const cfg = { jkkRatePercent: 0.24, jpWageCap: 10_547_400, kesehatanWageCap: 12_000_000 };
const all = { kesehatan: true, ketenagakerjaan: true };

describe("BPJS", () => {
  it("upah Rp4.800.000: bagian karyawan 1% + 2% + 1%", () => {
    const r = calculateBpjs(4_800_000, all, cfg);
    expect(r.employee).toEqual({ kesehatan: 48_000, jht: 96_000, jp: 48_000, total: 192_000 });
  });
  it("bagian perusahaan: Kes 4%, JHT 3,7%, JP 2%, JKK 0,24%, JKM 0,3%", () => {
    const r = calculateBpjs(4_800_000, all, cfg);
    expect(r.employer).toEqual({ kesehatan: 192_000, jht: 177_600, jp: 96_000, jkk: 11_520, jkm: 14_400, total: 491_520 });
  });
  it("upah di atas batas: Kesehatan & JP dibatasi, JHT tidak", () => {
    const r = calculateBpjs(20_000_000, all, cfg);
    expect(r.employee.kesehatan).toBe(120_000);
    expect(r.employee.jp).toBe(105_474);
    expect(r.employee.jht).toBe(400_000);
  });
  it("peserta hanya Kesehatan / hanya Ketenagakerjaan / tidak ikut", () => {
    expect(calculateBpjs(5_000_000, { kesehatan: true, ketenagakerjaan: false }, cfg).employee.total).toBe(50_000);
    expect(calculateBpjs(5_000_000, { kesehatan: false, ketenagakerjaan: true }, cfg).employee.total).toBe(150_000);
    expect(calculateBpjs(5_000_000, { kesehatan: false, ketenagakerjaan: false }, cfg).employee.total).toBe(0);
  });
  it("upah dasar: override jika diisi, kalau tidak gaji pokok + tunjangan tetap", () => {
    expect(bpjsWageBase(null, 4_000_000, 300_000)).toBe(4_300_000);
    expect(bpjsWageBase(3_000_000, 4_000_000, 300_000)).toBe(3_000_000);
  });
});
