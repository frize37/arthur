import { createClient } from "@/lib/supabase/client";
import { AdvisorCase, LoanTrack } from "./data";

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

  // advisor_cases is a view that only reveals contact_name/phone/email
  // once this advisor's offer has actually won the case — querying
  // `cases` directly would return those columns for every assigned case.
  const { data: caseRows, error: caseErr } = await supabase
    .from("advisor_cases")
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

  const { data: trackRows, error: trackErr } = await supabase
    .from("case_loan_tracks")
    .select("*")
    .in("case_id", caseIds)
    .order("track_order", { ascending: true });
  if (trackErr) {
    console.error("Failed to fetch loan tracks:", trackErr.message);
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
      credit: {
        otherLoans: row.other_loans ?? "no",
        otherLoansEndingSoon: row.other_loans_ending_soon ?? undefined,
        otherLoansMonthsLeft: row.other_loans_months_left ?? undefined,
        creditIssues: row.credit_issues ?? "no",
      },
      doc: { balance: row.doc_balance ?? 0, rate: row.doc_rate ?? 0, years: row.doc_years ?? 0, months: row.doc_months ?? 0 },
      docTracks: (trackRows ?? [])
        .filter((t) => t.case_id === row.id)
        .map(
          (t): LoanTrack => ({
            bankName: t.bank_name,
            rateKind: t.rate_kind,
            anchorBasis: t.anchor_basis,
            linkedToCpi: t.linked_to_cpi,
            repaymentMethod: t.repayment_method,
            annualRate: t.annual_rate != null ? Number(t.annual_rate) : null,
            anchorRate: t.anchor_rate != null ? Number(t.anchor_rate) : null,
            marginRate: t.margin_rate != null ? Number(t.margin_rate) : null,
            nextRateChangeDate: t.next_rate_change_date,
            monthsRemaining: t.months_remaining,
            principalBalance: t.principal_balance != null ? Number(t.principal_balance) : null,
            accruedInterest: t.accrued_interest != null ? Number(t.accrued_interest) : null,
            arrearsBalance: t.arrears_balance != null ? Number(t.arrears_balance) : null,
            arrearsInterest: t.arrears_interest != null ? Number(t.arrears_interest) : null,
            payoffBalance: t.payoff_balance != null ? Number(t.payoff_balance) : null,
            earlyRepaymentFee: t.early_repayment_fee != null ? Number(t.early_repayment_fee) : null,
            comparisonRate: t.comparison_rate != null ? Number(t.comparison_rate) : null,
            forecastRate: t.forecast_rate != null ? Number(t.forecast_rate) : null,
          })
        ),
      docTotals: {
        quoteValidDate: row.doc_quote_valid_date ?? null,
        totalPrincipal: row.doc_total_principal != null ? Number(row.doc_total_principal) : null,
        totalEarlyRepaymentFee: row.doc_total_early_repayment_fee != null ? Number(row.doc_total_early_repayment_fee) : null,
        totalPayoff: row.doc_total_payoff != null ? Number(row.doc_total_payoff) : null,
        accountComparisonRate: row.doc_account_comparison_rate != null ? Number(row.doc_account_comparison_rate) : null,
        accountForecastRate: row.doc_account_forecast_rate != null ? Number(row.doc_account_forecast_rate) : null,
      },
      offer: myOffer ? { savings: Number(myOffer.savings ?? 0), fee: Number(myOffer.fee ?? 0) } : undefined,
      client:
        row.contact_name || row.contact_phone || row.contact_email
          ? { name: row.contact_name ?? "", phone: row.contact_phone ?? "", email: row.contact_email ?? "" }
          : undefined,
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
