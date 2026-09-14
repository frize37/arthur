import { createClient } from "@/lib/supabase/client";
import { bandFor, monthlyPayment } from "../../wizard/lib/finance";
import { Advisor, AdminCase, Offer } from "./data";

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "אתמול";
  if (days < 7) return `לפני ${days} ימים`;
  return `לפני ${Math.floor(days / 7)} שבועות`;
}

export async function fetchAdvisors(): Promise<Record<string, Advisor>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("advisors").select("*").order("cases_won", { ascending: false });
  if (error || !data) {
    console.error("Failed to fetch advisors:", error?.message);
    return {};
  }
  const map: Record<string, Advisor> = {};
  for (const row of data) {
    map[row.id] = {
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      rating: Number(row.rating),
      casesWon: row.cases_won,
      avgResponseHours: Number(row.avg_response_hours),
    };
  }
  return map;
}

export async function fetchCases(): Promise<AdminCase[]> {
  const supabase = createClient();
  const { data: caseRows, error: caseErr } = await supabase.from("cases").select("*").order("created_at", { ascending: false });
  if (caseErr || !caseRows) {
    console.error("Failed to fetch cases:", caseErr?.message);
    return [];
  }
  const { data: offerRows, error: offerErr } = await supabase.from("offers").select("*");
  if (offerErr) {
    console.error("Failed to fetch offers:", offerErr.message);
  }
  const { data: assignmentRows, error: assignErr } = await supabase.from("case_advisors").select("case_id, advisor_id");
  if (assignErr) {
    console.error("Failed to fetch case assignments:", assignErr.message);
  }

  return caseRows.map((row): AdminCase => {
    const totalMonths = (row.doc_years ?? 0) * 12 + (row.doc_months ?? 0);
    const payment = monthlyPayment(row.doc_balance ?? 0, row.doc_rate ?? 0, totalMonths);
    const income = (row.income ?? 0) + (row.extra ?? 0);
    const band = bandFor(payment, row.comfort_payment ?? 0, row.max_stress_payment ?? Infinity);

    const offers: Offer[] = (offerRows ?? [])
      .filter((o) => o.case_id === row.id)
      .map((o) => ({
        advisorId: o.advisor_id,
        savings: Number(o.savings ?? 0),
        fee: Number(o.fee ?? 0),
        notes: o.notes ?? "",
        submittedAt: relativeTime(o.submitted_at),
        winner: o.is_winner,
      }));

    return {
      id: row.id,
      receivedAt: relativeTime(row.created_at),
      status: row.status,
      requestType: row.request_type,
      goal: row.goal,
      complex: row.complex,
      client: {
        name: row.contact_name ?? "—",
        phone: row.contact_phone ?? "—",
        email: row.contact_email ?? "—",
        phoneVerified: row.phone_verified,
        emailVerified: row.email_verified,
      },
      brief: {
        propertyValue: row.property_value ?? 0,
        mortgage: row.mortgage_amount ?? 0,
        income,
        ratioBand: band,
      },
      offers,
      timeline: [
        { label: "התיק נקלט מהאשף", time: relativeTime(row.created_at) },
        ...(row.phone_verified && row.email_verified ? [{ label: "זהות אומתה (טלפון+מייל)", time: relativeTime(row.created_at) }] : []),
      ],
      assignedAdvisorIds: (assignmentRows ?? []).filter((a) => a.case_id === row.id).map((a) => a.advisor_id),
    };
  });
}

export async function assignAdvisorsToCase(caseId: string, advisorIds: string[]) {
  const supabase = createClient();
  const { error: insertErr } = await supabase
    .from("case_advisors")
    .insert(advisorIds.map((advisor_id) => ({ case_id: caseId, advisor_id })));
  if (insertErr) {
    console.error("Failed to assign advisors:", insertErr.message);
    return false;
  }
  const { error: updateErr } = await supabase.from("cases").update({ status: "awaiting" }).eq("id", caseId);
  if (updateErr) {
    console.error("Failed to update case status after assignment:", updateErr.message);
    return false;
  }
  return true;
}

export async function persistWinner(caseId: string, offers: Offer[]) {
  const supabase = createClient();
  await Promise.all(
    offers.map((o) =>
      supabase
        .from("offers")
        .update({ is_winner: !!o.winner })
        .eq("case_id", caseId)
        .eq("advisor_id", o.advisorId)
    )
  );
  await supabase.from("cases").update({ status: "sent" }).eq("id", caseId);
}
