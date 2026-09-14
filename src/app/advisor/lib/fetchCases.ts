import { createClient } from "@/lib/supabase/client";
import { AdvisorCase } from "./data";

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

export async function fetchMyCases(advisorId: string): Promise<AdvisorCase[]> {
  const supabase = createClient();

  const { data: assignmentRows, error: assignErr } = await supabase
    .from("case_advisors")
    .select("case_id")
    .eq("advisor_id", advisorId);
  if (assignErr || !assignmentRows || assignmentRows.length === 0) {
    if (assignErr) console.error("Failed to fetch assignments:", assignErr.message);
    return [];
  }
  const caseIds = assignmentRows.map((a) => a.case_id);

  const { data: caseRows, error: caseErr } = await supabase
    .from("cases")
    .select("*")
    .in("id", caseIds)
    .order("created_at", { ascending: false });
  if (caseErr || !caseRows) {
    console.error("Failed to fetch cases:", caseErr?.message);
    return [];
  }

  const { data: offerRows, error: offerErr } = await supabase
    .from("offers")
    .select("*")
    .eq("advisor_id", advisorId)
    .in("case_id", caseIds);
  if (offerErr) {
    console.error("Failed to fetch offers:", offerErr.message);
  }

  return caseRows.map((row): AdvisorCase => {
    const myOffer = (offerRows ?? []).find((o) => o.case_id === row.id);
    const status: AdvisorCase["status"] =
      row.status === "sent" || row.status === "closed"
        ? myOffer?.is_winner
          ? "won"
          : "lost"
        : myOffer
        ? "sent"
        : "pending";

    return {
      id: row.id,
      receivedAt: relativeTime(row.created_at),
      status,
      requestType: row.request_type,
      goal: row.goal,
      complex: row.complex,
      property: { value: row.property_value ?? 0, mortgage: row.mortgage_amount ?? 0, legal: row.property_legal ?? "tabu" },
      repayment: { comfort: row.comfort_payment ?? 0, max: row.max_stress_payment ?? 0 },
      planning: {
        futureRelease: row.future_release ?? "no",
        upcomingEvent: row.upcoming_event ?? "none",
        incomeChange: row.income_change ?? "no",
      },
      profile: {
        hasSecond: row.has_second_applicant ?? "no",
        employment1: row.employment1 ?? "salaried",
        seniority1: row.seniority1 ?? "over3",
        employment2: row.employment2 ?? undefined,
        seniority2: row.seniority2 ?? undefined,
      },
      income: { net: row.income ?? 0, extra: row.extra ?? 0 },
      credit: { otherLoans: row.other_loans ?? "no", creditIssues: row.credit_issues ?? "no" },
      doc: { balance: row.doc_balance ?? 0, rate: row.doc_rate ?? 0, years: row.doc_years ?? 0, months: row.doc_months ?? 0 },
      offer: myOffer ? { savings: Number(myOffer.savings ?? 0), fee: Number(myOffer.fee ?? 0) } : undefined,
    };
  });
}

export async function submitOffer(
  caseId: string,
  advisorId: string,
  offer: { savings: number; fee: number; notes: string }
) {
  const supabase = createClient();
  const { error } = await supabase.from("offers").insert({
    case_id: caseId,
    advisor_id: advisorId,
    savings: offer.savings,
    fee: offer.fee,
    notes: offer.notes,
  });
  if (error) {
    console.error("Failed to submit offer:", error.message);
    return false;
  }
  return true;
}
