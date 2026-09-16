import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { sendAdvisorAssignedEmail, sendCaseSubmittedEmails, sendOfferSubmittedEmail, sendWinnerChosenEmails } from "@/lib/email";

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
