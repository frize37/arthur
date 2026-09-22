import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

export interface PublicAdvisor {
  id: string;
  name: string;
  specialty: string;
  logoUrl: string | null;
}

/**
 * The advisor roster shown on the landing page. Read with the service key
 * because the page is public and `advisors` is only readable by signed-in
 * users — and only the three harmless columns are selected, never email or
 * commission.
 */
export async function fetchPublicAdvisors(): Promise<PublicAdvisor[]> {
  const { data, error } = await supabaseAdmin
    .from("advisors")
    .select("id, name, specialty, logo_url")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch public advisors:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: (row.name as string) ?? "",
    specialty: (row.specialty as string) ?? "",
    logoUrl: (row.logo_url as string | null) ?? null,
  }));
}
