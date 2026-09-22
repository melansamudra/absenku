"use client";

import { useTransition } from "react";
import { setShiftAssignment } from "./actions";
import type { ShiftTemplate } from "./shift-templates-panel";

export default function AssignmentRow({
  businessId,
  date,
  employeeId,
  employeeName,
  templates,
  assignedShiftTemplateId,
}: {
  businessId: string;
  date: string;
  employeeId: string;
  employeeName: string;
  templates: ShiftTemplate[];
  assignedShiftTemplateId: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function handleChange(value: string) {
    startTransition(() => {
      setShiftAssignment(businessId, employeeId, date, value || null);
    });
  }

  return (
    <div className="flex items-center justify-between px-5 py-3">
      <p className="text-sm text-zinc-800">{employeeName}</p>
      <select
        defaultValue={assignedShiftTemplateId ?? ""}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm disabled:opacity-60"
      >
        <option value="">— Tidak ada shift —</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name} ({t.start_time.slice(0, 5)}–{t.end_time.slice(0, 5)})
          </option>
        ))}
      </select>
    </div>
  );
}
