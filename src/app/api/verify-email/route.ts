import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { checkEmailVerification, createEmailVerification } from "@/lib/verification";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.mode === "send") {
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json({ ok: false, error: "כתובת מייל לא תקינה." }, { status: 400 });
    }
    try {
      const token = await createEmailVerification(email);
      return NextResponse.json({ ok: true, token });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Failed to send verification code:", message);
      return NextResponse.json({ ok: false, error: "שליחת הקוד נכשלה. נסו שוב.", detail: message }, { status: 500 });
    }
  }

  if (body.mode === "check") {
    const { token, email, code } = body;
    const valid =
      typeof token === "string" && typeof email === "string" && typeof code === "string" && checkEmailVerification(token, email, code);
    return NextResponse.json({ ok: valid });
  }

  return NextResponse.json({ ok: false, error: "בקשה לא תקינה." }, { status: 400 });
}
