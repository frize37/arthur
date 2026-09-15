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

  const body = await req.json();
  const { kind, name, email, specialty, commissionType, commissionValue, adminRole } = body as {
    kind: "advisor" | "admin";
    name?: string;
    email?: string;
    specialty?: string;
    commissionType?: "percent" | "fixed";
    commissionValue?: number;
    adminRole?: "admin" | "staff";
  };

  if (!name || !email || (kind !== "advisor" && kind !== "admin")) {
    return NextResponse.json({ ok: false, error: "חסרים פרטים." }, { status: 400 });
  }

  const password = generatePassword();

  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    return NextResponse.json({ ok: false, error: createErr?.message ?? "יצירת המשתמש נכשלה." }, { status: 500 });
  }

  if (kind === "admin") {
    const { error: insertErr } = await supabaseAdmin
      .from("admins")
      .insert({ auth_user_id: created.user.id, name, role: adminRole === "staff" ? "staff" : "admin" });
    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }
  } else {
    const { error: insertErr } = await supabaseAdmin.from("advisors").insert({
      auth_user_id: created.user.id,
      name,
      email,
      specialty: specialty || "יועץ משכנתאות",
      commission_type: commissionType === "fixed" ? "fixed" : "percent",
      commission_value: commissionValue ?? 10,
    });
    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, email, password });
}
