import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const role = await getCurrentRole();
  if (role.kind !== "admin" || role.adminRole !== "admin") {
    return NextResponse.json({ ok: false, error: "רק מנהל מלא יכול לבצע פעולה זו." }, { status: 403 });
  }

  const { advisorId } = (await req.json()) as { advisorId?: string };
  if (!advisorId) {
    return NextResponse.json({ ok: false, error: "חסר מזהה יועץ." }, { status: 400 });
  }

  const { data: advisor, error: fetchErr } = await supabaseAdmin
    .from("advisors")
    .select("auth_user_id")
    .eq("id", advisorId)
    .maybeSingle();
  if (fetchErr) {
    return NextResponse.json({ ok: false, error: fetchErr.message }, { status: 500 });
  }

  const { error: deleteErr } = await supabaseAdmin.from("advisors").delete().eq("id", advisorId);
  if (deleteErr) {
    return NextResponse.json({ ok: false, error: deleteErr.message }, { status: 500 });
  }

  if (advisor?.auth_user_id) {
    await supabaseAdmin.auth.admin.deleteUser(advisor.auth_user_id);
  }

  return NextResponse.json({ ok: true });
}
