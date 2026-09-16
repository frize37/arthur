import "server-only";
import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

function generatePassword(): string {
  return crypto.randomBytes(9).toString("base64url");
}

export async function POST(req: NextRequest) {
  const role = await getCurrentRole();
  if (role.kind !== "admin" || role.adminRole !== "admin") {
    return NextResponse.json({ ok: false, error: "רק מנהל מלא יכול לבצע פעולה זו." }, { status: 403 });
  }

  const { kind, id } = (await req.json()) as { kind?: "advisor" | "admin"; id?: string };
  if ((kind !== "advisor" && kind !== "admin") || !id) {
    return NextResponse.json({ ok: false, error: "חסרים פרטים." }, { status: 400 });
  }

  let authUserId: string;
  if (kind === "admin") {
    // admins.auth_user_id IS the row's primary key.
    authUserId = id;
  } else {
    const { data: advisor, error: fetchErr } = await supabaseAdmin.from("advisors").select("auth_user_id").eq("id", id).maybeSingle();
    if (fetchErr || !advisor) {
      return NextResponse.json({ ok: false, error: "היועץ לא נמצא." }, { status: 404 });
    }
    authUserId = advisor.auth_user_id;
  }

  const password = generatePassword();
  const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
  if (updateErr) {
    return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, password });
}
