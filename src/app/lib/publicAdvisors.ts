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
 * users — and only the harmless columns are selected, never email or
 * commission. Advisors the office has taken off the site are filtered out.
 */
export async function fetchPublicAdvisors(): Promise<PublicAdvisor[]> {
  const { data, error } = await supabaseAdmin
    .from("advisors")
    .select("id, name, specialty, public_name, public_specialty, logo_url, is_public")
    .eq("is_public", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch public advisors:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    // The trading name is what the public sees; the legal name is the fallback.
    name: ((row.public_name as string | null) || (row.name as string)) ?? "",
    specialty: ((row.public_specialty as string | null) || (row.specialty as string)) ?? "",
    logoUrl: (row.logo_url as string | null) ?? null,
  }));
}
