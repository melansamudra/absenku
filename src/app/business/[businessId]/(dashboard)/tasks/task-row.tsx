"use client";

import { deleteTask, setTaskStatus } from "./actions";

export type TaskItem = {
  id: string;
  employeeName: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  status: "todo" | "in_progress" | "done";
  overdue: boolean;
};

const STATUS_LABEL = {
  todo: { label: "Belum mulai", className: "bg-zinc-100 text-zinc-600" },
  in_progress: { label: "Dikerjakan", className: "bg-amber-50 text-amber-700" },
  done: { label: "Selesai", className: "bg-emerald-50 text-emerald-700" },
} as const;

export default function TaskRow({ businessId, task }: { businessId: string; task: TaskItem }) {
  const status = STATUS_LABEL[task.status];
  return (
    <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-zinc-900">{task.title}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {task.employeeName}
          {task.dueDate ? ` · tenggat ${task.dueDate}` : ""}
          {task.overdue && <span className="font-semibold text-red-600"> · terlambat</span>}
        </p>
        {task.description && <p className="mt-0.5 text-xs text-zinc-400">{task.description}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
          {status.label}
        </span>
        <select
          aria-label="Ubah status"
          value={task.status}
          onChange={(e) => setTaskStatus(businessId, task.id, e.target.value as TaskItem["status"])}
          className="rounded-lg border border-zinc-200 px-2 py-1 text-xs"
        >
          <option value="todo">Belum mulai</option>
          <option value="in_progress">Dikerjakan</option>
          <option value="done">Selesai</option>
        </select>
        <button
          type="button"
          onClick={() => {
            if (confirm("Hapus tugas ini?")) deleteTask(businessId, task.id);
          }}
          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
