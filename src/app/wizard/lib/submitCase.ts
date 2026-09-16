import { createClient } from "@/lib/supabase/client";
import { WizardState, isComplexCase } from "./types";

export async function submitCaseToDatabase(state: WizardState) {
  const caseId = state.caseId;
  const row = {
    id: caseId,
    status: "new",
    complex: isComplexCase(state),

    request_type: state.requestType,
    goal: state.goal,

    property_source: state.propertySource,
    property_legal: state.propertyLegal,
    property_value: state.propertyValue,
    mortgage_amount: state.mortgageAmount,
    equity: state.equity,

    comfort_payment: state.comfortPayment,
    max_stress_payment: state.maxStressPayment,

    future_release: state.futureRelease,
    future_release_amount: state.futureReleaseAmount,
    future_release_timing: state.futureReleaseTiming,
    upcoming_event: state.upcomingEvent,
    income_change: state.incomeChange,

    has_second_applicant: state.hasSecondApplicant,
    employment1: state.employment1,
    seniority1: state.seniority1,
    employment2: state.employment2,
    seniority2: state.seniority2,
    income: state.income,
    extra: state.extra,

    other_loans: state.otherLoans,
    other_loans_payment: state.otherLoansPayment,
    other_loans_ending_soon: state.otherLoansEndingSoon,
    other_loans_months_left: state.otherLoansMonthsLeft,
    credit_issues: state.creditIssues,

    doc_confirmed: state.docConfirmed,
    doc_source: state.docSource,
    original_doc_name: state.originalDocName,
    original_doc_type: state.originalDocType,
    doc_balance: state.docBalance,
    doc_rate: state.docRate,
    doc_years: state.docYears,
    doc_months: state.docMonths,
    doc_quote_valid_date: state.docQuoteValidDate,
    doc_total_principal: state.docTotalPrincipal,
    doc_total_early_repayment_fee: state.docTotalEarlyRepaymentFee,
    doc_total_payoff: state.docTotalPayoff,
    doc_account_comparison_rate: state.docAccountComparisonRate,
    doc_account_forecast_rate: state.docAccountForecastRate,

    contact_name: state.contactName,
    contact_phone: state.contactPhone,
    contact_email: state.contactEmail,
    contact_time: state.contactTime,
    phone_verified: false,
    email_verified: true,
  };

  try {
    const supabase = createClient();
    // Plain insert, no .select() — the public wizard runs as the anonymous
    // role, which (correctly) has no SELECT policy on cases, so asking
    // Postgres to return the inserted row via RETURNING fails RLS even
    // though the insert itself succeeds.
    const { error } = await supabase.from("cases").insert(row);
    if (error) {
      console.error("Failed to submit case to database:", error.message);
      return { ok: false as const, error: error.message };
    }

    if (state.docTracks.length > 0) {
      const trackRows = state.docTracks.map((t, i) => ({
        case_id: caseId,
        track_order: i + 1,
        bank_name: t.bankName,
        rate_kind: t.rateKind,
        anchor_basis: t.anchorBasis,
        linked_to_cpi: t.linkedToCpi,
        repayment_method: t.repaymentMethod,
        annual_rate: t.annualRate,
        anchor_rate: t.anchorRate,
        margin_rate: t.marginRate,
        next_rate_change_date: t.nextRateChangeDate,
        months_remaining: t.monthsRemaining,
        principal_balance: t.principalBalance,
        accrued_interest: t.accruedInterest,
        arrears_balance: t.arrearsBalance,
        arrears_interest: t.arrearsInterest,
        payoff_balance: t.payoffBalance,
        early_repayment_fee: t.earlyRepaymentFee,
        comparison_rate: t.comparisonRate,
        forecast_rate: t.forecastRate,
      }));
      const { error: tracksError } = await supabase.from("case_loan_tracks").insert(trackRows);
      if (tracksError) {
        // Don't fail the whole submission over this — the case itself is
        // already saved with the blended fallback numbers.
        console.error("Failed to submit loan tracks:", tracksError.message);
      }
    }

    // Fire-and-forget: a broken mail relay must never block the client's
    // submission from succeeding.
    fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "case-submitted",
        caseId,
        contactName: state.contactName,
        contactEmail: state.contactEmail,
        requestType: state.requestType,
        mortgageAmount: state.mortgageAmount,
        propertyValue: state.propertyValue,
      }),
    }).catch((err) => console.error("Failed to trigger case-submitted email:", err));

    return { ok: true as const };
  } catch (err) {
    // Network-level failures (blocked request, DNS, offline, content filter, etc.)
    // throw instead of returning { error }, so they must be caught explicitly.
    const message = err instanceof Error ? err.message : String(err);
    console.error("Network error submitting case to database:", message);
    return { ok: false as const, error: `שגיאת רשת: ${message}` };
  }
}
