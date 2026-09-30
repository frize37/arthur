"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArthurMascot } from "@/components/ArthurMascot";
import { SiteFooter } from "@/components/SiteFooter";
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
    <div className="min-h-full flex flex-col bg-desk">
      <header>
        <div className="max-w-[1320px] mx-auto flex items-center px-[clamp(16px,4vw,48px)] h-20">
          <Link href="/" aria-label="ארתור — עמוד הבית">
            <Image src="/brand/arthur-wordmark.png" alt="ארתור" width={280} height={140} className="h-12 w-auto brightness-0 invert" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-14">
        <div className="relative w-full max-w-md">
          <ArthurMascot className="absolute -top-24 left-2 w-32 h-32 z-10 drop-shadow-[0_16px_16px_rgba(0,0,0,0.45)]" />
          <form onSubmit={handleSubmit} className="relative bg-folder rounded-[20px] p-4 sm:p-5">
            <div className="bg-surface rounded-md shadow-[var(--shadow-paper)] px-6 py-7 flex flex-col gap-5">
              <div className="border-b-2 border-ink pb-3">
                <h1 className="text-3xl">כניסה למערכת</h1>
                <p className="text-ink-soft text-sm pt-1.5 font-semibold">ליועצים ולצוות התפעול.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-ink-soft" htmlFor="email">אימייל</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border-[1.5px] border-line-strong bg-white px-3.5 py-2.5 text-base text-right focus:border-folder outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-ink-soft" htmlFor="password">סיסמה</label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border-[1.5px] border-line-strong bg-white px-3.5 py-2.5 text-base focus:border-folder outline-none transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-lg border-[1.5px] border-stamp text-stamp text-sm font-bold px-3.5 py-2.5">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full font-display text-lg rounded-lg bg-folder text-white px-5 py-3 shadow-[0_12px_22px_-12px_rgba(26,58,110,0.9)] transition hover:-translate-y-0.5 hover:bg-desk disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? "מתחברים…" : "כניסה"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
