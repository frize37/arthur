import { createClient } from "@/lib/supabase/client";
import { bandFor, monthlyPayment } from "../../wizard/lib/finance";
import { Advisor, AdminCase, LoanTrack, Offer } from "./data";

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
  const { data, error } = await supabase.from("advisors_directory").select("*").order("cases_won", { ascending: false });
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
      email: row.email ?? null,
      commissionType: row.commission_type ?? null,
      commissionValue: row.commission_value != null ? Number(row.commission_value) : null,
      logoUrl: row.logo_url ?? null,
    };
  }
  return map;
}

export async function uploadAdvisorLogo(advisorId: string, file: File): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const path = `${advisorId}/${Date.now()}-${file.name}`;
  const { error: uploadErr } = await supabase.storage.from("advisor-logos").upload(path, file, { upsert: true });
  if (uploadErr) {
    console.error("Failed to upload advisor logo:", uploadErr.message);
    return { ok: false, error: uploadErr.message };
  }
  const { data } = supabase.storage.from("advisor-logos").getPublicUrl(path);
  const { error: updateErr } = await supabase.from("advisors").update({ logo_url: data.publicUrl }).eq("id", advisorId);
  if (updateErr) {
    console.error("Failed to save advisor logo url:", updateErr.message);
    return { ok: false, error: updateErr.message };
  }
  return { ok: true, url: data.publicUrl };
}

export async function createAdvisorAccount(input: {
  name: string;
  email: string;
  specialty: string;
  commissionType: "percent" | "fixed";
  commissionValue: number;
}): Promise<{ ok: true; password: string } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/create-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "advisor", ...input }),
  });
  const json = await res.json();
  if (!json.ok) return { ok: false, error: json.error ?? "יצירת היועץ נכשלה." };
  return { ok: true, password: json.password };
}

export async function createAdminAccount(input: {
  name: string;
  email: string;
  adminRole: "admin" | "staff";
}): Promise<{ ok: true; password: string } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/create-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "admin", ...input }),
  });
  const json = await res.json();
  if (!json.ok) return { ok: false, error: json.error ?? "יצירת איש הצוות נכשלה." };
  return { ok: true, password: json.password };
}

export async function deleteAdvisorAccount(advisorId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/admin/delete-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ advisorId }),
  });
  const json = await res.json();
  if (!json.ok) return { ok: false, error: json.error ?? "מחיקת היועץ נכשלה." };
  return { ok: true };
}

export async function updateAdvisorCommission(advisorId: string, commissionType: "percent" | "fixed", commissionValue: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from("advisors")
    .update({ commission_type: commissionType, commission_value: commissionValue })
    .eq("id", advisorId);
  if (error) {
    console.error("Failed to update advisor commission:", error.message);
    return false;
  }
  return true;
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
  const { data: trackRows, error: trackErr } = await supabase
    .from("case_loan_tracks")
    .select("*")
    .order("track_order", { ascending: true });
  if (trackErr) {
    console.error("Failed to fetch loan tracks:", trackErr.message);
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
        ...(row.email_verified ? [{ label: "זהות אומתה (מייל)", time: relativeTime(row.created_at) }] : []),
      ],
      assignedAdvisorIds: (assignmentRows ?? []).filter((a) => a.case_id === row.id).map((a) => a.advisor_id),
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
      docSource: row.doc_source ?? null,
      originalDocName: row.original_doc_name ?? null,
      originalDocType: row.original_doc_type ?? null,
      cleanDocName: row.clean_doc_name ?? null,
      cleanDocType: row.clean_doc_type ?? null,
      completionNote: row.completion_note ?? null,
      completedBy: row.completed_by ?? null,
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

export async function markCaseCompleted(caseId: string, note: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cases")
    .update({ status: "closed", completion_note: note || null, completed_by: "admin" })
    .eq("id", caseId);
  if (error) {
    console.error("Failed to mark case completed:", error.message);
    return false;
  }
  return true;
}

export async function markCaseNoDeal(caseId: string, note: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("cases")
    .update({ status: "closed_no_deal", completion_note: note || null, completed_by: "admin" })
    .eq("id", caseId);
  if (error) {
    console.error("Failed to mark case as no-deal:", error.message);
    return false;
  }
  return true;
}

export async function getCaseDocUrl(caseId: string, kind: "original" | "clean"): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from("case-documents").createSignedUrl(`${kind}/${caseId}`, 60);
  if (error || !data) {
    console.error(`Failed to create signed URL for ${kind} doc:`, error?.message);
    return null;
  }
  return data.signedUrl;
}

export async function uploadCleanDoc(caseId: string, file: File): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const { error: uploadErr } = await supabase.storage
    .from("case-documents")
    .upload(`clean/${caseId}`, file, { upsert: true, contentType: file.type });
  if (uploadErr) return { ok: false, error: uploadErr.message };
  const { error: updateErr } = await supabase
    .from("cases")
    .update({ clean_doc_name: file.name, clean_doc_type: file.type })
    .eq("id", caseId);
  if (updateErr) return { ok: false, error: updateErr.message };
  return { ok: true };
}
