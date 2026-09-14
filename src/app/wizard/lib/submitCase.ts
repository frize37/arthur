import { supabase } from "@/lib/supabase/client";
import { WizardState, isComplexCase } from "./types";

export async function submitCaseToDatabase(state: WizardState) {
  const row = {
    status: "awaiting",
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
    credit_issues: state.creditIssues,

    doc_confirmed: state.docConfirmed,
    doc_skipped: state.docSkipped,
    doc_balance: state.docBalance,
    doc_rate: state.docRate,
    doc_years: state.docYears,
    doc_months: state.docMonths,

    contact_name: state.contactName,
    contact_phone: state.contactPhone,
    contact_email: state.contactEmail,
    contact_time: state.contactTime,
    phone_verified: true,
    email_verified: true,
  };

  const { data, error } = await supabase.from("cases").insert(row).select("id").single();
  if (error) {
    console.error("Failed to submit case to database:", error.message);
    return null;
  }
  return data.id as string;
}
