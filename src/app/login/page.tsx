"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArthurMascot } from "@/components/ArthurMascot";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setLoading(false);
      setError("אימייל או סיסמה שגויים.");
      return;
    }

    const { data: admin } = await supabase.from("admins").select("auth_user_id").eq("auth_user_id", data.user.id).maybeSingle();
    if (admin) {
      router.push("/admin");
      router.refresh();
      return;
    }

    const { data: advisor } = await supabase.from("advisors").select("id").eq("auth_user_id", data.user.id).maybeSingle();
    if (advisor) {
      router.push("/advisor");
      router.refresh();
      return;
    }

    setLoading(false);
    setError("החשבון הזה מאומת אבל לא משויך ליועץ או למנהל. פנו לצוות התפעול.");
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-5xl mx-auto flex items-center gap-2.5 px-5 py-3.5">
          <Link href="/">
            <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={220} height={110} className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center gap-5 text-center">
          <ArthurMascot className="w-16 h-16" />
          <div>
            <h1 className="text-2xl">כניסה למערכת</h1>
            <p className="text-ink-soft text-sm pt-2">ליועצים ולצוות התפעול.</p>
          </div>

          <div className="w-full flex flex-col gap-3 text-start">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft" htmlFor="email">אימייל</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink-soft" htmlFor="password">סיסמה</label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="w-full rounded-xl bg-[color-mix(in_srgb,var(--risk)_14%,transparent)] text-[var(--risk)] text-sm px-3.5 py-2.5 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-display font-bold text-sm rounded-xl bg-accent text-[var(--hero-1)] px-5 py-3 shadow-[0_12px_22px_-12px_color-mix(in_srgb,var(--accent)_65%,transparent)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? "מתחברים…" : "כניסה"}
          </button>
        </form>
      </main>
    </div>
  );
}
