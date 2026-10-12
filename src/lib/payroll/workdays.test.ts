import { describe, expect, it } from "vitest";
import { scheduledWorkdays } from "./workdays";

describe("scheduledWorkdays", () => {
  it("September 2026, 6 hari kerja: 26 hari (30 hari − 4 Minggu)", () => {
    expect(scheduledWorkdays("2026-09-01", "2026-09-30", 6).size).toBe(26);
  });
  it("September 2026, 5 hari kerja: 22 hari", () => {
    expect(scheduledWorkdays("2026-09-01", "2026-09-30", 5).size).toBe(22);
  });
  it("tanggal merah dikeluarkan", () => {
    const days = scheduledWorkdays("2026-09-01", "2026-09-30", 6, new Set(["2026-09-17"]));
    expect(days.size).toBe(25);
    expect(days.has("2026-09-17")).toBe(false);
  });
  it("periode paruh bulan & batas inklusif", () => {
    expect(scheduledWorkdays("2026-09-01", "2026-09-07", 6).size).toBe(6); // Selasa–Senin, Minggu 6 Sep libur
    expect(scheduledWorkdays("2026-09-07", "2026-09-07", 6).size).toBe(1);
  });
});
