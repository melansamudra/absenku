"use client";

import { useTransition } from "react";
import { updateStaffRole, toggleStaffActive } from "./actions";

type Staff = { id: string; name: string; email: string; role: string; active: boolean };

export default function StaffRow({
  businessId,
  staff,
  roleLabel,
}: {
  businessId: string;
  staff: Staff;
  roleLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  function changeRole(role: string) {
    startTransition(async () => {
      const r = await updateStaffRole(businessId, staff.id, role);
      if (r.error) alert(r.error);
    });
  }

  function toggleActive() {
    startTransition(async () => {
      const r = await toggleStaffActive(businessId, staff.id, !staff.active);
      if (r.error) alert(r.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-medium text-zinc-900">
          {staff.name}
          {!staff.active && <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">Nonaktif</span>}
        </p>
        <p className="text-xs text-zinc-500">{staff.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={staff.role}
          onChange={(e) => changeRole(e.target.value)}
          disabled={pending}
          title={roleLabel}
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs disabled:opacity-60"
        >
          <option value="admin">Admin</option>
          <option value="hr">HR</option>
          <option value="staff">Staff</option>
        </select>
        <button
          type="button"
          onClick={toggleActive}
          disabled={pending}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
        >
          {staff.active ? "Nonaktifkan" : "Aktifkan"}
        </button>
      </div>
    </div>
  );
}
