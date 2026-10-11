"use client";

import { useState, useTransition } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { btnPrimary, inputClass } from "@/components/form-ui";
import { addMasterItem, deleteMasterItem, renameMasterItem, type MasterKind } from "./actions";

export type MasterItem = { id: string; name: string; used: number };

const TABS: { key: MasterKind; label: string; noun: string }[] = [
  { key: "organizations", label: "Organisasi", noun: "organisasi" },
  { key: "positions", label: "Jabatan", noun: "jabatan" },
  { key: "ranks", label: "Pangkat", noun: "pangkat" },
];

export default function MasterManager({
  businessId,
  data,
}: {
  businessId: string;
  data: Record<MasterKind, MasterItem[]>;
}) {
  const [tab, setTab] = useState<MasterKind>("organizations");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const current = TABS.find((t) => t.key === tab)!;
  const items = data[tab];

  function run(fn: () => Promise<{ error: string | null }>, after?: () => void) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else after?.();
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 p-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setEditing(null);
              setError(null);
            }}
            className={`shrink-0 rounded-lg border px-4 py-1.5 text-[13px] ${
              tab === t.key
                ? "border-brand-500 bg-white font-semibold text-brand-700"
                : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {t.label} <span className="text-zinc-400">({data[t.key].length})</span>
          </button>
        ))}
      </div>

      <form
        className="flex gap-2 border-b border-zinc-100 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => addMasterItem(businessId, tab, draft), () => setDraft(""));
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Nama ${current.noun} baru`}
          className={inputClass}
        />
        <button type="submit" disabled={pending || !draft.trim()} className={btnPrimary}>
          <Plus size={14} /> Tambah
        </button>
      </form>

      {error && <p className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-400">Belum ada data {current.noun}.</p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-3 px-4 py-3">
              {editing === it.id ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") run(() => renameMasterItem(businessId, tab, it.id, editName), () => setEditing(null));
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => renameMasterItem(businessId, tab, it.id, editName), () => setEditing(null))}
                    className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                    aria-label="Simpan"
                  >
                    <Check size={16} />
                  </button>
                  <button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100" aria-label="Batal">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[13px] font-medium text-zinc-900">{it.name}</span>
                  <span className="text-xs text-zinc-400">{it.used} karyawan</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(it.id);
                      setEditName(it.name);
                      setError(null);
                    }}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                    aria-label="Ubah nama"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      const warn = it.used > 0 ? ` ${it.used} karyawan yang memakainya akan dikosongkan ${current.noun}-nya.` : "";
                      if (confirm(`Hapus ${current.noun} "${it.name}"?${warn}`)) run(() => deleteMasterItem(businessId, tab, it.id));
                    }}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Hapus"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
