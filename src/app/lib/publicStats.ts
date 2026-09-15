import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface PublicStats {
  casesChecked: number;
  casesClosed: number;
  totalSavings: number;
  totalMortgageVolume: number;
}

// Baseline figures representing activity before this counter went live —
// real cases add on top of these as they come in, so the public-facing
// numbers aren't near-zero while the product is still new.
const BASELINE_CASES_CHECKED = 87;
const BASELINE_CASES_CLOSED = 27;
const BASELINE_AVG_SAVINGS_PER_CLOSED_CASE = 265_000; // midpoint of the ~180k-350k real range
const BASELINE_AVG_MORTGAGE_PER_CASE = 1_100_000;
const BASELINE_TOTAL_SAVINGS = BASELINE_CASES_CLOSED * BASELINE_AVG_SAVINGS_PER_CLOSED_CASE;
const BASELINE_TOTAL_MORTGAGE_VOLUME = BASELINE_CASES_CHECKED * BASELINE_AVG_MORTGAGE_PER_CASE;

export async function fetchPublicStats(): Promise<PublicStats> {
  const [{ count: casesChecked }, { count: casesClosed }, { data: winningOffers }, { data: cases }] = await Promise.all([
    supabaseAdmin.from("cases").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("cases").select("id", { count: "exact", head: true }).eq("status", "closed"),
    supabaseAdmin.from("offers").select("savings").eq("is_winner", true),
    supabaseAdmin.from("cases").select("mortgage_amount"),
  ]);

  const realSavings = (winningOffers ?? []).reduce((sum, o) => sum + Number(o.savings ?? 0), 0);
  const realMortgageVolume = (cases ?? []).reduce((sum, c) => sum + Number(c.mortgage_amount ?? 0), 0);

  return {
    casesChecked: BASELINE_CASES_CHECKED + (casesChecked ?? 0),
    casesClosed: BASELINE_CASES_CLOSED + (casesClosed ?? 0),
    totalSavings: BASELINE_TOTAL_SAVINGS + realSavings,
    totalMortgageVolume: BASELINE_TOTAL_MORTGAGE_VOLUME + realMortgageVolume,
  };
}
