import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { sendAdvisorAssignedEmail, sendAdvisorJoinRequestEmail, sendCaseSubmittedEmails, sendOfferSubmittedEmail, sendWinnerChosenEmails } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  try {
    switch (type) {
      case "case-submitted":
        await sendCaseSubmittedEmails(body);
        break;
      case "advisor-assigned":
        await sendAdvisorAssignedEmail(body);
        break;
      case "winner-chosen":
        await sendWinnerChosenEmails(body);
        break;
      case "advisor-join": {
        // Public form on the login page: keep only short, plain fields.
        const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
        const name = clean(body.name, 80), phone = clean(body.phone, 30), email = clean(body.email, 120);
        if (!name || !phone || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
          return NextResponse.json({ ok: false, error: "חסרים שם, טלפון או מייל תקין." }, { status: 400 });
        }
        const sent = await sendAdvisorJoinRequestEmail({ name, phone, email, specialty: clean(body.specialty, 120) });
        if (!sent.ok) return NextResponse.json({ ok: false, error: sent.error }, { status: 502 });
        break;
      }
      case "offer-submitted":
        await sendOfferSubmittedEmail(body);
        break;
      default:
        return NextResponse.json({ ok: false, error: "סוג הודעה לא ידוע." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Email failures should never block the underlying case action that
    // triggered them — the caller fires this and doesn't await failure here.
    const message = err instanceof Error ? err.message : String(err);
    console.error("Notification dispatch failed:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
