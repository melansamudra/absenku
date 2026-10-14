import { describe, expect, it } from "vitest";
import { selfieRetentionCutoff } from "./selfie";

describe("selfieRetentionCutoff", () => {
  it("mundur 30 hari dari tanggal sekarang", () => {
    expect(selfieRetentionCutoff(new Date("2026-10-14T10:00:00Z"))).toBe("2026-09-14");
  });
  it("melewati batas bulan dan tahun", () => {
    expect(selfieRetentionCutoff(new Date("2027-01-10T00:00:00Z"))).toBe("2026-12-11");
  });
});
