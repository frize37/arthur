import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface PublicStats {
  casesChecked: number;
  casesClosed: number;
  totalSavings: number;
  totalMortgageVolume: number;
}

export async function fetchPublicStats(): Promise<PublicStats> {
  const [{ count: casesChecked }, { count: casesClosed }, { data: winningOffers }, { data: cases }] = await Promise.all([
    supabaseAdmin.from("cases").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("cases").select("id", { count: "exact", head: true }).eq("status", "closed"),
    supabaseAdmin.from("offers").select("savings").eq("is_winner", true),
    supabaseAdmin.from("cases").select("mortgage_amount"),
  ]);

  const totalSavings = (winningOffers ?? []).reduce((sum, o) => sum + Number(o.savings ?? 0), 0);
  const totalMortgageVolume = (cases ?? []).reduce((sum, c) => sum + Number(c.mortgage_amount ?? 0), 0);

  return {
    casesChecked: casesChecked ?? 0,
    casesClosed: casesClosed ?? 0,
    totalSavings,
    totalMortgageVolume,
  };
}
