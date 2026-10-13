"use client";

import { useActionState } from "react";
import { inviteStaff, type StaffActionState } from "./actions";
import { inputClass } from "@/components/form-ui";

const initialState: StaffActionState = { error: null };

export default function InviteStaffForm({ businessId }: { businessId: string }) {
  const [state, formAction, pending] = useActionState(inviteStaff.bind(null, businessId), initialState);

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
      <input name="name" required placeholder="Nama" className={inputClass} />
      <input name="email" type="email" required placeholder="Email (sudah punya akun HrCash)" className={inputClass} />
      <select name="role" required defaultValue="hr" className={inputClass}>
        <option value="admin">Admin</option>
        <option value="hr">HR</option>
        <option value="staff">Staff</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Mengundang…" : "Undang"}
      </button>
      {state.error && (
        <p className="sm:col-span-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>
      )}
    </form>
  );
}
