"use client";

import { useTransition } from "react";
import { setWeeklySchedule } from "../actions";
import type { ShiftTemplate } from "../shift-templates-panel";

export default function WeeklyScheduleRow({
  businessId,
  employeeId,
  weekday,
  templates,
  assignedShiftTemplateId,
}: {
  businessId: string;
  employeeId: string;
  weekday: number;
  templates: ShiftTemplate[];
  assignedShiftTemplateId: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(() => {
      setWeeklySchedule(businessId, employeeId, weekday, value || null);
    });
  }

  return (
    <select
      defaultValue={assignedShiftTemplateId ?? ""}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs disabled:opacity-60"
    >
      <option value="">Libur</option>
      {templates.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </select>
  );
}
