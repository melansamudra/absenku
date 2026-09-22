"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.session) {
          router.push("/dashboard");
          return;
        }
        setCheckingSession(false);
      })
      .catch(() => {
        if (cancelled) return;
        setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      setLoading(false);

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
      setError("Gagal terhubung ke server. Cek koneksi internet lalu coba lagi.");
    }
  }

  if (checkingSession) {
    return (
      <AuthShell>
        <p className="text-center text-sm text-zinc-400">Memeriksa sesi…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/20">
          <span className="text-lg font-bold text-white">A</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Masuk</h1>
        <p className="mt-1 text-sm text-zinc-500">Masuk ke akun ABSENKU kamu</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-zinc-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-shadow focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="email@bisnis.com"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-medium text-zinc-600">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition-shadow focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-zinc-500">
        Belum punya akun?{" "}
        <Link href="/signup" className="font-medium text-brand-600 hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </AuthShell>
  );
}
